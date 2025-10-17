using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Dtos;
using System.Linq;

namespace RetailTaskDash.Api.Services;

public class ReportingService
{
    private readonly RetailTaskDashContext _context;

    public ReportingService(RetailTaskDashContext context)
    {
        _context = context;
    }

    public async Task<HqOverviewDto> GetHqOverviewAsync(DateTime? start, DateTime? end, CancellationToken cancellationToken = default)
    {
        var startDate = start ?? DateTime.UtcNow.AddDays(-30);
        var endDate = end ?? DateTime.UtcNow;

        var regionSales = await _context.Stores
            .AsNoTracking()
            .Join(_context.Regions.AsNoTracking(), store => store.RegionId, region => region.Id, (store, region) => new { store, region })
            .Join(_context.Sales.AsNoTracking(), sr => sr.store.Id, sale => sale.StoreId, (sr, sale) => new { sr.region, sale })
            .Where(entry => entry.sale.SnapshotDate >= startDate && entry.sale.SnapshotDate <= endDate)
            .GroupBy(entry => entry.region)
            .Select(group => new RegionSummaryDto
            {
                Id = group.Key.Id,
                Name = group.Key.Name,
                TotalSales = group.Sum(entry => entry.sale.Sales),
                TotalTarget = group.Sum(entry => entry.sale.Target)
            })
            .ToListAsync(cancellationToken);

        var regions = await _context.Regions
            .AsNoTracking()
            .Select(region => regionSales.FirstOrDefault(rs => rs.Id == region.Id) ?? new RegionSummaryDto
            {
                Id = region.Id,
                Name = region.Name,
                TotalSales = 0,
                TotalTarget = 0
            })
            .ToListAsync(cancellationToken);

        var stores = await _context.Stores
            .AsNoTracking()
            .Include(store => store.Region)
            .Select(store => new StoreSummaryDto
            {
                Id = store.Id,
                Name = store.Name,
                Location = store.Location,
                RegionId = store.RegionId,
                RegionName = store.Region!.Name
            })
            .ToListAsync(cancellationToken);

        return new HqOverviewDto
        {
            Regions = regions,
            Stores = stores
        };
    }
}
