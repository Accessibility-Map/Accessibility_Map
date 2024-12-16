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

                if (_environment.IsProduction())
                {
                    uploadsFolder = "/uploads";
                }
                else
                {
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
            try
            {
                // Find the location
                var location = await _context.Locations.FindAsync(id);
                if (location == null)
                {
                    return NotFound("Location not found.");
                }

                // Fetch all associated images
                var pictures = await _context.Pictures.Where(p => p.LocationID == id).ToListAsync();

                // Delete images from the filesystem
                foreach (var picture in pictures)
                {
                    var filePath = Path.Combine(_environment.WebRootPath ?? Directory.GetCurrentDirectory(), picture.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }

                // Remove image records from the database
                _context.Pictures.RemoveRange(pictures);

                // Remove related entities (e.g., Ratings, Features)
                var ratings = _context.Ratings.Where(r => r.LocationID == id);
                _context.Ratings.RemoveRange(ratings);

                var features = _context.Features.Where(f => f.LocationID == id);
                _context.Features.RemoveRange(features);

                // Remove the location itself
                _context.Locations.Remove(location);

                // Save changes to the database
                await _context.SaveChangesAsync();

                return Ok("Location and associated images deleted successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error deleting location: " + ex.Message);
                return StatusCode(500, "Internal server error occurred while deleting the location.");
            }
        }

        [HttpDelete("{locationId}/delete-image")]
        public async Task<IActionResult> DeleteImage(int locationId, [FromBody] DeleteImageRequest request)
        {
            try
            {
                // Validate request body
                if (request == null || string.IsNullOrEmpty(request.ImageUrl))
                {
                    return BadRequest("The imageUrl field is required.");
                }

                Console.WriteLine($"Received LocationID: {locationId}");
                Console.WriteLine($"Received ImageUrl: {request.ImageUrl}");

                // Check if the location exists
                var location = await _context.Locations.FindAsync(locationId);
                if (location == null)
                {
                    Console.WriteLine("Location not found.");
                    return NotFound("Location not found.");
                }

                // Log all images for the location
                var pictures = await _context.Pictures
                    .Where(p => p.LocationID == locationId)
                    .ToListAsync();

                foreach (var pic in pictures)
                {
                    Console.WriteLine($"Database ImageUrl: {pic.ImageUrl}");
                }

                // Normalize request URL
                var normalizedRequestUrl = request.ImageUrl.Trim();
                var picture = await _context.Pictures
                    .FirstOrDefaultAsync(p => p.LocationID == locationId && p.ImageUrl.Trim() == normalizedRequestUrl);

                if (picture == null)
                {
                    Console.WriteLine($"No match found for ImageUrl: {request.ImageUrl}");
                    return NotFound("Image not found.");
                }

                // Construct the file path
                var filePath = Path.Combine(
                    _environment.WebRootPath ?? Directory.GetCurrentDirectory(),
                    picture.ImageUrl.TrimStart('/')
                );

                Console.WriteLine($"Constructed file path: {filePath}");
                Console.WriteLine($"File exists: {System.IO.File.Exists(filePath)}");

                // Delete the file from the filesystem
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    Console.WriteLine("File deleted successfully.");
                }
                else
                {
                    Console.WriteLine("File does not exist.");
                }

                // Remove the entry from the database
                _context.Pictures.Remove(picture);
                await _context.SaveChangesAsync();

                return Ok("Image deleted successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting image: {ex.Message}");
                return StatusCode(500, "Internal server error occurred while deleting the image.");
            }
        }


        [HttpPut("{locationId}/replace-image")]
        public async Task<IActionResult> ReplaceImage(int locationId, IFormFile file, [FromForm] string oldImageUrl)

        {
            try
            {
                var location = await _context.Locations.FindAsync(locationId);
                if (location == null) return NotFound("Location not found.");

                Console.WriteLine($"Replacing image for LocationID: {locationId}, OldImageUrl: {oldImageUrl}");

                var oldImagePath = Path.Combine(_environment.WebRootPath ?? Directory.GetCurrentDirectory(), oldImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(oldImagePath))
                {
                    System.IO.File.Delete(oldImagePath);
                }

                var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Directory.GetCurrentDirectory(), "uploads");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = Guid.NewGuid() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                var picture = await _context.Pictures.FirstOrDefaultAsync(p => p.ImageUrl == oldImageUrl.Trim());
                if (picture != null)
                {
                    picture.ImageUrl = "/uploads/" + uniqueFileName;
                    await _context.SaveChangesAsync();
                }
                else
                {
                    return NotFound("Old image record not found in the database.");
                }

                return Ok(new { imageUrl = "/uploads/" + uniqueFileName });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error replacing image: {ex.Message}");
                return StatusCode(500, "Internal server error occurred while replacing the image.");
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
            existingLocation.Description = location.Description;

            await _context.SaveChangesAsync();

            return Ok(existingLocation);
        }
    }
}
