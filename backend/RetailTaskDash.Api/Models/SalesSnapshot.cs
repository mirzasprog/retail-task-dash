namespace RetailTaskDash.Api.Models;

public class SalesSnapshot
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string Department { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Target { get; set; }
    public decimal Variance { get; set; }
    public string Trend { get; set; } = "up";
    public decimal Contribution { get; set; }
    public DateTime SnapshotDate { get; set; }
}
