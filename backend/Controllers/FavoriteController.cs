using Microsoft.AspNetCore.Mvc;
using backend.Context;
using backend.Models;
using System.Threading.Tasks;
using System.Linq;
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

        [HttpGet("{UserID}")]
        public async Task<IActionResult> GetFavorites(int UserID)
        {
            var favorites = await _context.Favorites
                .Where(f => f.UserID == UserID)
                .Select(f => f.LocationID)
                .ToListAsync();

            return Ok(favorites);
        }

        [HttpPost("{UserID}/{LocationID}")]
        public async Task<IActionResult> AddFavorite(int UserID, int LocationID)
        {
            var favorite = new Favorite { UserID = UserID, LocationID = LocationID };
            _context.Favorites.Add(favorite);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("{UserID}/{LocationID}")]
        public async Task<IActionResult> RemoveFavorite(int UserID, int LocationID)
        {
            var favorite = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserID == UserID && f.LocationID == LocationID);

            if (favorite == null) return NotFound();

            _context.Favorites.Remove(favorite);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
