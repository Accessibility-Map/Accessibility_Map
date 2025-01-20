using backend.Models;
using Microsoft.ML;

namespace backend.Services
{
    public class Predictor
    {
        public static float PredictRating(int userID, int locationID)
        {
            try
            {
                var context = new MLContext();

                ITransformer model = context.Model.Load("RatingModel.zip", out var schema);

                Console.WriteLine("Loaded model schema:");
                foreach (var column in schema)
                {
                    Console.WriteLine($"Column: {column.Name}, Type: {column.Type}");
                }

                var predictionEngine = context.Model.CreatePredictionEngine<RatingData, RatingPrediction>(model);

                var input = new RatingData
                {
                    UserID = userID,
                    LocationID = locationID
                };

                Console.WriteLine($"Input UserID: {input.UserID}, Input LocationID: {input.LocationID}");

                var prediction = predictionEngine.Predict(input);

                prediction.PredictedRating = Math.Clamp(prediction.PredictedRating, 1.0f, 5.0f);

                Console.WriteLine($"Predicted Rating (clamped): {prediction.PredictedRating}");
                return prediction.PredictedRating;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during prediction: {ex.Message}");
                throw;
            }
        }
    }
}

