using backend.Models;
using Microsoft.ML;
using System.Collections.Generic;
using System.Linq;
using Microsoft.ML.Data;

namespace backend.Services
{
    public class MLModel
    {
        public static void TrainAndSaveModel(List<Rating> ratings)
        {
            var context = new MLContext();

            // Add synthetic data for testing (Optional)
            ratings.Add(new Rating { UserID = 100, LocationID = 200, UserRating = 5 });
            ratings.Add(new Rating { UserID = 100, LocationID = 250, UserRating = 2 });
            ratings.Add(new Rating { UserID = 100, LocationID = 265, UserRating = 3 });
            ratings.Add(new Rating { UserID = 100, LocationID = 170, UserRating = 4 });
            ratings.Add(new Rating { UserID = 101, LocationID = 200, UserRating = 3 });
            ratings.Add(new Rating { UserID = 102, LocationID = 250, UserRating = 4 });


            var ratingData = ratings.Select(r => new RatingData
            {
                UserID = r.UserID,
                LocationID = r.LocationID,
                Rating = r.UserRating
            }).ToList();

            // Load the data into an IDataView
            var data = context.Data.LoadFromEnumerable(ratingData);
            Console.WriteLine("Schema:");
            foreach (var column in data.Schema)
            {
                Console.WriteLine($"Column Name: {column.Name}, Type: {column.Type}");
            }

            // Define the pipeline
            var pipeline = context.Transforms.Conversion.ConvertType(
                        outputColumnName: "UserIDFloat", inputColumnName: "UserID", outputKind: DataKind.Single)
                    .Append(context.Transforms.Conversion.ConvertType(
                        outputColumnName: "LocationIDFloat", inputColumnName: "LocationID", outputKind: DataKind.Single))
                    .Append(context.Transforms.NormalizeMinMax("UserIDFloat", "UserIDFloat"))
                    .Append(context.Transforms.NormalizeMinMax("LocationIDFloat", "LocationIDFloat"))
                    .Append(context.Transforms.Concatenate("Features", "UserIDFloat", "LocationIDFloat"))
                    .Append(context.Transforms.CopyColumns(outputColumnName: "Label", inputColumnName: "Rating"))
                    .Append(context.Regression.Trainers.Sdca());

            // Create train-test split
            var trainTestSplit = context.Data.TrainTestSplit(data, testFraction: 0.2);

            // Train the model
            var model = pipeline.Fit(trainTestSplit.TrainSet);

            // Evaluate the model
            var predictions = model.Transform(trainTestSplit.TestSet);
            var metrics = context.Regression.Evaluate(predictions, labelColumnName: "Label");

            Console.WriteLine($"R^2: {metrics.RSquared}, RMSE: {metrics.RootMeanSquaredError}");

            // Check sample predictions
            Console.WriteLine("Predictions:");
            var scoredData = context.Data.CreateEnumerable<RatingPrediction>(predictions, reuseRowObject: false);
            foreach (var prediction in scoredData.Take(5)) // Limit to 5 for brevity
            {
                Console.WriteLine($"Predicted: {prediction.PredictedRating}");
            }

            // Save the model to a file
            context.Model.Save(model, data.Schema, "RatingModel.zip");
            Console.WriteLine("Model trained and saved successfully.");
        }
    }
}
