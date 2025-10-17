using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Dtos;

public class KpiDto
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string Metric { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal Change { get; set; }
    public string Trend { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}

public class SalesRecordDto
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string Department { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Target { get; set; }
    public decimal Variance { get; set; }
    public string Trend { get; set; } = string.Empty;
    public decimal Contribution { get; set; }
}

public class StoreSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Guid RegionId { get; set; }
    public string RegionName { get; set; } = string.Empty;
}

public class RegionSummaryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal TotalSales { get; set; }
    public decimal TotalTarget { get; set; }
    public decimal Variance => TotalTarget == 0 ? 0 : (TotalSales - TotalTarget) / TotalTarget * 100;
}

public class DashboardSummaryDto
{
    public required IEnumerable<KpiDto> Kpis { get; init; }
    public required IEnumerable<SalesRecordDto> Sales { get; init; }
    public required IEnumerable<TaskAssignment> Tasks { get; init; }
}

public class HqOverviewDto
{
    public required IEnumerable<RegionSummaryDto> Regions { get; init; }
    public required IEnumerable<StoreSummaryDto> Stores { get; init; }
}
