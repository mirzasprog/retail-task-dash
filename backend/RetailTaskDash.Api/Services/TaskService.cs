using Microsoft.EntityFrameworkCore;
using RetailTaskDash.Api.Data;
using RetailTaskDash.Api.Models;

namespace RetailTaskDash.Api.Services;

public class TaskService
{
    private readonly RetailTaskDashContext _context;

    public TaskService(RetailTaskDashContext context)
    {
        _context = context;
    }

    public Task<List<TaskAssignment>> GetTodayTasksAsync(Guid storeId, DateTime today, CancellationToken cancellationToken = default)
    {
        return _context.Tasks
            .Where(task => task.StoreId == storeId && task.DueDate.Date == today.Date)
            .OrderBy(task => task.DueDate)
            .ToListAsync(cancellationToken);
    }

    public Task<List<TaskAssignment>> GetAllTasksAsync(Guid storeId, CancellationToken cancellationToken = default)
    {
        return _context.Tasks
            .Where(task => task.StoreId == storeId)
            .OrderBy(task => task.DueDate)
            .ToListAsync(cancellationToken);
    }
}
