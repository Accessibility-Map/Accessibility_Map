using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Location
    {
        [Key]
        public int LocationID { get; set; }
        public string? LocationName { get; set; }  // Nullable
        [Required]
        public double Latitude { get; set; }
        [Required]
        public double Longitude { get; set; }
    }

}