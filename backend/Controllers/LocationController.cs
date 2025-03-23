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
                if (_environment.IsProduction())
                {
                    uploadsFolder = "/uploads";
                }

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

                var comments = _context.Comments.Where(c => c.LocationID == id);
                _context.Comments.RemoveRange(comments);

                var favorites = _context.Favorites.Where(f => f.LocationID == id);
                _context.Favorites.RemoveRange(favorites);

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
        [Consumes("application/json")]
        public async Task<IActionResult> DeleteImage(int locationId, [FromBody] DeleteImageRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrWhiteSpace(request.ImageUrl))
                {
                    return BadRequest("The imageUrl field is required.");
                }

                if (locationId <= 0)
                {
                    return BadRequest("Invalid LocationID.");
                }

                Console.WriteLine($"Received LocationID: {locationId}");
                Console.WriteLine($"Received ImageUrl: {request.ImageUrl}");

                var normalizedRequestUrl = request.ImageUrl.Trim().Replace("\\", "/").TrimStart('/');

                // Fetch picture from the database
                var picture = await _context.Pictures.FirstOrDefaultAsync(
                    p => p.LocationID == locationId &&
                         p.ImageUrl.Trim().Replace("\\", "/").TrimStart('/') == normalizedRequestUrl
                );

                if (picture == null)
                {
                    Console.WriteLine($"No match found for ImageUrl: {normalizedRequestUrl}");
                    return NotFound("Image not found.");
                }

                // Construct the file path
                var filePath = Path.Combine(
                    _environment.WebRootPath ?? Directory.GetCurrentDirectory(),
                    picture.ImageUrl.TrimStart('/').Replace("/", Path.DirectorySeparatorChar.ToString())
                );

                Console.WriteLine($"Constructed file path: {filePath}");

                // Delete the file from the filesystem
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                    Console.WriteLine("File deleted successfully.");
                }
                else
                {
                    Console.WriteLine("File does not exist on the filesystem.");
                }

                _context.Pictures.Remove(picture);
                await _context.SaveChangesAsync();

                return Ok("Image deleted successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting image: {ex.Message}\nStack Trace: {ex.StackTrace}");
                return StatusCode(500, "Internal server error occurred while deleting the image.");
            }
        }


        [HttpPut("{locationId}/replace-image")]
        public async Task<IActionResult> ReplaceImage(int locationId, IFormFile file, [FromForm] string oldImageUrl)
        {
            Console.WriteLine("ReplaceImage endpoint hit");
            Console.WriteLine($"Received LocationID: {locationId}");
            Console.WriteLine($"Received OldImageUrl: {oldImageUrl}");
            Console.WriteLine($"Received File: {file?.FileName}");

            if (file == null) return BadRequest("File is missing.");
            if (string.IsNullOrWhiteSpace(oldImageUrl)) return BadRequest("OldImageUrl is missing.");

            oldImageUrl = oldImageUrl.Split('?')[0].Trim();
            Console.WriteLine($"Sanitized OldImageUrl: {oldImageUrl}");

            // Adjust for `uploads` directory
            var uploadsFolder = Path.Combine(_environment.WebRootPath ?? Directory.GetCurrentDirectory(), "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Console.WriteLine($"Uploads folder not found: {uploadsFolder}");
                return NotFound("Uploads folder not found.");
            }

            var relativeOldImageUrl = oldImageUrl.Replace("http://localhost:5232", "").Trim();




            var oldImagePath = Path.Combine(uploadsFolder, relativeOldImageUrl);
            Console.WriteLine($"Computed path for old image: {oldImagePath}");

            // Delete old image if it exists
            if (System.IO.File.Exists(oldImagePath))
            {
                System.IO.File.Delete(oldImagePath);
                Console.WriteLine("Old image deleted successfully.");
            }
            else
            {
                Console.WriteLine("Old image file not found in the file system. Proceeding to save the new image.");
            }

            // Save the new image
            var uniqueFileName = Guid.NewGuid() + "_" + file.FileName;
            var newFilePath = Path.Combine(uploadsFolder, uniqueFileName);
            Console.WriteLine($"Saving new file to path: {newFilePath}");

            using (var fileStream = new FileStream(newFilePath, FileMode.Create))
            {
                await file.CopyToAsync(fileStream);
            }

            // Update the database with the new image URL
            var picture = await _context.Pictures.FirstOrDefaultAsync(p => p.ImageUrl.Replace("\\", "/").Trim() == relativeOldImageUrl);
            if (picture != null)
            {
                picture.ImageUrl = "/uploads/" + uniqueFileName;
                await _context.SaveChangesAsync();
                Console.WriteLine("Picture record updated successfully.");
            }
            else
            {
                Console.WriteLine("Picture record not found in database.");
                return NotFound("Picture record not found.");
            }

            Console.WriteLine("Image replaced successfully.");
            return Ok(new { imageUrl = "/uploads/" + uniqueFileName });
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
