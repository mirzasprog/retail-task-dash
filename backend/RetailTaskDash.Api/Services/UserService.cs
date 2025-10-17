using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Models;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace RetailTaskDash.Api.Services;

public class UserService
{
    private readonly RetailTaskDashContext _context;

    public UserService(RetailTaskDashContext context)
    {
        _context = context;
    }

    public Task<List<User>> GetUsersAsync(CancellationToken cancellationToken = default)
    {
        return _context.Users
            .AsNoTracking()
            .Include(u => u.StoreAssignments)
            .OrderBy(u => u.FullName)
            .ToListAsync(cancellationToken);
    }

    public Task<User?> GetUserByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return _context.Users
            .Include(u => u.StoreAssignments)
            .ThenInclude(sa => sa.Store)
            .FirstOrDefaultAsync(u => u.Email == email, cancellationToken);
    }

    public Task<User?> GetUserAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _context.Users
            .Include(u => u.StoreAssignments)
            .ThenInclude(sa => sa.Store)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User> CreateUserAsync(User user, string password, IEnumerable<Guid>? storeAssignments = null, CancellationToken cancellationToken = default)
    {
        user.Id = Guid.NewGuid();
        user.PasswordHash = HashPassword(password);
        _context.Users.Add(user);

        if (storeAssignments != null)
        {
            foreach (var storeId in storeAssignments.Distinct())
            {
                _context.UserStoreAssignments.Add(new UserStoreAssignment
                {
                    UserId = user.Id,
                    StoreId = storeId
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task<User?> UpdateUserAsync(Guid id, User updated, string? password, IEnumerable<Guid>? storeAssignments = null, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null)
        {
            return null;
        }

        user.FullName = updated.FullName;
        user.Email = updated.Email;
        user.Role = updated.Role;
        user.RegionId = updated.RegionId;
        user.StoreId = updated.StoreId;

        if (!string.IsNullOrEmpty(password))
        {
            user.PasswordHash = HashPassword(password);
        }

        if (storeAssignments != null)
        {
            var existing = await _context.UserStoreAssignments.Where(a => a.UserId == user.Id).ToListAsync(cancellationToken);
            _context.UserStoreAssignments.RemoveRange(existing);

            foreach (var storeId in storeAssignments.Distinct())
            {
                _context.UserStoreAssignments.Add(new UserStoreAssignment
                {
                    UserId = user.Id,
                    StoreId = storeId
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task<bool> DeleteUserAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user == null)
        {
            return false;
        }

        var assignments = await _context.UserStoreAssignments.Where(a => a.UserId == id).ToListAsync(cancellationToken);
        _context.UserStoreAssignments.RemoveRange(assignments);

        _context.Users.Remove(user);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }
}
