using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RetailTaskDash.Api.Dtos;
using RetailTaskDash.Api.Services;

namespace RetailTaskDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserService _userService;
    private readonly AuthTokenService _tokenService;

    public AuthController(UserService userService, AuthTokenService tokenService)
    {
        _userService = userService;
        _tokenService = tokenService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await _userService.GetUserByEmailAsync(request.Email, cancellationToken);
        if (user == null || !_userService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized();
        }

        var storeAssignments = user.StoreAssignments?.Select(sa => sa.StoreId).ToList() ?? new List<Guid>();
        var token = _tokenService.CreateToken(user);

        var response = new LoginResponse
        {
            Token = token,
            User = new UserProfileDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role,
                RegionId = user.RegionId,
                StoreId = user.StoreId,
                Stores = storeAssignments
            }
        };

        return Ok(response);
    }
}
