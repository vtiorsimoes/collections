using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DebtRecovery.API.Data;
using DebtRecovery.API.Models;

namespace DebtRecovery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PromisesToPayController : ControllerBase
    {
        private readonly DebtRecoveryContext _context;

        public PromisesToPayController(DebtRecoveryContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<PromiseToPay>> CreatePromise(PromiseToPay promise)
        {
            promise.Status = "Active";
            _context.PromisesToPay.Add(promise);
            await _context.SaveChangesAsync();
            return Ok(promise);
        }
    }
}
