using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Services;

public class AuthService
{
    private readonly RetailTaskDashContext _context;

    public AuthService(RetailTaskDashContext context)
    {
        _context = context;
    }

    public async Task<UserAccount?> AuthenticateAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = email.Trim().ToLowerInvariant();
        var user = await _context.Users
            .AsNoTracking()
            .SingleOrDefaultAsync(account => account.Email.ToLowerInvariant() == normalizedEmail, cancellationToken);

        if (user is null)
        {
            return null;
        }

        var computedHash = ComputeHash(password, user.PasswordSalt);
        return user.PasswordHash == computedHash ? user : null;
    }

    public static string ComputeHash(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password + salt);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
