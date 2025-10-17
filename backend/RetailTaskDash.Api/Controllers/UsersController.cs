using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailTaskDash.Api.Dtos;
using RetailTaskDash.Api.Models;
using RetailTaskDash.Api.Services;

namespace RetailTaskDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = nameof(UserRole.Admin))]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;

    public UsersController(UserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserSummaryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var users = await _userService.GetUsersAsync(cancellationToken);
        var summaries = users.Select(user => new UserSummaryDto(
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.RegionId,
            user.StoreId,
            user.StoreAssignments.Select(sa => sa.StoreId).ToArray()
        ));
        return Ok(summaries);
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateUser([FromBody] UserCreateRequest request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            Role = request.Role,
            RegionId = request.RegionId,
            StoreId = request.StoreId
        };

        var created = await _userService.CreateUserAsync(user, request.Password, request.StoreAssignments, cancellationToken);
        var summary = new UserSummaryDto(created.Id, created.Email, created.FullName, created.Role, created.RegionId, created.StoreId, request.StoreAssignments?.ToArray() ?? Array.Empty<Guid>());
        return CreatedAtAction(nameof(GetUser), new { id = created.Id }, summary);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUser(Guid id, CancellationToken cancellationToken)
    {
        var user = await _userService.GetUserAsync(id, cancellationToken);
        if (user == null)
        {
            return NotFound();
        }

        return Ok(new UserSummaryDto(user.Id, user.Email, user.FullName, user.Role, user.RegionId, user.StoreId, user.StoreAssignments.Select(sa => sa.StoreId).ToArray()));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(UserSummaryDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UserUpdateRequest request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            Role = request.Role,
            RegionId = request.RegionId,
            StoreId = request.StoreId
        };

        var updated = await _userService.UpdateUserAsync(id, user, request.Password, request.StoreAssignments, cancellationToken);
        if (updated == null)
        {
            return NotFound();
        }

        return Ok(new UserSummaryDto(updated.Id, updated.Email, updated.FullName, updated.Role, updated.RegionId, updated.StoreId, (await _userService.GetUserAsync(updated.Id, cancellationToken))?.StoreAssignments.Select(sa => sa.StoreId).ToArray() ?? Array.Empty<Guid>()));
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _userService.DeleteUserAsync(id, cancellationToken);
        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    public record UserCreateRequest(string Email, string Password, string FullName, UserRole Role, Guid? RegionId, Guid? StoreId, IEnumerable<Guid>? StoreAssignments);
    public record UserUpdateRequest(string Email, string? Password, string FullName, UserRole Role, Guid? RegionId, Guid? StoreId, IEnumerable<Guid>? StoreAssignments);
}
