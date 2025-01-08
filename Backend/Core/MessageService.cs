using Core.Interfaces;
using Infrastructure.Interfaces;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Core
{
    public class MessageService: IMessageService
    {
        private IMessageRepo _messageRepo;
        public MessageService(IMessageRepo messageRepo) 
        {
            _messageRepo = messageRepo;
        }

        public async Task<IEnumerable<Message>> GetMessagesBetweenUsersAsync(Guid userId, Guid friendId)
        {
            return await _messageRepo.GetMessagesBetweenUsersAsync(userId, friendId);
        }
    }
}
