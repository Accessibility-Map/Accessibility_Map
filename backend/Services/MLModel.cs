using Microsoft.ML;
using Microsoft.ML.Data;
using System.IO;
using backend.Models;
using System.Linq;
using System.Collections.Generic;
using System;

public class MLModel
{
    private readonly MLContext _mlContext;
    private ITransformer _trainedModel;
    private readonly string _modelPath;
    private readonly string _dataPath;

    public MLModel()
    {
        _mlContext = new MLContext();
        _modelPath = Path.Combine(Directory.GetCurrentDirectory(), "model.zip");
        _dataPath = Path.Combine(Directory.GetCurrentDirectory(), "data", "mlnet_compatible_dataset.csv");
    }

   public void TrainModel()
{
    if (!File.Exists(_dataPath))
    {
        Console.WriteLine($"❌ ERROR: Dataset file not found at {_dataPath}");
        throw new FileNotFoundException("Dataset file not found.", _dataPath);
    }
    Console.WriteLine($"✅ Dataset file found at {_dataPath}");

    IDataView data = _mlContext.Data.LoadFromTextFile<RatingData>(
        path: _dataPath,
        separatorChar: ',',
        hasHeader: true
    );

    var trainTestSplit = _mlContext.Data.TrainTestSplit(data, testFraction: 0.2);

   var pipeline = _mlContext.Transforms.CopyColumns(outputColumnName: "Label", inputColumnName: "Rating") 
    .Append(_mlContext.Transforms.Concatenate("Features",
        nameof(RatingData.HasRamp),
        nameof(RatingData.HasElevator),
        nameof(RatingData.HasAccessibleBathroom),
        nameof(RatingData.HasAccessibleParking)))
    .Append(_mlContext.Regression.Trainers.FastTree(labelColumnName: "Label")); 



    _trainedModel = pipeline.Fit(trainTestSplit.TrainSet);

    var predictions = _trainedModel.Transform(trainTestSplit.TestSet);
    var metrics = _mlContext.Regression.Evaluate(predictions, labelColumnName: "Label"); 

    Console.WriteLine($"📊 Model Performance -> R²: {metrics.RSquared}, RMSE: {metrics.RootMeanSquaredError}");
    _mlContext.Model.Save(_trainedModel, data.Schema, _modelPath);
    Console.WriteLine("✅ Model trained and saved successfully.");
}


    public void TrainAndSaveModel(List<Rating> ratings)
    {
        var ratingData = ratings.Select(r => new RatingData
        {
            HasRamp = (r.Location?.Features?.Any(f => f.LocationFeature == "Ramp") ?? false) ? 1f : 0f,
            HasElevator = (r.Location?.Features?.Any(f => f.LocationFeature == "Elevator") ?? false) ? 1f : 0f,
            HasAccessibleBathroom = (r.Location?.Features?.Any(f => f.LocationFeature == "Accessible Bathroom") ?? false) ? 1f : 0f,
            HasAccessibleParking = (r.Location?.Features?.Any(f => f.LocationFeature == "Accessible Parking") ?? false) ? 1f : 0f,

            Rating = r.UserRating
        }).ToList();

        IDataView data = _mlContext.Data.LoadFromEnumerable(ratingData);

        var pipeline = _mlContext.Transforms.Concatenate("Features",
        nameof(RatingData.HasRamp),
        nameof(RatingData.HasElevator),
        nameof(RatingData.HasAccessibleBathroom),
        nameof(RatingData.HasAccessibleParking))
    .Append(_mlContext.Regression.Trainers.FastTree(labelColumnName: "Rating"));


        _trainedModel = pipeline.Fit(data);
        _mlContext.Model.Save(_trainedModel, data.Schema, _modelPath);

        Console.WriteLine("✅ Model retrained and saved successfully.");
    }

    public ITransformer LoadModel()
    {
        if (!File.Exists(_modelPath))
        {
            Console.WriteLine($"❌ ERROR: Model file not found at {_modelPath}. Train the model first.");
            throw new FileNotFoundException("Model file not found.", _modelPath);
        }

        _trainedModel = _mlContext.Model.Load(_modelPath, out _);
        Console.WriteLine("✅ Model loaded successfully.");
        return _trainedModel;
    }
}