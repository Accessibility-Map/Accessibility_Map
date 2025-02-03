using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System;


namespace backend.Controllers
{
    [Route("api/features")]
    [ApiController]
    public class FeatureController : ControllerBase

    {
        [HttpGet]
        public async Task<IActionResult> GetAllFeatures()
        {
            var features = await _context.Features.ToListAsync();
            return Ok(new { features });
        }
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FeatureController> _logger;
        private readonly IWebHostEnvironment _environment;

        public FeatureController(ApplicationDbContext context, ILogger<FeatureController> logger, IWebHostEnvironment environment)
        {
            _context = context;
            _logger = logger;
            _environment = environment;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFeature([FromBody] Feature feature)
        {
            _logger.LogInformation("Received Feature Data:");
            _logger.LogInformation($"LocationID: {feature.LocationID}");
            _logger.LogInformation($"LocationFeature: {feature.LocationFeature}");
            _logger.LogInformation($"Notes: {feature.Notes}");

            if (!ModelState.IsValid)
            {
                foreach (var state in ModelState)
                {
                    _logger.LogError($"Key: {state.Key}, Errors: {string.Join(", ", state.Value.Errors.Select(e => e.ErrorMessage))}");
                }
                return BadRequest(ModelState);
            }
            feature.Notes ??= string.Empty;

            _context.Features.Add(feature);
            await _context.SaveChangesAsync();

            return Ok(feature);
        }

        [HttpGet("location/{locationID}")]
        public async Task<IActionResult> GetFeaturesByLocationID(int locationID)
        {
            var features = await _context.Features.Where(entry => entry.LocationID == locationID).ToListAsync();
            return Ok(features);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeature(int id)
        {
            var feature = await _context.Features.FindAsync(id);
            if (feature == null)
            {
                return NotFound("Feature not found.");
            }

            _context.Features.Remove(feature);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("feature/{feature}")]
        public async Task<IActionResult> getEntriesByFeature(string feature)
        {
            var entries = await _context.Features.Where(entry => entry.LocationFeature == feature).ToListAsync();
            return Ok(entries);
        }

        [HttpPut("{id}/upload-image")]
        public async Task<IActionResult> UploadFeatureImage(int id, IFormFile file)
        {
            Console.WriteLine($"[INFO] UploadFeatureImage called for FeatureId: {id}");

            try
            {
                var feature = await _context.Features.FindAsync(id);
                if (feature == null)
                {
                    Console.WriteLine($"[ERROR] Feature with ID {id} not found.");
                    return NotFound("Feature not found.");
                }

                if (file == null || file.Length == 0)
                {
                    Console.WriteLine("[ERROR] No file uploaded.");
                    return BadRequest("No file uploaded.");
                }

                string uploadsFolder = _environment.IsProduction()
                    ? "/uploads/features"
                    : Path.Combine(_environment.WebRootPath ?? Directory.GetCurrentDirectory(), "uploads", "features");

                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                    Console.WriteLine("[INFO] Created uploads folder.");
                }

                var uniqueFileName = Guid.NewGuid() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                Console.WriteLine($"[INFO] File path: {filePath}");

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }
                Console.WriteLine("[INFO] File saved successfully.");

                feature.ImagePath = "/uploads/features/" + uniqueFileName;
                await _context.SaveChangesAsync();
                Console.WriteLine($"[INFO] Feature with ID {id} updated with ImagePath: {feature.ImagePath}");

                return Ok(new { imageUrl = feature.ImagePath });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Exception occurred: {ex.Message}");
                return StatusCode(500, "Internal server error occurred while uploading the image.");
            }
        }
// Endpoint to get the feature count for a specific location
        [HttpGet("count/{locationID}")]
        public IActionResult GetFeatureCount(int locationID)
        {
            try
            {
                var featureCount = _context.Features.Count(f => f.LocationID == locationID);
                return Ok(new { featureCount });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching feature count for locationID {locationID}: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFeature(int id, [FromBody] Feature updatedFeature)
        {
            if (id != updatedFeature.id)
            {
                return BadRequest("Feature ID mismatch.");
            }

            var feature = await _context.Features.FindAsync(id);
            if (feature == null)
            {
                return NotFound("Feature not found.");
            }

            feature.LocationFeature = updatedFeature.LocationFeature;
            feature.Notes = updatedFeature.Notes;

            await _context.SaveChangesAsync();

            return Ok(feature);
        }

    }
}