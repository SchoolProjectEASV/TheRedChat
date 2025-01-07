using Core;
using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.DTOs;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace MyRealtimeApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FriendsController : ControllerBase
    {
        private readonly IFriendService _friendService;

        public FriendsController(IFriendService friendService)
        {
            _friendService = friendService;
        }

        [Authorize]
        [HttpPost("add")]
        public async Task<IActionResult> AddFriend([FromBody] AddFriendDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return BadRequest("Invalid user ID.");

            try
            {
                await _friendService.AddFriend(userId, dto.FriendUserId);
                return Ok("Friend added successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        [HttpGet("list")]
        public async Task<IActionResult> GetFriends()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return BadRequest("Invalid user ID.");

            var friends = await _friendService.GetFriends(userId);
            var response = new List<FriendDto>();

            foreach (var friend in friends)
            {
                response.Add(new FriendDto
                {
                    Id = friend.Id,
                    Username = friend.UserName,
                });
            }

            return Ok(response);
        }

        [Authorize]
        [HttpDelete("remove")]
        public async Task<IActionResult> RemoveFriend([FromBody] RemoveFriendDto dto)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out var userId))
                return BadRequest("Invalid user ID.");

            try
            {
                await _friendService.RemoveFriend(userId, dto.FriendUserId);
                return Ok("Friend removed successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
