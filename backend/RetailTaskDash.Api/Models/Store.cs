namespace RetailTaskDash.Api.Models;

public class Store
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Guid RegionId { get; set; }

    public Region? Region { get; set; }

    public ICollection<UserStoreAssignment> UserAssignments { get; set; } = new List<UserStoreAssignment>();
}
