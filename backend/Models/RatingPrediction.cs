using Microsoft.ML.Data;


public class RatingPrediction
{
    [ColumnName("Score")]
    public float PredictedRating { get; set; }
}