namespace RetailTaskDash.Api.Models;

public class Region
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Store> Stores { get; set; } = new List<Store>();
}
