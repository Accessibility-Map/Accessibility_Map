using Microsoft.ML.Data;

public class RatingData
{
    [LoadColumn(0)]
    public float UserID { get; set; }

    [LoadColumn(1)]
    public float LocationID { get; set; }

    [LoadColumn(2), ColumnName("Rating")] // Matches the database column
    public float Rating { get; set; } // Matches the database column name
}
