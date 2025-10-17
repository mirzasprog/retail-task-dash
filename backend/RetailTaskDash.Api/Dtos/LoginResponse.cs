using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Dtos;

public class LoginResponse
{
    public string Token { get; init; } = string.Empty;
    public UserProfileDto User { get; init; } = new();
}

public class UserProfileDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public UserRole Role { get; init; }
    public Guid? RegionId { get; init; }
    public Guid? StoreId { get; init; }
    public IReadOnlyCollection<Guid> Stores { get; init; } = Array.Empty<Guid>();
}
