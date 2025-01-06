using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Interfaces
{
    public interface IFriendRepo
    {
        Task<Friend> GetFriendRelation(Guid userId, Guid friendUserId);
        Task AddFriend(Friend friend);
        Task<IEnumerable<Friend>> GetFriendsForUser(Guid userId);
        Task RemoveFriend(Friend friend);

    }
}
