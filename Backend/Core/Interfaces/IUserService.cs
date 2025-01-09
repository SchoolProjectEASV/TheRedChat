using Models;

namespace Core.Interfaces
{
    public interface IUserService
    {
        Task<User> GetUserById(Guid id);
        Task<User> GetUserByUsername(string username);

        Task RegisterUser(User user, string password);

        Task<bool> ValidateUserCredentials(string username, string password);

        Task<List<User>> GetAllUsers();


    }
}