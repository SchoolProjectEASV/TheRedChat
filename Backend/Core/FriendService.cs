using Core.Interfaces;
using Infrastructure.Interfaces;
using Microsoft.AspNetCore.Identity;
using Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Core
{
    public class FriendService : IFriendService
    {
        private readonly IFriendRepo _friendRepo;
        private readonly UserManager<User> _userManager;

        public FriendService(IFriendRepo friendRepo, UserManager<User> userManager)
        {
            _friendRepo = friendRepo;
            _userManager = userManager;
        }

        public async Task AddFriend(Guid userId, Guid friendUserId)
        {
            if (userId == friendUserId)
                throw new ArgumentException("Users cannot be friends with themselves.");

            var user = await _userManager.FindByIdAsync(userId.ToString());
            var friendUser = await _userManager.FindByIdAsync(friendUserId.ToString());
            if (user == null || friendUser == null)
                throw new Exception("One of the users does not exist.");

            var existing = await _friendRepo.GetFriendRelation(userId, friendUserId);
            if (existing != null)
                throw new Exception("Already friends.");

            // Add friendship in both directions
            var friend = new Friend
            {
                UserId = userId,
                FriendUserId = friendUserId
            };
            var reverseFriend = new Friend
            {
                UserId = friendUserId,
                FriendUserId = userId
            };
            await _friendRepo.AddFriend(friend);
            await _friendRepo.AddFriend(reverseFriend);
        }



        public async Task<IEnumerable<User>> GetFriends(Guid userId)
        {
            var friendRelations = await _friendRepo.GetFriendsForUser(userId);
            var friends = friendRelations.Select(fr => fr.FriendUser);
            return friends;
        }

        public async Task RemoveFriend(Guid userId, Guid friendUserId)
        {
            var relation = await _friendRepo.GetFriendRelation(userId, friendUserId);
            var reverseRelation = await _friendRepo.GetFriendRelation(friendUserId, userId);

            if (relation == null || reverseRelation == null)
                throw new Exception("Friend relationship does not exist.");

            await _friendRepo.RemoveFriend(relation);
            await _friendRepo.RemoveFriend(reverseRelation);
        }
    }
}
