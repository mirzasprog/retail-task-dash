using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Services;

public class StoreService
{
    private readonly RetailTaskDashContext _context;

    public StoreService(RetailTaskDashContext context)
    {
        _context = context;
    }

    public Task<List<Store>> GetStoresAsync(CancellationToken cancellationToken = default)
    {
        return _context.Stores
            .OrderBy(store => store.Name)
            .ToListAsync(cancellationToken);
    }
}
