using Microsoft.AspNetCore.Mvc;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/ratings")]
    [ApiController]
    public class RatingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RatingController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRating([FromBody] Rating rating)
        {
            if (rating == null)
            {
                return BadRequest("Invalid location data.");
            }

            // Add the location to the database
            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();

            // Return a response with the created location
            return Ok(rating);
        }

        [HttpGet("{UserID}/{LocationID}")]
        public async Task<IActionResult> GetRating(int UserID, int LocationID)
        {
            var rating = await _context.Ratings.Where(entry => entry.UserID == UserID && entry.LocationID == LocationID).FirstOrDefaultAsync();

            if (rating == null)
            {
                rating = new Rating();
                rating.UserID = UserID;
                rating.LocationID = LocationID;
                rating.UserRating = 0;
            }
            return Ok(rating);
        }

        [HttpPost("{UserID}/{LocationID}/{Rating}")]
        public async Task<IActionResult> CreateRating(int UserID, int LocationID, int Rating)
        {
            if (Rating < 1 || Rating > 5)
            {
                return BadRequest("Rating must be between 1 and 5.");
            }

            // Add the location to the database
            Rating rating = new Rating(UserID, LocationID, Rating);
            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();

            // Return a response with the created location      
            return Ok(rating);
        }

        [HttpPut("{UserID}/{LocationID}/{Rating}")]
        public async Task<IActionResult> UpdateRating(int UserID, int LocationID, int Rating)
        {
            if (Rating < 1 || Rating > 5)
            {
                return BadRequest("Rating must be between 1 and 5.");
            }

            // Add the location to the database
            Rating rating = new Rating(UserID, LocationID, Rating);
            _context.Ratings.Update(rating);
            await _context.SaveChangesAsync();

            // Return a response with the created location      
            return Ok(rating);
        }
    }
}