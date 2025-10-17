using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailTaskDash.Api.Dtos;
using RetailTaskDash.Api.Models;
using RetailTaskDash.Api.Services;

namespace RetailTaskDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoresController : ControllerBase
{
    private readonly StoreService _storeService;

    public StoresController(StoreService storeService)
    {
        _storeService = storeService;
    }

    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<StoreSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStores([FromQuery] Guid? regionId, [FromQuery] Guid? userId, CancellationToken cancellationToken)
    {
        IEnumerable<Store> stores;
        if (regionId.HasValue)
        {
            stores = await _storeService.GetStoresForRegionAsync(regionId.Value, cancellationToken);
        }
        else if (userId.HasValue)
        {
            stores = await _storeService.GetStoresForUserAsync(userId.Value, cancellationToken);
        }
        else
        {
            stores = await _storeService.GetStoresAsync(cancellationToken);
        }

        var summaries = stores.Select(store => new StoreSummaryDto
        {
            Id = store.Id,
            Name = store.Name,
            Location = store.Location,
            RegionId = store.RegionId,
            RegionName = store.Region?.Name ?? string.Empty
        });

        return Ok(summaries);
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    [ProducesResponseType(typeof(StoreSummaryDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateStore([FromBody] Store store, CancellationToken cancellationToken)
    {
        var created = await _storeService.CreateStoreAsync(store, cancellationToken);
        var regionName = store.Region?.Name ?? string.Empty;
        if (string.IsNullOrEmpty(regionName))
        {
            regionName = (await _storeService.GetStoreAsync(created.Id, cancellationToken))?.Region?.Name ?? string.Empty;
        }
        var summary = new StoreSummaryDto
        {
            Id = created.Id,
            Name = created.Name,
            Location = created.Location,
            RegionId = created.RegionId,
            RegionName = regionName
        };
        return CreatedAtAction(nameof(GetStore), new { id = created.Id }, summary);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    [ProducesResponseType(typeof(StoreSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetStore(Guid id, CancellationToken cancellationToken)
    {
        var store = await _storeService.GetStoreAsync(id, cancellationToken);
        if (store == null)
        {
            return NotFound();
        }

        return Ok(new StoreSummaryDto
        {
            Id = store.Id,
            Name = store.Name,
            Location = store.Location,
            RegionId = store.RegionId,
            RegionName = store.Region?.Name ?? string.Empty
        });
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    [ProducesResponseType(typeof(StoreSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateStore(Guid id, [FromBody] Store store, CancellationToken cancellationToken)
    {
        var updated = await _storeService.UpdateStoreAsync(id, store, cancellationToken);
        if (updated == null)
        {
            return NotFound();
        }

        var summary = new StoreSummaryDto
        {
            Id = updated.Id,
            Name = updated.Name,
            Location = updated.Location,
            RegionId = updated.RegionId,
            RegionName = updated.Region?.Name ?? string.Empty
        };

        if (string.IsNullOrEmpty(summary.RegionName))
        {
            summary.RegionName = (await _storeService.GetStoreAsync(updated.Id, cancellationToken))?.Region?.Name ?? string.Empty;
        }

        return Ok(summary);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteStore(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _storeService.DeleteStoreAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
