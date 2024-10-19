using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }
        public int Settings { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
