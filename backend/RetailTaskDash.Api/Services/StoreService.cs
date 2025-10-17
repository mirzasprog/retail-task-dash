using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Models;
using System.Linq;

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
            .AsNoTracking()
            .Include(store => store.Region)
            .OrderBy(store => store.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<List<Store>> GetStoresForRegionAsync(Guid regionId, CancellationToken cancellationToken = default)
    {
        return _context.Stores
            .AsNoTracking()
            .Include(store => store.Region)
            .Where(store => store.RegionId == regionId)
            .OrderBy(store => store.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<List<Store>> GetStoresForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return _context.Stores
            .AsNoTracking()
            .Include(store => store.Region)
            .Where(store => _context.UserStoreAssignments.Any(assignment => assignment.UserId == userId && assignment.StoreId == store.Id))
            .OrderBy(store => store.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<Store?> GetStoreAsync(Guid storeId, CancellationToken cancellationToken = default)
    {
        return await _context.Stores
            .AsNoTracking()
            .Include(store => store.Region)
            .FirstOrDefaultAsync(store => store.Id == storeId, cancellationToken);
    }

    public async Task<Store> CreateStoreAsync(Store store, CancellationToken cancellationToken = default)
    {
        store.Id = Guid.NewGuid();
        _context.Stores.Add(store);
        await _context.SaveChangesAsync(cancellationToken);
        return store;
    }

    public async Task<Store?> UpdateStoreAsync(Guid id, Store updated, CancellationToken cancellationToken = default)
    {
        var store = await _context.Stores.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (store == null)
        {
            return null;
        }

        store.Name = updated.Name;
        store.Location = updated.Location;
        store.RegionId = updated.RegionId;
        await _context.SaveChangesAsync(cancellationToken);
        return store;
    }

    public async Task<bool> DeleteStoreAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var store = await _context.Stores.FirstOrDefaultAsync(s => s.Id == id, cancellationToken);
        if (store == null)
        {
            return false;
        }

        _context.Stores.Remove(store);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}
