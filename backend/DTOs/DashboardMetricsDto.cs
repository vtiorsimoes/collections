using System;

namespace DebtRecovery.API.DTOs
{
    public class DashboardMetricsDto
    {
        public decimal TotalDebt { get; set; }
        public decimal TotalOverdue { get; set; }
        public int TasksToday { get; set; }
        public int OverdueTasks { get; set; }
        public int PendingInvoicesCount { get; set; }
    }
}
