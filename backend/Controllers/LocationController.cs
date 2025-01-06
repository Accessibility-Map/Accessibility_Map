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
                Console.WriteLine($"[UPLOAD] LocationID: {id}, File: {file?.FileName}");

                var location = await _context.Locations.FindAsync(id);
                if (location == null)
                {
                    Console.WriteLine("[UPLOAD] Location not found.");
                    return NotFound("Location not found.");
                }

                if (file == null || file.Length == 0)
                {
                    Console.WriteLine("[UPLOAD] No file uploaded or file is empty.");
                    return BadRequest("No file uploaded.");
                }

                string uploadsFolder = _environment.WebRootPath ?? Directory.GetCurrentDirectory();
                uploadsFolder = Path.Combine(uploadsFolder, "uploads");

                if (!Directory.Exists(uploadsFolder))
                {
                    Console.WriteLine("[UPLOAD] Upload folder not found. Creating...");
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = Guid.NewGuid() + "_" + file.FileName;
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                Console.WriteLine($"[UPLOAD] Saving file to: {filePath}");

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                var picture = new Picture
                {
                    LocationID = id,
                    ImageUrl = "/uploads/" + uniqueFileName,
                    UploadedAt = DateTime.UtcNow
                };

                Console.WriteLine($"[UPLOAD] Creating Picture: LocationID={picture.LocationID}, ImageUrl={picture.ImageUrl}");

                _context.Pictures.Add(picture);
                await _context.SaveChangesAsync();

                Console.WriteLine($"[UPLOAD] Picture saved in database. PictureID={picture.PictureID}, LocationID={picture.LocationID}, ImageUrl={picture.ImageUrl}");

                return Ok(new { ImageUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}" });
            }
            catch (Exception ex)
            {
                Console.WriteLine("[UPLOAD] Error: " + ex.Message);
                return StatusCode(500, "Internal server error occurred while uploading the file.");
            }
        }



        [HttpGet("{id}/pictures")]
        public async Task<IActionResult> GetPictures(int id)
        {
            try
            {
                Console.WriteLine($"[GET PICTURES] Fetching pictures for LocationID: {id}");

                var pictures = await _context.Pictures.Where(p => p.LocationID == id).ToListAsync();

                Console.WriteLine($"[GET PICTURES] Found {pictures.Count} pictures for LocationID: {id}");
                foreach (var picture in pictures)
                {
                    Console.WriteLine($"[GET PICTURES] PictureID: {picture.PictureID}, LocationID: {picture.LocationID}, ImageUrl: {picture.ImageUrl}");
                }

                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var response = pictures.Select(p => new { ImageUrl = $"{baseUrl}{p.ImageUrl}" }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GET PICTURES] Error: {ex.Message}");
                return StatusCode(500, "Internal server error occurred while fetching pictures.");
            }
        }


        // Create Location
        [HttpPost]
        public async Task<IActionResult> CreateLocation([FromBody] Location location)
        {
            if (location == null)
            {
                return BadRequest("Invalid location data.");
            }

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

                var pictures = await _context.Pictures.Where(p => p.LocationID == id).ToListAsync();

                foreach (var picture in pictures)
                {
                    var filePath = Path.Combine(_environment.WebRootPath ?? Directory.GetCurrentDirectory(), picture.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(filePath))
                    {
                        System.IO.File.Delete(filePath);
                    }
                }

                _context.Pictures.RemoveRange(pictures);

                var ratings = _context.Ratings.Where(r => r.LocationID == id);
                _context.Ratings.RemoveRange(ratings);

                var features = _context.Features.Where(f => f.LocationID == id);
                _context.Features.RemoveRange(features);

                _context.Locations.Remove(location);

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

                var location = await _context.Locations.FindAsync(locationId);
                if (location == null)
                {
                    Console.WriteLine("Location not found.");
                    return NotFound("Location not found.");
                }

                var pictures = await _context.Pictures
                    .Where(p => p.LocationID == locationId)
                    .ToListAsync();

                foreach (var pic in pictures)
                {
                    Console.WriteLine($"Database ImageUrl: {pic.ImageUrl}");
                }

                var normalizedRequestUrl = request.ImageUrl.Trim();
                var picture = await _context.Pictures
                    .FirstOrDefaultAsync(p => p.LocationID == locationId && p.ImageUrl.Trim() == normalizedRequestUrl);

                if (picture == null)
                {
                    Console.WriteLine($"No match found for ImageUrl: {request.ImageUrl}");
                    return NotFound("Image not found.");
                }

                var filePath = Path.Combine(
                    _environment.WebRootPath ?? Directory.GetCurrentDirectory(),
                    picture.ImageUrl.TrimStart('/')
                );

                Console.WriteLine($"Constructed file path: {filePath}");
                Console.WriteLine($"File exists: {System.IO.File.Exists(filePath)}");

                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    Console.WriteLine("File deleted successfully.");
                }
                else
                {
                    Console.WriteLine("File does not exist.");
                }

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

                if (oldImageUrl.Contains("..") || oldImageUrl.Contains("\\") || !oldImageUrl.Contains("/uploads/"))
                {
                    return BadRequest("Invalid old image URL.");
                }
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
