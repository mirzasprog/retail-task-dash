using Microsoft.AspNetCore.Mvc;
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
    [ProducesResponseType(typeof(IEnumerable<Store>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStores(CancellationToken cancellationToken)
    {
        var stores = await _storeService.GetStoresAsync(cancellationToken);
        return Ok(stores);
    }
}
