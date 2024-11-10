using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [Route("api/features")]
    [ApiController]
    public class FeatureController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<FeatureController> _logger;

        public FeatureController(ApplicationDbContext context, ILogger<FeatureController> logger)
        {
            _context = context;
            _logger = logger;

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
// DELETE: api/features/{id}
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
        public async Task<IActionResult> getEntriesByFeature(string feature){
            var entries = await _context.Features.Where(entry => entry.LocationFeature == feature).ToListAsync();
            return Ok(entries);
        }

        // PUT: api/features/{id}
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

            return NoContent();
        }
    }
}