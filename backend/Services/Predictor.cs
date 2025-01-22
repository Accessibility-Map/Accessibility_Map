using backend.Models;
using Microsoft.ML;

namespace backend.Services
{
    public class Predictor
    {
        public static float PredictRating(int userID, int locationID, float featureCount)
        {
            try
            {
                var context = new MLContext();

                // Load the trained model
                ITransformer model = context.Model.Load("RatingModel.zip", out var schema);

                // Create a prediction engine
                var predictionEngine = context.Model.CreatePredictionEngine<RatingData, RatingPrediction>(model);

                // Prepare the input data
                var input = new RatingData
                {
                    UserID = userID,
                    LocationID = locationID,
                    FeatureCount = featureCount 
                };

                // Predict the rating
                var prediction = predictionEngine.Predict(input);

                return Math.Clamp(prediction.PredictedRating, 1.0f, 5.0f);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during prediction: {ex.Message}");
                throw;
            }
        }

    }
}

