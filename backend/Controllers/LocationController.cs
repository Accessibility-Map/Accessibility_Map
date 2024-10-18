using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/locations")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LocationController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateLocation([FromBody] Location location)
        {
            if (location == null)
            {
                return BadRequest("Invalid location data.");
            }

            // Add the location to the database
            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            // Return a response with the created location
            return Ok(location);
        }

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

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
