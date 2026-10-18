using Microsoft.EntityFrameworkCore;
using DebtRecovery.API.Models;

namespace DebtRecovery.API.Data
{
    public class DebtRecoveryContext : DbContext
    {
        public DebtRecoveryContext(DbContextOptions<DebtRecoveryContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<Interaction> Interactions { get; set; }
        public DbSet<TaskItem> Tasks { get; set; }
        public DbSet<PromiseToPay> PromisesToPay { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Customer>()
                .HasOne(c => c.Manager)
                .WithMany(u => u.ManagedCustomers)
                .HasForeignKey(c => c.ManagerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Interaction>()
                .HasOne(i => i.Customer)
                .WithMany(c => c.Interactions)
                .HasForeignKey(i => i.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TaskItem>()
                .HasOne(t => t.User)
                .WithMany(u => u.Tasks)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
