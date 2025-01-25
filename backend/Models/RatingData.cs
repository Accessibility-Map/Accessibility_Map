using Microsoft.ML.Data;

public class RatingData
{
    [LoadColumn(0)]
    public float UserID { get; set; }

    [LoadColumn(1)]
    public float LocationID { get; set; }

    [LoadColumn(2), ColumnName("Rating")]
    public float Rating { get; set; }

    // This will be dynamically calculated based on feature flags
    public float FeatureCount { get; set; }

    // Individual feature flags (binary values)
    public bool HasRamp { get; set; }
    public bool HasElevator { get; set; }
    public bool HasAccessibleBathroom { get; set; }
    public bool HasAccessibleParking { get; set; }
}
