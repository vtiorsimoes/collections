using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DebtRecovery.API.Data;
using DebtRecovery.API.Models;
using OfficeOpenXml;

namespace DebtRecovery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvoicesController : ControllerBase
    {
        private readonly DebtRecoveryContext _context;

        public InvoicesController(DebtRecoveryContext context)
        {
            _context = context;
        }

        [HttpPost("import")]
        public async Task<IActionResult> ImportInvoices(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File is empty");

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using var stream = new MemoryStream();
            await file.CopyToAsync(stream);

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets[0];
            var rowCount = worksheet.Dimension.Rows;

            var importedCount = 0;

            for (int row = 2; row <= rowCount; row++) // Assuming row 1 is header
            {
                var invoiceNumber = worksheet.Cells[row, 1].Value?.ToString();
                var customerNif = worksheet.Cells[row, 2].Value?.ToString();
                var customerName = worksheet.Cells[row, 3].Value?.ToString();
                var amountStr = worksheet.Cells[row, 4].Value?.ToString();
                var dueDateStr = worksheet.Cells[row, 5].Value?.ToString();

                if (string.IsNullOrEmpty(invoiceNumber) || string.IsNullOrEmpty(customerNif)) continue;

                if (!decimal.TryParse(amountStr, out var amount)) continue;
                if (!DateTime.TryParse(dueDateStr, out var dueDate)) continue;

                var customer = await _context.Customers.FirstOrDefaultAsync(c => c.Nif == customerNif);
                if (customer == null)
                {
                    customer = new Customer { Nif = customerNif, Name = customerName ?? "Unknown" };
                    _context.Customers.Add(customer);
                    await _context.SaveChangesAsync();
                }

                var existingInvoice = await _context.Invoices.FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);
                if (existingInvoice == null)
                {
                    var invoice = new Invoice
                    {
                        InvoiceNumber = invoiceNumber,
                        Amount = amount,
                        DueDate = dueDate,
                        IssueDate = DateTime.Today,
                        Status = dueDate < DateTime.Today ? "Overdue" : "Open",
                        CustomerId = customer.Id
                    };
                    _context.Invoices.Add(invoice);
                    importedCount++;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Successfully imported {importedCount} invoices." });
        }
    }
}
