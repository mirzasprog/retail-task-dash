using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Dtos;

public record UserSummaryDto(Guid Id, string Email, string FullName, UserRole Role, Guid? RegionId, Guid? StoreId, IReadOnlyCollection<Guid> StoreAssignments);
