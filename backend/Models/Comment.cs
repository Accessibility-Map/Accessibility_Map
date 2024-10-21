using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;


namespace backend.Models
{
    [PrimaryKey(nameof(LocationID), nameof(UserID))]
    public class Comment
    {
        public int LocationID { get; set; }
        public int UserID { get; set; }
        [Required]
        [Column("Comment")]
        public string UserComment { get; set; }
    }
}
