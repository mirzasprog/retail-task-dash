using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Services;

public class DashboardService
{
    private readonly RetailTaskDashContext _context;

    public DashboardService(RetailTaskDashContext context)
    {
        _context = context;
    }

    public Task<List<KpiSnapshot>> GetKpisAsync(Guid storeId, CancellationToken cancellationToken = default)
    {
        return _context.Kpis
            .Where(kpi => kpi.StoreId == storeId)
            .OrderBy(kpi => kpi.Metric)
            .ToListAsync(cancellationToken);
    }

    public Task<List<SalesSnapshot>> GetSalesHistoryAsync(Guid storeId, CancellationToken cancellationToken = default)
    {
        return _context.Sales
            .Where(s => s.StoreId == storeId)
            .OrderBy(s => s.Department)
            .ToListAsync(cancellationToken);
    }
}
