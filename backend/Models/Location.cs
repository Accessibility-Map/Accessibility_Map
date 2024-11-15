using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Location
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LocationID { get; set; }

        public string LocationName { get; set; }

        [Required]
        public double Latitude { get; set; }

        [Required]
        public double Longitude { get; set; }

        public string? AccessibilityFeatures { get; set; }
        public string? AccessibilityDescriptions { get; set; }

        // Make these collections optional by using nullable collections
        public ICollection<Feature>? Features { get; set; }
        public ICollection<Rating>? Ratings { get; set; }
    }
}
