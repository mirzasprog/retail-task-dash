namespace RetailTaskDash.Api.Models;

public class KpiSnapshot
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string Metric { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal Change { get; set; }
    public string Trend { get; set; } = "up";
    public string Status { get; set; } = "good";
    public DateTime SnapshotDate { get; set; }
}
