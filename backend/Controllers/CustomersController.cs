using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DebtRecovery.API.Data;
using DebtRecovery.API.Models;

namespace DebtRecovery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly DebtRecoveryContext _context;

        public CustomersController(DebtRecoveryContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCustomers([FromQuery] int? managerId)
        {
            var query = _context.Customers.AsQueryable();
            if (managerId.HasValue)
            {
                query = query.Where(c => c.ManagerId == managerId.Value);
            }

            return await query.Select(c => new {
                c.Id, c.Nif, c.Name, c.Email, c.Phone
            }).ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetCustomer(int id)
        {
            var customer = await _context.Customers
                .Include(c => c.Invoices)
                .Include(c => c.Interactions.OrderByDescending(i => i.Date))
                .Include(c => c.PromisesToPay)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
            {
                return NotFound();
            }

            return new {
                customer.Id, customer.Nif, customer.Name, customer.Email, customer.Phone,
                Invoices = customer.Invoices.Select(i => new { i.Id, i.InvoiceNumber, i.Amount, i.PaidAmount, i.DueDate, i.Status }),
                Interactions = customer.Interactions.Select(i => new { i.Id, i.Date, i.Type, i.Notes }),
                PromisesToPay = customer.PromisesToPay.Select(p => new { p.Id, p.Amount, p.PromiseDate, p.Status })
            };
        }

        [HttpPost]
        public async Task<ActionResult<Customer>> PostCustomer(Customer customer)
        {
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
        }
    }
}
