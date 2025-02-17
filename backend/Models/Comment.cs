using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;


namespace backend.Models
{
    [PrimaryKey(nameof(CommentID))]
    public class Comment
    {
        public int CommentID { get; set; }
        [Required]
        public int LocationID { get; set; }
        [Required]
        public int UserID { get; set; }
        [Required]
        [Column("Comment")]
        public string UserComment { get; set; }
        public int? ParentCommentID { get; set; }
        [ForeignKey("ParentCommentID")]
        public ICollection<Comment>? Replies { get; set; }
        public User? User { get; set; }
        [NotMapped]
        public string? Username { get; set; }
    }
}
