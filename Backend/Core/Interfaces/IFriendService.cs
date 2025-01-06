using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IFriendService
    {
        Task AddFriend(Guid userId, Guid friendUserId);
        Task<IEnumerable<User>> GetFriends(Guid userId);
        Task RemoveFriend(Guid userId, Guid friendUserId);
    }
}
