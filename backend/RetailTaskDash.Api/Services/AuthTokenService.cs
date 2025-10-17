using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using RetailTaskDash.Api.Configuration;
using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Services;

public class AuthTokenService
{
    private readonly JwtOptions _options;

    public AuthTokenService(IOptions<JwtOptions> options)
    {
        _options = options.Value;
    }

    public string CreateToken(User user)
    {
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString())
        };

        if (user.RegionId.HasValue)
        {
            claims.Add(new Claim("regionId", user.RegionId.Value.ToString()));
        }

        if (user.StoreId.HasValue)
        {
            claims.Add(new Claim("storeId", user.StoreId.Value.ToString()));
        }

        foreach (var assignment in user.StoreAssignments)
        {
            claims.Add(new Claim("storeAssignment", assignment.StoreId.ToString()));
        }

        var token = new JwtSecurityToken(
            _options.Issuer,
            _options.Audience,
            claims,
            expires: DateTime.UtcNow.AddMinutes(_options.ExpiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
