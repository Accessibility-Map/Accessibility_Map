using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [PrimaryKey(nameof(UserID), nameof(LocationID))]
    public class Rating
    {
        public int UserID { get; set; }
        public int LocationID { get; set; }

        [Required]
        [Column("Rating")]
        public int UserRating { get; set; }

        // Navigation property to Location

        [JsonIgnore] 
        public Location Location { get; set; }

        public Rating() { }

        public Rating(int userID, int locationID, int userRating)
        {
            UserID = userID;
            LocationID = locationID;
            UserRating = userRating;
        }
    }
}
