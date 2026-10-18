using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DebtRecovery.API.Data;
using DebtRecovery.API.Models;

namespace DebtRecovery.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly DebtRecoveryContext _context;

        public UsersController(DebtRecoveryContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<User>> PostUser(User user)
        {
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
        }
    }
}
