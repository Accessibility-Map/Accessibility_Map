using Microsoft.ML;
using Microsoft.ML.Data;
using System;
using System.IO;

public class Predictor
{
    private readonly MLContext _mlContext;
    private readonly ITransformer _trainedModel;
    private readonly string _modelPath;

    public Predictor()
    {
        _mlContext = new MLContext();
        _modelPath = Path.Combine(Directory.GetCurrentDirectory(), "model.zip");

        if (File.Exists(_modelPath))
        {
            _trainedModel = _mlContext.Model.Load(_modelPath, out _);
            Console.WriteLine("✅ Model loaded successfully.");
        }
        else
        {
            Console.WriteLine("⚠️ Warning: Model file not found. Please train the model first.");
            _trainedModel = null;
        }
    }

    public RatingPrediction PredictRating(RatingData input)
    {
        if (_trainedModel == null)
        {
            throw new InvalidOperationException("❌ Model is not loaded. Train the model before making predictions.");
        }

        using var predictionEngine = _mlContext.Model.CreatePredictionEngine<RatingData, RatingPrediction>(_trainedModel);
        float rawPrediction = predictionEngine.Predict(input).Score;

        float clampedPrediction = Math.Clamp(rawPrediction, 1f, 5f);

        return new RatingPrediction { Score = clampedPrediction };
    }
}