using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RetailTaskDash.Api.Models;

public class User
{
    public Guid Id { get; set; }

    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(128)]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(128)]
    public string FullName { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public Guid? RegionId { get; set; }

    public Guid? StoreId { get; set; }

    [ForeignKey(nameof(RegionId))]
    public Region? Region { get; set; }

    [ForeignKey(nameof(StoreId))]
    public Store? Store { get; set; }

    public ICollection<UserStoreAssignment> StoreAssignments { get; set; } = new List<UserStoreAssignment>();
}
