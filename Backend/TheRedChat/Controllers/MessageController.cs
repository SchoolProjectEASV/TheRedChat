using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace TheRedChatAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/messages")]
    [EnableCors("AllowSpecificOrigins")]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;

        public MessagesController(IMessageService messageService)
        {
            _messageService = messageService;
        }

        [HttpGet("{friendId}")]
        public async Task<IActionResult> GetMessages(Guid friendId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return BadRequest("Invalid user ID.");

            var messages = await _messageService.GetMessagesBetweenUsersAsync(userId, friendId);
            return Ok(messages);
        }

    }
}
