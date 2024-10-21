using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Location
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]  //LocationID is auto-incremented by the database.
        public int LocationID { get; set; }
        public string LocationName { get; set; }
        [Required]
        public double Latitude { get; set; }
        [Required]
        public double Longitude { get; set; }

        public string? AccessibilityFeatures { get; set; }  // Field for accessibility features

        public string? Pictures { get; set; }  // Field for pictures (URLs or file paths)

        public string? AccessibilityDescriptions { get; set; }  // Field for detailed accessibility descriptions
    }
}

