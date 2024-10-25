using Microsoft.EntityFrameworkCore;
using backend.Models; // Ensure this matches the namespace in the Location model

namespace backend.Context  // Ensure this matches what you're using in Program.cs
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Location> Locations { get; set; }  // The Location model DbSet
        public DbSet<Favorite> Favorites { get; set; }  // The Favorite model DbSet
        public DbSet<Rating> Ratings { get; set; }  // The Rating model DbSet
        public DbSet<Feature> Features { get; set; }  // The Feature model DbSet
    }
}
