using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System;

namespace backend.Controllers
{
    [Route("api/locations")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public LocationController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;

            Console.WriteLine("WebRootPath: " + _environment.WebRootPath);

        }

        [HttpPost("{id}/upload")]
        public async Task<IActionResult> UploadPicture(int id, IFormFile file)
        {
            try
            {
                var location = await _context.Locations.FindAsync(id);
                if (location == null)
                {
                    return NotFound("Location not found.");
                }

                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded.");
                }

                string uploadsFolder;

                if(_environment.IsProduction()){
                    uploadsFolder = "/uploads";
                }
                else{
                    // Fallback to a relative path if WebRootPath is null
                    uploadsFolder = _environment.WebRootPath != null
                    ? Path.Combine(_environment.WebRootPath, "uploads")
                    : Path.Combine(Directory.GetCurrentDirectory(), "uploads");

                    if (!Directory.Exists(uploadsFolder))
                    {
                    Directory.CreateDirectory(uploadsFolder);
                    }
                }

                

                // Generate a unique filename to avoid conflicts
                var uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Save image details in the Pictures table
                var picture = new Picture
                {
                    LocationID = id,
                    ImageUrl = "/uploads/" + uniqueFileName,
                    UploadedAt = DateTime.UtcNow
                };

                _context.Pictures.Add(picture);
                await _context.SaveChangesAsync();

                return Ok(new { picture.ImageUrl });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error during file upload: " + ex.Message);
                return StatusCode(500, "Internal server error occurred while uploading the file.");
            }
        }


      [HttpGet("{id}/pictures")]
    public async Task<IActionResult> GetPictures(int id)
{
    var pictures = await _context.Pictures
        .Where(p => p.LocationID == id)
        .Select(p => new { p.ImageUrl })  // Only return ImageUrl
        .ToListAsync();

    // Instead of returning 404, return an empty list if no pictures found
    return Ok(pictures);
}

        // Create Location
        [HttpPost]
        public async Task<IActionResult> CreateLocation([FromBody] Location location)
        {
            if (location == null)
            {
                return BadRequest("Invalid location data.");
            }

            // Add location to the database
            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            return Ok(location);
        }

        // Get All Locations
        [HttpGet]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _context.Locations.ToListAsync();
            return Ok(locations);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
            {
                return NotFound();
            }

            // Remove related entities (e.g., Ratings and Features)
            var ratings = _context.Ratings.Where(r => r.LocationID == id);
            _context.Ratings.RemoveRange(ratings);

            var features = _context.Features.Where(f => f.LocationID == id);
            _context.Features.RemoveRange(features);

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}/delete-image")]
        public async Task<IActionResult> DeleteImage(int id)
        {
            try
            {
                // Find the image in the Pictures table
                var picture = await _context.Pictures.FirstOrDefaultAsync(p => p.LocationID == id);
                if (picture == null)
                {
                    return NotFound("Image not found.");
                }

                string filePath;
                if(_environment.IsProduction()){
                    filePath = picture.ImageUrl;
                }
                else{
                    // Construct the file path
                    filePath = Path.Combine(_environment.WebRootPath ?? Directory.GetCurrentDirectory(), picture.ImageUrl.TrimStart('/'));
                }
                

                // Delete the file from the filesystem
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }

                // Remove the entry from the database
                _context.Pictures.Remove(picture);
                await _context.SaveChangesAsync();

                return Ok("Image deleted successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error deleting image: " + ex.Message);
                return StatusCode(500, "Internal server error occurred while deleting the image.");
            }
        }

        // Update Location
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLocation(int id, [FromBody] Location location)
        {
            var existingLocation = await _context.Locations.FindAsync(id);
            if (existingLocation == null)
            {
                return NotFound();
            }

            existingLocation.LocationName = location.LocationName;
            existingLocation.AccessibilityFeatures = location.AccessibilityFeatures;
            existingLocation.AccessibilityDescriptions = location.AccessibilityDescriptions;

            await _context.SaveChangesAsync();

            return Ok(existingLocation);
        }
    }
}
