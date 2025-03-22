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
        private readonly MLModel _mlModel;
        private readonly Predictor _predictor;

        public RatingController(ApplicationDbContext context, MLModel mlModel, Predictor predictor)
        {
            _mlModel = mlModel;
            _predictor = predictor;
            _context = context;
        }

        [HttpPost("train")]
        public IActionResult TrainModel()
        {
            try
            {
                _mlModel.TrainModel();
                return Ok("✅ Model trained successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"❌ Training failed: {ex.Message}");
            }
        }

        [HttpGet("predict/{userID}/{locationID}")]
        public async Task<IActionResult> PredictRating(int userID, int locationID)
        {
            try
            {
                var location = await _context.Locations
                    .Include(l => l.Features)
                    .FirstOrDefaultAsync(l => l.LocationID == locationID);

                if (location == null)
                {
                    return NotFound("Location not found.");
                }

                float hasRamp = location.Features.Any(f => f.LocationFeature == "Ramp") ? 1f : 0f;
                float hasElevator = location.Features.Any(f => f.LocationFeature == "Elevator") ? 1f : 0f;
                float hasAccessibleBathroom = location.Features.Any(f => f.LocationFeature == "Accessible Bathroom") ? 1f : 0f;
                float hasAccessibleParking = location.Features.Any(f => f.LocationFeature == "Accessible Parking") ? 1f : 0f;

                var ratingData = new RatingData
                {
                    HasRamp = hasRamp,
                    HasElevator = hasElevator,
                    HasAccessibleBathroom = hasAccessibleBathroom,
                    HasAccessibleParking = hasAccessibleParking
                };

                var predictedRating = _predictor.PredictRating(ratingData);

                return Ok(new
                {
                    UserID = userID,
                    LocationID = locationID,
                    PredictedRating = predictedRating
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error during prediction: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPost("predict")]
        public IActionResult Predict([FromBody] RatingData input)
        {
            var prediction = _predictor.PredictRating(input);
            return Ok(prediction);
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
            var rating = await _context.Ratings
                .FirstOrDefaultAsync(entry => entry.UserID == UserID && entry.LocationID == LocationID);

            if (rating == null)
            {
                rating = new Rating
                {
                    UserID = UserID,
                    LocationID = LocationID,
                    UserRating = 0
                };
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

            var rating = new Rating(UserID, LocationID, Rating);
            _context.Ratings.Add(rating);
            await _context.SaveChangesAsync();

            return Ok(rating);
        }

        private void RetrainModel()
        {
            var ratings = _context.Ratings
                .Include(r => r.Location)
                .ThenInclude(l => l.Features)
                .ToList();

            if (ratings.Any())
            {
                _mlModel.TrainAndSaveModel(ratings);
                Console.WriteLine("Model retrained successfully.");
            }
            else
            {
                Console.WriteLine("No ratings available to retrain the model.");
            }
        }

        [HttpPut("{UserID}/{LocationID}/{Rating}")]
        public async Task<IActionResult> UpdateRating(int UserID, int LocationID, int Rating)
        {
            if (Rating < 1 || Rating > 5)
            {
                return BadRequest("Rating must be between 1 and 5.");
            }

            var existingRating = await _context.Ratings
                .FirstOrDefaultAsync(r => r.UserID == UserID && r.LocationID == LocationID);

            if (existingRating == null)
            {
                return NotFound("Rating not found.");
            }

            existingRating.UserRating = Rating;
            _context.Ratings.Update(existingRating);
            await _context.SaveChangesAsync();

            RetrainModel();

            var location = await _context.Locations
                .Include(l => l.Features)
                .FirstOrDefaultAsync(l => l.LocationID == LocationID);

            if (location == null)
            {
                return NotFound("Location not found.");
            }

            float hasRamp = location.Features.Any(f => f.LocationFeature == "Ramp") ? 1f : 0f;
            float hasElevator = location.Features.Any(f => f.LocationFeature == "Elevator") ? 1f : 0f;
            float hasAccessibleBathroom = location.Features.Any(f => f.LocationFeature == "Accessible Bathroom") ? 1f : 0f;
            float hasAccessibleParking = location.Features.Any(f => f.LocationFeature == "Accessible Parking") ? 1f : 0f;



            var ratingData = new RatingData
            {
                HasRamp = hasRamp,
                HasElevator = hasElevator,
                HasAccessibleBathroom = hasAccessibleBathroom,
                HasAccessibleParking = hasAccessibleParking
            };

            var predictedRating = _predictor.PredictRating(ratingData);

            return Ok(new { UpdatedRating = existingRating, PredictedRating = predictedRating });
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