using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/features")]
    [ApiController]
    public class FeatureController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FeatureController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFeature([FromBody] Feature feature)
        {
            if (feature == null)
            {
                return BadRequest("Invalid feature data.");
            }

            // Add the feature to the database
            _context.Features.Add(feature);
            await _context.SaveChangesAsync();

            // Return a response with the created location
            return Ok(feature);
        }

        [HttpGet("{locationID}")]
        public async Task<IActionResult> GetFeaturesByLocationID(int locationID)
        {
            var favorites = await _context.Features.Where(entry => entry.LocationID == locationID).ToListAsync();
            return Ok(favorites);
        }
    }
}