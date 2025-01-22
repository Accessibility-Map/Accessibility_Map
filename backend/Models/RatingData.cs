using Microsoft.ML.Data;

public class RatingData
{
    [LoadColumn(0)]
    public float UserID { get; set; }

    [LoadColumn(1)]
    public float LocationID { get; set; }

    [LoadColumn(2), ColumnName("Rating")]
    public float Rating { get; set; }
    public float FeatureCount { get; set; }

}
