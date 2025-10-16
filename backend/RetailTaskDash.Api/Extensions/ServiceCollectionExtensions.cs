using RetailTaskDash.Api.Services;

namespace RetailTaskDash.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDataAccess(this IServiceCollection services)
    {
        services.AddScoped<StoreService>();
        services.AddScoped<DashboardService>();
        services.AddScoped<TaskService>();
        services.AddScoped<AuthService>();
        return services;
    }
}
