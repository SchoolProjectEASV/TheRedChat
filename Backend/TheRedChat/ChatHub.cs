using Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Models;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyRealtimeApp.Api.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly AppDbContext _dbContext;

        public ChatHub(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task SendMessage(Guid receiverId, string content)
        {
            var senderIdStr = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(senderIdStr, out var senderId))
                return;

            var isFriend = await _dbContext.Friends
                .AnyAsync(f => f.UserId == senderId && f.FriendUserId == receiverId);
            if (!isFriend)
                throw new HubException("You can only send messages to friends.");

            var message = new Message
            {
                Id = Guid.NewGuid(),
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow
            };
            _dbContext.Messages.Add(message);
            await _dbContext.SaveChangesAsync();

            await Clients.User(receiverId.ToString())
                .SendAsync("ReceiveMessage", senderId, content, message.SentAt);
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userId, out var guid))
            {
            }

            await base.OnConnectedAsync();
        }
    }
}
