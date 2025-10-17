using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Dtos;
using RetailTaskDash.Api.Models;
using System.Linq;

namespace RetailTaskDash.Api.Services;

public class DashboardService
{
    private readonly RetailTaskDashContext _context;

    public DashboardService(RetailTaskDashContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetStoreDashboardAsync(Guid storeId, CancellationToken cancellationToken = default)
    {
        var startDate = DateTime.UtcNow.AddDays(-30);

        var kpis = await _context.Kpis
            .AsNoTracking()
            .Where(kpi => kpi.StoreId == storeId && kpi.SnapshotDate >= startDate)
            .Select(kpi => new KpiDto
            {
                Id = kpi.Id,
                StoreId = kpi.StoreId,
                Metric = kpi.Metric,
                Value = kpi.Value,
                Change = kpi.Change,
                Trend = kpi.Trend,
                Status = kpi.Status
            })
            .OrderBy(kpi => kpi.Metric)
            .ToListAsync(cancellationToken);

        var sales = await _context.Sales
            .AsNoTracking()
            .Where(s => s.StoreId == storeId && s.SnapshotDate >= startDate)
            .Select(s => new SalesRecordDto
            {
                Id = s.Id,
                StoreId = s.StoreId,
                Department = s.Department,
                Sales = s.Sales,
                Target = s.Target,
                Variance = s.Variance,
                Trend = s.Trend,
                Contribution = s.Contribution
            })
            .OrderBy(s => s.Department)
            .ToListAsync(cancellationToken);

        var tasks = await _context.Tasks
            .AsNoTracking()
            .Where(task => task.StoreId == storeId && task.DueDate.Date >= DateTime.UtcNow.Date)
            .OrderBy(task => task.DueDate)
            .ToListAsync(cancellationToken);

        return new DashboardSummaryDto
        {
            Kpis = kpis,
            Sales = sales,
            Tasks = tasks
        };
    }

    public async Task<IEnumerable<KpiDto>> GetRegionKpisAsync(Guid regionId, CancellationToken cancellationToken = default)
    {
        return await _context.Kpis
            .AsNoTracking()
            .Join(_context.Stores.AsNoTracking(), kpi => kpi.StoreId, store => store.Id, (kpi, store) => new { kpi, store })
            .Where(pair => pair.store.RegionId == regionId)
            .GroupBy(entry => entry.kpi.Metric)
            .Select(group => new KpiDto
            {
                Id = Guid.NewGuid(),
                StoreId = Guid.Empty,
                Metric = group.Key,
                Value = group.Sum(entry => entry.kpi.Value),
                Change = group.Average(entry => entry.kpi.Change),
                Trend = group.Average(entry => entry.kpi.Change) >= 0 ? "up" : "down",
                Status = group.Average(entry => entry.kpi.Change) >= 0 ? "good" : "warning"
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<SalesRecordDto>> GetRegionSalesAsync(Guid regionId, CancellationToken cancellationToken = default)
    {
        return await _context.Sales
            .AsNoTracking()
            .Join(_context.Stores.AsNoTracking(), sale => sale.StoreId, store => store.Id, (sale, store) => new { sale, store })
            .Where(pair => pair.store.RegionId == regionId)
            .GroupBy(entry => entry.sale.Department)
            .Select(group => new SalesRecordDto
            {
                Id = Guid.NewGuid(),
                StoreId = Guid.Empty,
                Department = group.Key,
                Sales = group.Sum(entry => entry.sale.Sales),
                Target = group.Sum(entry => entry.sale.Target),
                Variance = group.Sum(entry => entry.sale.Target) == 0 ? 0 : (group.Sum(entry => entry.sale.Sales) - group.Sum(entry => entry.sale.Target)) / group.Sum(entry => entry.sale.Target) * 100,
                Trend = group.Average(entry => entry.sale.Variance) >= 0 ? "up" : "down",
                Contribution = group.Sum(entry => entry.sale.Contribution)
            })
            .OrderBy(r => r.Department)
            .ToListAsync(cancellationToken);
    }
}
