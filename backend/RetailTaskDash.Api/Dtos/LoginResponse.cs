using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Dtos;

public class LoginResponse
{
    public required string Token { get; init; }
    public required UserProfileDto User { get; init; }
}

public class UserProfileDto
{
    public required Guid Id { get; init; }
    public required string Email { get; init; }
    public required string FullName { get; init; }
    public required UserRole Role { get; init; }
    public Guid? RegionId { get; init; }
    public Guid? StoreId { get; init; }
    public IReadOnlyCollection<Guid> Stores { get; init; } = Array.Empty<Guid>();
}
