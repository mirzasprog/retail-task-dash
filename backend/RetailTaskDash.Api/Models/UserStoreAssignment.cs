namespace RetailTaskDash.Api.Models;

public class UserStoreAssignment
{
    public Guid UserId { get; set; }
    public Guid StoreId { get; set; }

    public User? User { get; set; }
    public Store? Store { get; set; }
}
