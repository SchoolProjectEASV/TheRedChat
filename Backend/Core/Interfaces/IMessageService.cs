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
        Task<IEnumerable<Message>> GetMessagesBetweenUsersAsync(Guid userId, Guid friendId);
    }
}
