using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailTaskDash.Api.Dtos;
using RetailTaskDash.Api.Models;
using RetailTaskDash.Api.Services;
using System.Linq;
using System.Security.Claims;

namespace RetailTaskDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;
    private readonly TaskService _taskService;
    private readonly StoreService _storeService;

    public DashboardController(DashboardService dashboardService, TaskService taskService, StoreService storeService)
    {
        _dashboardService = dashboardService;
        _taskService = taskService;
        _storeService = storeService;
    }

    [HttpGet("store/{storeId:guid}")]
    [Authorize(Roles = nameof(UserRole.StoreManager) + "," + nameof(UserRole.AreaManager) + "," + nameof(UserRole.RegionalDirector) + "," + nameof(UserRole.Headquarters) + "," + nameof(UserRole.Admin))]
    [ProducesResponseType(typeof(DashboardSummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStoreDashboard(Guid storeId, CancellationToken cancellationToken)
    {
        if (!await IsStoreAccessible(storeId, cancellationToken))
        {
            return Forbid();
        }

        var dashboard = await _dashboardService.GetStoreDashboardAsync(storeId, cancellationToken);
        return Ok(dashboard);
    }

    [HttpGet("store/{storeId:guid}/tasks/today")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<TaskAssignment>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTodayTasks(Guid storeId, CancellationToken cancellationToken)
    {
        if (!await IsStoreAccessible(storeId, cancellationToken))
        {
            return Forbid();
        }

        var tasks = await _taskService.GetTodayTasksAsync(storeId, DateTime.UtcNow, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("store/{storeId:guid}/tasks")]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<TaskAssignment>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllTasks(Guid storeId, CancellationToken cancellationToken)
    {
        if (!await IsStoreAccessible(storeId, cancellationToken))
        {
            return Forbid();
        }

        var tasks = await _taskService.GetAllTasksAsync(storeId, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("region/{regionId:guid}/kpis")]
    [Authorize(Roles = nameof(UserRole.RegionalDirector) + "," + nameof(UserRole.Headquarters) + "," + nameof(UserRole.Admin))]
    [ProducesResponseType(typeof(IEnumerable<KpiDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRegionKpis(Guid regionId, CancellationToken cancellationToken)
    {
        if (!IsRegionAccessible(regionId))
        {
            return Forbid();
        }

        var kpis = await _dashboardService.GetRegionKpisAsync(regionId, cancellationToken);
        return Ok(kpis);
    }

    [HttpGet("region/{regionId:guid}/sales")]
    [Authorize(Roles = nameof(UserRole.RegionalDirector) + "," + nameof(UserRole.Headquarters) + "," + nameof(UserRole.Admin))]
    [ProducesResponseType(typeof(IEnumerable<SalesRecordDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRegionSales(Guid regionId, CancellationToken cancellationToken)
    {
        if (!IsRegionAccessible(regionId))
        {
            return Forbid();
        }

        var sales = await _dashboardService.GetRegionSalesAsync(regionId, cancellationToken);
        return Ok(sales);
    }

    private async Task<bool> IsStoreAccessible(Guid storeId, CancellationToken cancellationToken)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrEmpty(role))
        {
            return false;
        }

        if (role == UserRole.Admin.ToString() || role == UserRole.Headquarters.ToString())
        {
            return true;
        }

        if (role == UserRole.StoreManager.ToString())
        {
            var storeClaim = User.FindFirstValue("storeId");
            return Guid.TryParse(storeClaim, out var claimedStoreId) && claimedStoreId == storeId;
        }

        if (role == UserRole.AreaManager.ToString())
        {
            var assignments = User.Claims
                .Where(claim => claim.Type == "storeAssignment")
                .Select(claim => Guid.TryParse(claim.Value, out var id) ? id : Guid.Empty)
                .Where(id => id != Guid.Empty);

            return assignments.Contains(storeId);
        }

        if (role == UserRole.RegionalDirector.ToString())
        {
            var regionClaim = User.FindFirstValue("regionId");
            if (Guid.TryParse(regionClaim, out var regionId))
            {
                var store = await _storeService.GetStoreAsync(storeId, cancellationToken);
                return store != null && store.RegionId == regionId;
            }
        }

        return false;
    }

    private bool IsRegionAccessible(Guid regionId)
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrEmpty(role))
        {
            return false;
        }

        if (role == UserRole.Admin.ToString() || role == UserRole.Headquarters.ToString())
        {
            return true;
        }

        if (role == UserRole.RegionalDirector.ToString())
        {
            var regionClaim = User.FindFirstValue("regionId");
            return Guid.TryParse(regionClaim, out var claimedRegionId) && claimedRegionId == regionId;
        }

        return false;
    }
}
