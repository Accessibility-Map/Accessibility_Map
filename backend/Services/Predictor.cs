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
                // Initialize MLContext
                var context = new MLContext();

                // Load the trained ML model
                ITransformer model = context.Model.Load("RatingModel.zip", out var schema);

                // Debug log: Verify schema
                Console.WriteLine("Loaded model schema:");
                foreach (var column in schema)
                {
                    Console.WriteLine($"Column: {column.Name}, Type: {column.Type}");
                }

                // Create a prediction engine
                var predictionEngine = context.Model.CreatePredictionEngine<RatingData, RatingPrediction>(model);

                // Prepare the input data
                var input = new RatingData
                {
                    UserID = userID,    // Actual UserID passed as a parameter
                    LocationID = locationID // Actual LocationID passed as a parameter
                };

                // Debug log: Verify input data
                Console.WriteLine($"Input UserID: {input.UserID}, Input LocationID: {input.LocationID}");

                // Make the prediction
                var prediction = predictionEngine.Predict(input);

                // Debug log: Output prediction
                Console.WriteLine($"Predicted Rating: {prediction.PredictedRating}");

                // Return the predicted score
                return prediction.PredictedRating;
            }
            catch (Exception ex)
            {
                // Log exception for debugging
                Console.WriteLine($"Error during prediction: {ex.Message}");
                throw;
            }
        }
    }
}
