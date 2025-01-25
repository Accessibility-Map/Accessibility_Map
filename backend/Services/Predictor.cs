using backend.Models;
using Microsoft.ML;

namespace backend.Services
{
    public class Predictor
    {
        public static float PredictRating(int userID, int locationID, bool hasRamp, bool hasElevator, bool hasAccessibleBathroom, bool hasAccessibleParking)
        {
            try
            {
                var context = new MLContext();

                ITransformer model = context.Model.Load("RatingModel.zip", out var schema);

                var predictionEngine = context.Model.CreatePredictionEngine<RatingData, RatingPrediction>(model);

                var input = new RatingData
                {
                    UserID = userID,
                    LocationID = locationID,
                    HasRamp = hasRamp,
                    HasElevator = hasElevator,
                    HasAccessibleBathroom = hasAccessibleBathroom,
                    HasAccessibleParking = hasAccessibleParking
                };

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

