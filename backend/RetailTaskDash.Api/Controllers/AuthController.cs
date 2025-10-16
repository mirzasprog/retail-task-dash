using Microsoft.AspNetCore.Mvc;
using RetailTaskDash.Api.Contracts.Auth;
using RetailTaskDash.Api.Services;

namespace RetailTaskDash.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var user = await _authService.AuthenticateAsync(request.Email, request.Password, cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        var response = new LoginResponse
        {
            UserId = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            Role = user.Role,
            Token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
        };

        return Ok(response);
    }
}
