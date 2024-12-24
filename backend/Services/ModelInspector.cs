using Microsoft.ML;
using System;

namespace backend.Services
{
    public class ModelInspector
    {
        public static void InspectModel(string modelPath)
        {
            var context = new MLContext();

            ITransformer model = context.Model.Load(modelPath, out DataViewSchema schema);

            Console.WriteLine("Model Schema:");
            foreach (var column in schema)
            {
                Console.WriteLine($"Column Name: {column.Name}, Column Type: {column.Type}");
            }

            Console.WriteLine("\nModel Pipeline:");
            Console.WriteLine(model.ToString());
        }
    }
}
