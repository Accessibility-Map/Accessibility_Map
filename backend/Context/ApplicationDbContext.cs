using Microsoft.EntityFrameworkCore;
using backend.Models; 

namespace backend.Context  
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Location> Locations { get; set; } 
        public DbSet<Favorite> Favorites { get; set; } 
        public DbSet<Picture> Pictures { get; set; } 

        public DbSet<Rating> Ratings { get; set; } 
    }
}
