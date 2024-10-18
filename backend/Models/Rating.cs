using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models
{
    public class Rating
    {
        [Key]
        public int UserID { get; set; }
        [Key]
        public int LocationID { get; set; }
        [Required]
        [Column("Rating")]
        public sbyte UserRating { get; set; }
    }
}
