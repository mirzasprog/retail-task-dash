using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Services;

public class RegionService
{
    private readonly RetailTaskDashContext _context;

    public RegionService(RetailTaskDashContext context)
    {
        _context = context;
    }

    public Task<List<Region>> GetRegionsAsync(CancellationToken cancellationToken = default)
    {
        return _context.Regions
            .AsNoTracking()
            .OrderBy(region => region.Name)
            .ToListAsync(cancellationToken);
    }
}
