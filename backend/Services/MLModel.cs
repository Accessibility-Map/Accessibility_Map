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

            var ratingData = ratings.Select(r => new RatingData
            {
                UserID = r.UserID,
                LocationID = r.LocationID,
                Rating = r.UserRating
            }).ToList();

            var data = context.Data.LoadFromEnumerable(ratingData);
            Console.WriteLine("Schema:");
            foreach (var column in data.Schema)
            {
                Console.WriteLine($"Column Name: {column.Name}, Type: {column.Type}");
            }

            var pipeline = context.Transforms.Conversion.ConvertType(
                        outputColumnName: "UserIDFloat", inputColumnName: "UserID", outputKind: DataKind.Single)
                    .Append(context.Transforms.Conversion.ConvertType(
                        outputColumnName: "LocationIDFloat", inputColumnName: "LocationID", outputKind: DataKind.Single))
                    .Append(context.Transforms.NormalizeMinMax("UserIDFloat", "UserIDFloat"))
                    .Append(context.Transforms.NormalizeMinMax("LocationIDFloat", "LocationIDFloat"))
                    .Append(context.Transforms.Concatenate("Features", "UserIDFloat", "LocationIDFloat"))
                    .Append(context.Transforms.CopyColumns(outputColumnName: "Label", inputColumnName: "Rating"))
                    .Append(context.Regression.Trainers.Sdca());

            var trainTestSplit = context.Data.TrainTestSplit(data, testFraction: 0.1);

            var model = pipeline.Fit(trainTestSplit.TrainSet);

            var predictions = model.Transform(trainTestSplit.TestSet);
            var metrics = context.Regression.Evaluate(predictions, labelColumnName: "Label");

            Console.WriteLine($"R^2: {metrics.RSquared}, RMSE: {metrics.RootMeanSquaredError}");

            Console.WriteLine("Predictions:");
            var scoredData = context.Data.CreateEnumerable<RatingPrediction>(predictions, reuseRowObject: false);
            foreach (var prediction in scoredData.Take(5))
            {
                Console.WriteLine($"Predicted: {prediction.PredictedRating}");
            }

            context.Model.Save(model, data.Schema, "RatingModel.zip");
            Console.WriteLine("Model trained and saved successfully.");
        }
    }
}
