using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DebtRecovery.API.Data;
using DebtRecovery.API.Models;

namespace DebtRecovery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly DebtRecoveryContext _context;

        public TasksController(DebtRecoveryContext context)
        {
            _context = context;
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<TaskItem>>> GetUserTasks(int userId)
        {
            return await _context.Tasks
                .Include(t => t.Customer)
                .Where(t => t.UserId == userId)
                .OrderBy(t => t.DueDate)
                .ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<TaskItem>> CreateTask(TaskItem task)
        {
            task.Status = "Pending";
            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUserTasks), new { userId = task.UserId }, task);
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            task.Status = "Completed";
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
