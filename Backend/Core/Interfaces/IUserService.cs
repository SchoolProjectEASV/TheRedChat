using Models;

namespace Core.Interfaces
{
    public interface IUserService
    {

        /// <summary>
        /// Fetches a user by it's ID
        /// </summary>
        /// <param name="id">The ID of the user</param>
        /// <returns></returns>
        Task<User> GetUserById(Guid id);

        /// <summary>
        /// Gets an user based on it's username.
        /// </summary>
        /// <param name="username">Username of the user</param>
        /// <returns></returns>
        Task<User> GetUserByUsername(string username);

        /// <summary>
        /// Registers a new user with a username and password
        /// </summary>
        /// <param name="user">User being registered</param>
        /// <param name="password">Password of the user</param>
        /// <returns></returns>

        Task RegisterUser(User user, string password);

        /// <summary>
        /// Validates the user credentials based on the username and password provided
        /// </summary>
        /// <param name="username">Username of the user</param>
        /// <param name="password">Password of the user</param>
        /// <returns></returns>

        Task<bool> ValidateUserCredentials(string username, string password);

        /// <summary>
        /// Gets all the users in the database
        /// </summary>
        /// <returns></returns>
        Task<List<User>> GetAllUsers();


    }
}