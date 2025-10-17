using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailTaskDash.Api.Models;
using RetailTaskDash.Api.Services;

namespace RetailTaskDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegionsController : ControllerBase
{
    private readonly RegionService _regionService;

    public RegionsController(RegionService regionService)
    {
        _regionService = regionService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<Region>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRegions(CancellationToken cancellationToken)
    {
        var regions = await _regionService.GetRegionsAsync(cancellationToken);
        return Ok(regions);
    }
}
