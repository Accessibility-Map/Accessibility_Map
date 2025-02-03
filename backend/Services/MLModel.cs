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
                Rating = r.UserRating,
                HasRamp = r.Location?.Features?.Any(f => f.LocationFeature == "Ramp") ?? false,
                HasElevator = r.Location?.Features?.Any(f => f.LocationFeature == "Elevator") ?? false,
                HasAccessibleBathroom = r.Location?.Features?.Any(f => f.LocationFeature == "Accessible Bathroom") ?? false,
                HasAccessibleParking = r.Location?.Features?.Any(f => f.LocationFeature == "Accessible Parking") ?? false
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
              .Append(context.Transforms.Conversion.ConvertType(
                  outputColumnName: "HasRampFloat", inputColumnName: "HasRamp", outputKind: DataKind.Single))
              .Append(context.Transforms.Conversion.ConvertType(
                  outputColumnName: "HasElevatorFloat", inputColumnName: "HasElevator", outputKind: DataKind.Single))
              .Append(context.Transforms.Conversion.ConvertType(
                  outputColumnName: "HasAccessibleBathroomFloat", inputColumnName: "HasAccessibleBathroom", outputKind: DataKind.Single))
              .Append(context.Transforms.Conversion.ConvertType(
                  outputColumnName: "HasAccessibleParkingFloat", inputColumnName: "HasAccessibleParking", outputKind: DataKind.Single))
              .Append(context.Transforms.NormalizeMinMax("UserIDFloat"))
              .Append(context.Transforms.NormalizeMinMax("LocationIDFloat"))
              .Append(context.Transforms.Concatenate("Features",
                  "UserIDFloat", "LocationIDFloat", "HasRampFloat", "HasElevatorFloat", "HasAccessibleBathroomFloat", "HasAccessibleParkingFloat"))
              .Append(context.Transforms.CopyColumns(outputColumnName: "Label", inputColumnName: "Rating"))
              .Append(context.Regression.Trainers.Sdca());


            var trainTestSplit = context.Data.TrainTestSplit(data, testFraction: 0.1);

            var model = pipeline.Fit(trainTestSplit.TrainSet);

            var predictions = model.Transform(trainTestSplit.TestSet);
            var metrics = context.Regression.Evaluate(predictions, labelColumnName: "Label");

            Console.WriteLine($"R^2: {metrics.RSquared}, RMSE: {metrics.RootMeanSquaredError}");

            context.Model.Save(model, data.Schema, "RatingModel.zip");
            Console.WriteLine("Model trained and saved successfully.");
        }
    }
}
