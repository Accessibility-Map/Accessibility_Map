using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models
{
    public class Feature
    {
        [Key]
        public int id { get; set; }
        [Required]
        public int LocationID { get; set; }
        [Required]
        [Column("Feature")]
        public string LocationFeature { get; set; }
        public string Notes { get; set; }
    }
}
