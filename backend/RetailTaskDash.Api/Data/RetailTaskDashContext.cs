using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Data;

public class RetailTaskDashContext : DbContext
{
    public RetailTaskDashContext(DbContextOptions<RetailTaskDashContext> options)
        : base(options)
    {
    }

    public DbSet<Store> Stores => Set<Store>();
    public DbSet<TaskAssignment> Tasks => Set<TaskAssignment>();
    public DbSet<KpiSnapshot> Kpis => Set<KpiSnapshot>();
    public DbSet<SalesSnapshot> Sales => Set<SalesSnapshot>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Region> Regions => Set<Region>();
    public DbSet<UserStoreAssignment> UserStoreAssignments => Set<UserStoreAssignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<UserStoreAssignment>()
            .HasKey(usa => new { usa.UserId, usa.StoreId });

        modelBuilder.Entity<UserStoreAssignment>()
            .HasOne(usa => usa.User)
            .WithMany(u => u.StoreAssignments)
            .HasForeignKey(usa => usa.UserId);

        modelBuilder.Entity<UserStoreAssignment>()
            .HasOne(usa => usa.Store)
            .WithMany(s => s.UserAssignments)
            .HasForeignKey(usa => usa.StoreId);
    }
}
