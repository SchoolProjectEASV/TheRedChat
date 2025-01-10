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

        /// <summary>
        /// Send a message to a friend. The message is saved in the database and sent to the receiver.
        /// </summary>
        /// <param name="receiverId"></param>
        /// <param name="content"></param>
        /// <returns></returns>
        /// <exception cref="HubException"></exception>
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

            await Clients.Group(receiverId.ToString())
                .SendAsync("ReceiveMessage", senderId, receiverId, content, message.SentAt);

            await Clients.Caller
                .SendAsync("ReceiveMessage", senderId, receiverId, content, message.SentAt);
        }

        /// <summary>
        /// Connect the user to their own group when they connect to the hub. This way, we can send messages to the user.
        /// </summary>
        /// <returns></returns>
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            }

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Disconnect the user from their group when they disconnect from the hub. This way, we can stop sending messages to the user.
        /// </summary>
        /// <param name="exception"></param>
        /// <returns></returns>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
