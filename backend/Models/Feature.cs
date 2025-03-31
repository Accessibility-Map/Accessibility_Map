using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Feature
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [Required]
        public int LocationID { get; set; }

        [Required]
        [Column("Feature")]
        public string LocationFeature { get; set; }

        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public string Notes { get; set; } = string.Empty;

        // Navigation property to Location
        [JsonIgnore]
        public Location? Location { get; set; }

        public string? ImagePath { get; set; } // Allow null values


    }
}
