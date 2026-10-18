using DebtRecovery.API.Data;
using DebtRecovery.API.DTOs;
using DebtRecovery.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DebtRecovery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly DebtRecoveryContext _context;

        public DashboardController(DebtRecoveryContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<DashboardMetricsDto>> GetMetrics(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            // Simplified: For Manager, get their customers' invoices. For Admin/Supervisor, get all.
            IQueryable<Invoice> invoicesQuery = _context.Invoices;
            if (user.Role == "Manager")
            {
                invoicesQuery = invoicesQuery.Where(i => i.Customer.ManagerId == userId);
            }

            var openInvoices = await invoicesQuery.Where(i => i.Status != "Paid").ToListAsync();
            var totalDebt = openInvoices.Sum(i => i.Amount - i.PaidAmount);
            var totalOverdue = openInvoices.Where(i => i.DueDate < DateTime.Today).Sum(i => i.Amount - i.PaidAmount);

            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);

            var tasksToday = await _context.Tasks
                .CountAsync(t => t.UserId == userId && t.DueDate >= today && t.DueDate < tomorrow && t.Status != "Completed");

            var overdueTasks = await _context.Tasks
                .CountAsync(t => t.UserId == userId && t.DueDate < today && t.Status != "Completed");

            return new DashboardMetricsDto
            {
                TotalDebt = totalDebt,
                TotalOverdue = totalOverdue,
                TasksToday = tasksToday,
                OverdueTasks = overdueTasks,
                PendingInvoicesCount = openInvoices.Count
            };
        }
    }
}
