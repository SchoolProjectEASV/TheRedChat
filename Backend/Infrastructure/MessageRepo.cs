using Infrastructure.Interfaces;
using Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure
{
    public class MessageRepo : IMessageRepo
    {
        private readonly AppDbContext _dbContext;

        public MessageRepo(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<IEnumerable<Message>> GetMessagesBetweenUsersAsync(Guid userId, Guid friendId)
        {
            return await _dbContext.Messages
                .Where(m =>
                    (m.SenderId == userId && m.ReceiverId == friendId) ||
                    (m.SenderId == friendId && m.ReceiverId == userId))
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }
    }
}
