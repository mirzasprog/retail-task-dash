using Microsoft.AspNetCore.Mvc;
using RetailTaskDash.Api.Models;
using RetailTaskDash.Api.Services;

namespace RetailTaskDash.Api.Controllers;

[ApiController]
[Route("api/stores/{storeId:guid}")]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;
    private readonly TaskService _taskService;

    public DashboardController(DashboardService dashboardService, TaskService taskService)
    {
        _dashboardService = dashboardService;
        _taskService = taskService;
    }

    [HttpGet("kpis")]
    [ProducesResponseType(typeof(IEnumerable<KpiSnapshot>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetKpis(Guid storeId, CancellationToken cancellationToken)
    {
        var kpis = await _dashboardService.GetKpisAsync(storeId, cancellationToken);
        return Ok(kpis);
    }

    [HttpGet("sales/history")]
    [ProducesResponseType(typeof(IEnumerable<SalesSnapshot>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSalesHistory(Guid storeId, CancellationToken cancellationToken)
    {
        var sales = await _dashboardService.GetSalesHistoryAsync(storeId, cancellationToken);
        return Ok(sales);
    }

    [HttpGet("tasks/today")]
    [ProducesResponseType(typeof(IEnumerable<TaskAssignment>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTodayTasks(Guid storeId, CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetTodayTasksAsync(storeId, DateTime.UtcNow, cancellationToken);
        return Ok(tasks);
    }

    [HttpGet("tasks")]
    [ProducesResponseType(typeof(IEnumerable<TaskAssignment>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllTasks(Guid storeId, CancellationToken cancellationToken)
    {
        var tasks = await _taskService.GetAllTasksAsync(storeId, cancellationToken);
        return Ok(tasks);
    }
}
