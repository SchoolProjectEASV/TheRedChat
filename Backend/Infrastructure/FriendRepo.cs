using Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
    public class FriendRepo : IFriendRepo
    {
        private readonly AppDbContext _dbContext;

        public FriendRepo(AppDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<Friend> GetFriendRelation(Guid userId, Guid friendUserId)
        {
            return await _dbContext.Friends
                .FirstOrDefaultAsync(f => f.UserId == userId && f.FriendUserId == friendUserId);
        }

        public async Task AddFriend(Friend friend)
        {
            await _dbContext.Friends.AddAsync(friend);
            await _dbContext.SaveChangesAsync();
        }

        public async Task<IEnumerable<Friend>> GetFriendsForUser(Guid userId)
        {
            return await _dbContext.Friends
                .Include(f => f.FriendUser)
                .Where(f => f.UserId == userId)
                .ToListAsync();
        }

        public async Task RemoveFriend(Friend friend)
        {
            _dbContext.Friends.Remove(friend);
            await _dbContext.SaveChangesAsync();
        }
    }
}
