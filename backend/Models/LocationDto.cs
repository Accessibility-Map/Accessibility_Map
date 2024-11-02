using System.ComponentModel.DataAnnotations;

using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class LocationDto
    {

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]  //LocationID is auto-incremented by the database.
        public int LocationID { get; set; }
        public string LocationName { get; set; }

        public double Latitude { get; set; }  // Include for backend input

        public double Longitude { get; set; }  // Include for backend input

        public string? AccessibilityFeatures { get; set; }

        public string? Pictures { get; set; }

        public string? AccessibilityDescriptions { get; set; }
    }
}
