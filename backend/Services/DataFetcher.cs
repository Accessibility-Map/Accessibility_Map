using backend.Models;
using System.Collections.Generic;
using System.Linq;
using backend.Context;

namespace backend.Services
{
    public class DataFetcher
    {
        private readonly ApplicationDbContext _context;

        public DataFetcher(ApplicationDbContext context)
        {
            _context = context;
        }

        public List<Rating> GetRatings()
        {
            return _context.Ratings.ToList();
        }
    }
}
