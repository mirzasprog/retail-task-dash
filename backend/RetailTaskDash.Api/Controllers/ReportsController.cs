using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailTaskDash.Api.Dtos;
using RetailTaskDash.Api.Models;
using RetailTaskDash.Api.Services;

namespace RetailTaskDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ReportingService _reportingService;
    private readonly ReportExportService _exportService;

    public ReportsController(ReportingService reportingService, ReportExportService exportService)
    {
        _reportingService = reportingService;
        _exportService = exportService;
    }

    [HttpGet("hq/overview")]
    [Authorize(Roles = nameof(UserRole.Headquarters) + "," + nameof(UserRole.Admin))]
    [ProducesResponseType(typeof(HqOverviewDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHqOverview([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, CancellationToken cancellationToken)
    {
        var overview = await _reportingService.GetHqOverviewAsync(startDate, endDate, cancellationToken);
        return Ok(overview);
    }

    [HttpGet("hq/export")]
    [Authorize(Roles = nameof(UserRole.Headquarters) + "," + nameof(UserRole.Admin))]
    public async Task<IActionResult> ExportHqReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, CancellationToken cancellationToken)
    {
        var overview = await _reportingService.GetHqOverviewAsync(startDate, endDate, cancellationToken);
        var bytes = _exportService.BuildExcelReport("HQ Overview", overview.Regions, overview.Stores);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "hq-overview.xlsx");
    }
}
