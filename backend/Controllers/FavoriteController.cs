using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using backend.Context;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [Route("api/favorites")]
    [ApiController]
    public class FavoriteController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FavoriteController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFavorite([FromBody] Favorite favorite)
        {
            if (favorite == null)
            {
                return BadRequest("Invalid favorite data.");
            }

            // Add the favorite to the database
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();

            // Return a response with the created favorite
            return Ok(favorite);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetFavoritesByUserId(int userId)
        {
            var favorites = await _context.Favorites.Where(entry => entry.UserID == userId).ToListAsync();
            return Ok(favorites);
        }
    }
}