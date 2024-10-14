using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;


namespace backend.Models
{
    [PrimaryKey(nameof(UserID), nameof(LocationID))]
    public class Rating
    {
        public int UserID { get; set; }
        public int LocationID { get; set; }
        [Required]
        [Column("Rating")]
        public sbyte UserRating { get; set; }
    }
}
