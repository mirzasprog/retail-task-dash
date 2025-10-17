using RetailTaskDash.Api.Services;

namespace RetailTaskDash.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDataAccess(this IServiceCollection services)
    {
        services.AddScoped<StoreService>();
        services.AddScoped<DashboardService>();
        services.AddScoped<TaskService>();
        services.AddScoped<UserService>();
        services.AddScoped<AuthTokenService>();
        services.AddScoped<ReportingService>();
        services.AddScoped<ReportExportService>();
        services.AddScoped<RegionService>();
        return services;
    }
}
