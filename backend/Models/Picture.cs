using backend.Models;


public class Picture
{
    public int PictureID { get; set; }
    public int LocationID { get; set; }  // Foreign Key to Location
    public string ImageUrl { get; set; }
    public DateTime UploadedAt { get; set; }
}
