using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DebtRecovery.API.Data;
using DebtRecovery.API.Models;

namespace DebtRecovery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AlertsController : ControllerBase
    {
        private readonly DebtRecoveryContext _context;

        public AlertsController(DebtRecoveryContext context)
        {
            _context = context;
        }

        [HttpGet("{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetAlerts(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("User not found");

            var alerts = new List<object>();

            // Simplified logic: If manager, check their customers. Otherwise, check all.
            IQueryable<Customer> customerQuery = _context.Customers;
            if (user.Role == "Manager")
            {
                customerQuery = customerQuery.Where(c => c.ManagerId == userId);
            }

            var customerIds = await customerQuery.Select(c => c.Id).ToListAsync();

            // 1. Invoices Overdue by 90+ days
            var ninetyDaysAgo = DateTime.Today.AddDays(-90);
            var overdueInvoices = await _context.Invoices
                .Include(i => i.Customer)
                .Where(i => customerIds.Contains(i.CustomerId) && i.Status != "Paid" && i.DueDate <= ninetyDaysAgo)
                .ToListAsync();

            foreach (var invoice in overdueInvoices)
            {
                alerts.Add(new {
                    Id = $"inv_{invoice.Id}",
                    Type = "InvoiceOverdue",
                    Message = $"Fatura #{invoice.InvoiceNumber} do cliente {invoice.Customer.Name} está atrasada há mais de 90 dias.",
                    Date = invoice.DueDate,
                    CustomerId = invoice.CustomerId
                });
            }

            // 2. Missed Promises to Pay
            var today = DateTime.Today;
            var missedPromises = await _context.PromisesToPay
                .Include(p => p.Customer)
                .Where(p => customerIds.Contains(p.CustomerId) && p.Status == "Active" && p.PromiseDate < today)
                .ToListAsync();

            foreach (var promise in missedPromises)
            {
                alerts.Add(new {
                    Id = $"prom_{promise.Id}",
                    Type = "MissedPromise",
                    Message = $"Promessa de pagamento de €{promise.Amount} do cliente {promise.Customer.Name} falhou no dia {promise.PromiseDate:dd/MM/yyyy}.",
                    Date = promise.PromiseDate,
                    CustomerId = promise.CustomerId
                });
            }

            return Ok(alerts.OrderByDescending(a => ((dynamic)a).Date).ToList());
        }
    }
}
