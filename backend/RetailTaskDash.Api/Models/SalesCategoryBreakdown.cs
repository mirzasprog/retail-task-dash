namespace RetailTaskDash.Api.Models;

public class SalesCategoryBreakdown
{
    public Guid StoreId { get; set; }
    public string Category { get; set; } = string.Empty;
    public decimal Sales { get; set; }
    public decimal Percentage { get; set; }
}
