using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Models;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using System.Data.Entity;

namespace MyRealtimeApp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
        {
            var user = new User
            {
                UserName = dto.Username,
                PublicKey = dto.PublicKey
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { message = "User registered successfully." });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            var user = await _userManager.FindByNameAsync(dto.Username);
            if (user == null)
                return Unauthorized("Invalid username or password.");

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!isPasswordValid)
                return Unauthorized("Invalid username or password.");

            var token = GenerateJwtToken(user);
            var userId = user.Id;

            return Ok(new
            {
                token,
                userId
            });
        }

        [Authorize]
        [HttpGet("keys/{userId}")]
        public async Task<IActionResult> GetPublicKey(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());

            if (user == null)
                return NotFound(new { message = "User not found" });

            if (string.IsNullOrEmpty(user.PublicKey))
                return NotFound(new { message = "Public key not found for user" });

            return Ok(new { publicKey = user.PublicKey });
        }

        [HttpGet("getUsernames")]
        public async Task<ActionResult<List<string>>> GetUsernames()
        {
            try
            {
                var users = _userManager.Users.ToList(); 
                var usernames = users.Select(u => u.UserName).ToList(); 

                if (usernames == null || !usernames.Any())
                {
                    return NoContent(); 
                }

                return Ok(usernames); 
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message); 
            }
        }

        private string GenerateJwtToken(User user)
        {
            var secretKey = Encoding.UTF8.GetBytes(_configuration["JwtSettings:SecretKey"]);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.UserName ?? string.Empty)
            };

            var creds = new SigningCredentials(new SymmetricSecurityKey(secretKey),
                SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
