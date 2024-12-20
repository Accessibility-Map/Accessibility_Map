using Microsoft.AspNetCore.Mvc;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using backend.Services;

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
          [HttpPost("train")]
        public IActionResult TrainModel()
        {
            var ratings = _context.Ratings.ToList();
            if (!ratings.Any())
            {
                return BadRequest("No data available to train the model.");
            }

            MLModel.TrainAndSaveModel(ratings);
            return Ok("Model trained and saved successfully.");
        }

 [HttpGet("predict/{userID}/{locationID}")]
public IActionResult PredictRating(int userID, int locationID)
{
    // Log the input values for debugging
    Console.WriteLine($"Received prediction request for UserID: {userID}, LocationID: {locationID}");

    // Perform the prediction
    var predictedRating = Predictor.PredictRating(userID, locationID);

    // Log the output prediction value
    Console.WriteLine($"Predicted Rating: {predictedRating}");

    // Return the prediction result
    return Ok(new { PredictedRating = predictedRating });
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
        
        [HttpGet("average/{LocationID}")]
        public async Task<IActionResult> GetAverageRating(int LocationID)
        {
            var ratings = await _context.Ratings
                .Where(r => r.LocationID == LocationID)
                .ToListAsync();

            if (!ratings.Any())
            {
                return Ok(new { AverageRating = 0 });
            }

            var averageRating = ratings.Average(r => r.UserRating);
            return Ok(new { AverageRating = averageRating });
        }
    }
}