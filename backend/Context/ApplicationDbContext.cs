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
    }
}