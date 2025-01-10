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
        /// <summary>
        /// Adds a friend to the user. 
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="friendUserId"></param>
        /// <returns></returns>
        Task AddFriend(Guid userId, Guid friendUserId);

        /// <summary>
        /// Fetches the friends of the user.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        Task<IEnumerable<User>> GetFriends(Guid userId);

        /// <summary>
        /// Removes a friend from the user.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="friendUserId"></param>
        /// <returns></returns>
        Task RemoveFriend(Guid userId, Guid friendUserId);
    }
}
