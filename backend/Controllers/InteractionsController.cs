using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DebtRecovery.API.Data;
using DebtRecovery.API.Models;

namespace DebtRecovery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InteractionsController : ControllerBase
    {
        private readonly DebtRecoveryContext _context;

        public InteractionsController(DebtRecoveryContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<Interaction>> CreateInteraction(Interaction interaction)
        {
            interaction.Date = DateTime.UtcNow;
            _context.Interactions.Add(interaction);
            await _context.SaveChangesAsync();
            return Ok(interaction);
        }
    }
}
