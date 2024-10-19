using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    [PrimaryKey(nameof(UserID), nameof(LocationID))]
    public class Favorite
    {
        public int UserID { get; set; }
        public int LocationID { get; set; }
    }
}
