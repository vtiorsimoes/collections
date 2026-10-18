using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace DebtRecovery.API.Models
{
    public class User
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        [Required]
        public string Email { get; set; }
        [Required]
        public string Role { get; set; } // Admin, Supervisor, Manager

        // Navigation
        public List<Customer> ManagedCustomers { get; set; } = new();
        public List<TaskItem> Tasks { get; set; } = new();
    }

    public class Customer
    {
        public int Id { get; set; }
        [Required]
        public string Nif { get; set; }
        [Required]
        public string Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }

        public int? ManagerId { get; set; }
        public User Manager { get; set; }

        // Navigation
        public List<Invoice> Invoices { get; set; } = new();
        public List<Interaction> Interactions { get; set; } = new();
        public List<PromiseToPay> PromisesToPay { get; set; } = new();
    }

    public class Invoice
    {
        public int Id { get; set; }
        [Required]
        public string InvoiceNumber { get; set; }
        public decimal Amount { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime DueDate { get; set; }
        public DateTime IssueDate { get; set; }
        public string Status { get; set; } // Open, Paid, Overdue

        public int CustomerId { get; set; }
        public Customer Customer { get; set; }
    }

    public class Interaction
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Type { get; set; } // Call, Email, SMS, Letter
        public string Notes { get; set; }

        public int CustomerId { get; set; }
        public Customer Customer { get; set; }

        public int UserId { get; set; } // Who registered it
        public User User { get; set; }
    }

    public class TaskItem
    {
        public int Id { get; set; }
        [Required]
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; } // Pending, Completed

        public int? CustomerId { get; set; }
        public Customer Customer { get; set; }

        public int UserId { get; set; } // Who it belongs to
        public User User { get; set; }
    }

    public class PromiseToPay
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime PromiseDate { get; set; }
        public string Status { get; set; } // Active, Fulfilled, Broken

        public int CustomerId { get; set; }
        public Customer Customer { get; set; }

        public int? InvoiceId { get; set; }
        public Invoice Invoice { get; set; }
    }
}
