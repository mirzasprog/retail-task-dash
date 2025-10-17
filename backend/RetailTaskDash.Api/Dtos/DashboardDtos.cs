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
    public IEnumerable<KpiDto> Kpis { get; init; } = Array.Empty<KpiDto>();
    public IEnumerable<SalesRecordDto> Sales { get; init; } = Array.Empty<SalesRecordDto>();
    public IEnumerable<TaskAssignment> Tasks { get; init; } = Array.Empty<TaskAssignment>();
}

public class HqOverviewDto
{
    public IEnumerable<RegionSummaryDto> Regions { get; init; } = Array.Empty<RegionSummaryDto>();
    public IEnumerable<StoreSummaryDto> Stores { get; init; } = Array.Empty<StoreSummaryDto>();
}
