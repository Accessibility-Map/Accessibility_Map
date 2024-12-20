using Microsoft.ML.Data;

public class RatingData
{
    [LoadColumn(0)]
    public float UserID { get; set; } // Changed to float

    [LoadColumn(1)]
    public float LocationID { get; set; } // Changed to float

    [LoadColumn(2), ColumnName("Label")]
    public float UserRating { get; set; } // The column to be predicted
}
