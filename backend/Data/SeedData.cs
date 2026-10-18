using DebtRecovery.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DebtRecovery.API.Data
{
    public static class SeedData
    {
        public static async Task Initialize(IServiceProvider serviceProvider)
        {
            using var context = new DebtRecoveryContext(
                serviceProvider.GetRequiredService<DbContextOptions<DebtRecoveryContext>>());

            if (await context.Users.AnyAsync())
            {
                return; // DB has been seeded
            }

            var user = new User { Name = "Gestor Teste", Email = "gestor@teste.com", Role = "Manager" };
            context.Users.Add(user);
            await context.SaveChangesAsync();

            var customer = new Customer { Name = "Cliente Inadimplente Lda", Nif = "123456789", Email = "cliente@teste.com", Phone = "912345678", ManagerId = user.Id };
            context.Customers.Add(customer);
            await context.SaveChangesAsync();

            context.Invoices.AddRange(
                new Invoice { InvoiceNumber = "FT 2023/1", Amount = 1500.50m, PaidAmount = 0, DueDate = DateTime.Today.AddDays(-100), IssueDate = DateTime.Today.AddDays(-130), Status = "Overdue", CustomerId = customer.Id },
                new Invoice { InvoiceNumber = "FT 2023/2", Amount = 500.00m, PaidAmount = 0, DueDate = DateTime.Today.AddDays(10), IssueDate = DateTime.Today.AddDays(-20), Status = "Open", CustomerId = customer.Id }
            );

            context.PromisesToPay.Add(
                new PromiseToPay { Amount = 1500.50m, PromiseDate = DateTime.Today.AddDays(-5), Status = "Active", CustomerId = customer.Id }
            );

            context.Tasks.Add(
                new TaskItem { Title = "Ligar ao cliente", Description = "Cobrar fatura atrasada", DueDate = DateTime.Today, Status = "Pending", CustomerId = customer.Id, UserId = user.Id }
            );

            await context.SaveChangesAsync();
        }
    }
}
