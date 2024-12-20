using backend.Models;
using Microsoft.ML;

namespace backend.Services
{
    public class Predictor
    {
        public static float PredictRating(int userID, int locationID)
        {
            // Initialize MLContext
            var context = new MLContext();

            // Load the trained ML model
            ITransformer model = context.Model.Load("RatingModel.zip", out var schema);

            // Create a prediction engine
            var predictionEngine = context.Model.CreatePredictionEngine<RatingData, RatingPrediction>(model);

            // Prepare the input data
            var input = new RatingData
            {
                UserID = (float)userID,
                LocationID = (float)locationID
            };

            // Make the prediction
            var prediction = predictionEngine.Predict(input);

            // Debug logs for inputs and predictions
            Console.WriteLine($"UserID: {input.UserID}, LocationID: {input.LocationID}");
            Console.WriteLine($"Predicted Score: {prediction.PredictedRating}");

            // Return the predicted score
            return prediction.PredictedRating;
        }
    }
}
