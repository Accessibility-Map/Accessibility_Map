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
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Location>()
                .HasMany(l => l.Features)
                .WithOne(f => f.Location)
                .HasForeignKey(f => f.LocationID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Location>()
                .HasMany(l => l.Ratings)
                .WithOne(r => r.Location)
                .HasForeignKey(r => r.LocationID)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Rating>()
                .HasKey(r => new { r.UserID, r.LocationID }); // Composite key for Rating

            base.OnModelCreating(modelBuilder);
        }



        public DbSet<Location> Locations { get; set; }  // The Location model DbSet
        public DbSet<Favorite> Favorites { get; set; }  // The Favorite model DbSet
        public DbSet<Rating> Ratings { get; set; }  // The Rating model DbSet
        public DbSet<Feature> Features { get; set; }  // The Feature model DbSet
        public DbSet<Picture> Pictures { get; set; }

    }
}
