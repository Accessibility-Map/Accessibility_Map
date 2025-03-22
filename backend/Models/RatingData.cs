using Microsoft.ML.Data;

public class RatingData
{
    [LoadColumn(0)]
    public float UserID { get; set; }

    [LoadColumn(1)]
    public float LocationID { get; set; }

    [LoadColumn(2)]
    public float HasRamp { get; set; }

    [LoadColumn(3)]
    public float HasElevator { get; set; }

    [LoadColumn(4)]
    public float HasAccessibleBathroom { get; set; }

    [LoadColumn(5)]
    public float HasAccessibleParking { get; set; }

    [LoadColumn(6)]
    [ColumnName("Rating")]  
    public float Rating { get; set; }
}
