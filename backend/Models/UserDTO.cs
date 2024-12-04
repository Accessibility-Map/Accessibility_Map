using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class UserDTO
    {
        public string Password { get; set; }
        public string Username { get; set; }
        public string Settings { get; set; } = string.Empty;
        public int UserID { get; set; }
    }
}
