using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Data;

public class RetailTaskDashContext : DbContext
{
    public RetailTaskDashContext(DbContextOptions<RetailTaskDashContext> options)
        : base(options)
    {
    }

    public DbSet<Store> Stores { get; set; } = null!;
    public DbSet<TaskAssignment> Tasks { get; set; } = null!;
    public DbSet<KpiSnapshot> Kpis { get; set; } = null!;
    public DbSet<SalesSnapshot> Sales { get; set; } = null!;
    public DbSet<UserAccount> UserAccounts { get; set; } = null!;
}
