namespace RetailTaskDash.Api.Models;

public class TaskAssignment
{
    public Guid Id { get; set; }
    public Guid StoreId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string Priority { get; set; } = "medium";
    public DateTime DueDate { get; set; }
    public string? AssignedTo { get; set; }
}
