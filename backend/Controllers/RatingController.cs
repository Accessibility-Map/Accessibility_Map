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
            try
            {
                Console.WriteLine($"Received prediction request for UserID: {userID}, LocationID: {locationID}");

                var predictedRating = Predictor.PredictRating(userID, locationID);

                Console.WriteLine($"Predicted Rating: {predictedRating}");

                return Ok(new { UserID = userID, LocationID = locationID, PredictedRating = predictedRating });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during prediction: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet("inspect-model")]
        public IActionResult InspectModel()
        {
            try
            {
                string modelPath = Path.Combine(Directory.GetCurrentDirectory(), "RatingModel.zip");

                ModelInspector.InspectModel(modelPath);
                return Ok("Model inspection completed. Check logs for details.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error inspecting model: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateRating([FromBody] RatingDto ratingDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var rating = new Rating
            {
                UserID = ratingDto.UserID,
                LocationID = ratingDto.LocationID,
                UserRating = ratingDto.Rating
            };

            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();

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

            Rating rating = new Rating(UserID, LocationID, Rating);
            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();

            return Ok(rating);
        }

        [HttpPut("{UserID}/{LocationID}/{Rating}")]
        public async Task<IActionResult> UpdateRating(int UserID, int LocationID, int Rating)
        {
            if (Rating < 1 || Rating > 5)
            {
                return BadRequest("Rating must be between 1 and 5.");
            }

            Rating rating = new Rating(UserID, LocationID, Rating);
            _context.Ratings.Update(rating);
            await _context.SaveChangesAsync();

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