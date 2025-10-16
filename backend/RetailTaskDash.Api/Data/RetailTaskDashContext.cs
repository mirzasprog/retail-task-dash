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
}
