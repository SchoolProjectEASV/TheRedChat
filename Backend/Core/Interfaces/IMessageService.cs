using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core.Interfaces
{
    public interface IMessageService
    {
        /// <summary>
        /// Fetches he messages between two users
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="friendId"></param>
        /// <returns></returns>
        Task<IEnumerable<Message>> GetMessagesBetweenUsersAsync(Guid userId, Guid friendId);
    }
}
