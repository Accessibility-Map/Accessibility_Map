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
                UserRating = r.UserRating
            }).ToList();

            // Load the data into an IDataView
            var data = context.Data.LoadFromEnumerable(ratingData);

            // Convert UserID and LocationID to float before concatenating into Features
            var pipeline = context.Transforms.Conversion.ConvertType(
                                outputColumnName: "UserIDFloat", inputColumnName: "UserID", outputKind: DataKind.Single)
                           .Append(context.Transforms.Conversion.ConvertType(
                                outputColumnName: "LocationIDFloat", inputColumnName: "LocationID", outputKind: DataKind.Single))
                           .Append(context.Transforms.Concatenate("Features", "UserIDFloat", "LocationIDFloat"))
                           .Append(context.Regression.Trainers.Sdca());

            // Train the model
            var model = pipeline.Fit(data);

            // Save the model to a file
            context.Model.Save(model, data.Schema, "RatingModel.zip");
            Console.WriteLine("Model trained and saved successfully.");

        }

    }
}
