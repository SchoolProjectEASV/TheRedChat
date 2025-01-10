using Core.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models.DTOs;
using Models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly JwtTokenService _jwtService;

    public AuthController(IUserService userService, JwtTokenService jwtService)
    {
        _userService = userService;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO dto)
    {
        var user = new User
        {
            UserName = dto.Username,
            PublicKey = dto.PublicKey
        };

        try
        {
            await _userService.RegisterUser(user, dto.Password);
            return Ok(new { message = "User registered successfully." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { errors = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO dto)
    {
        var isValid = await _userService.ValidateUserCredentials(dto.Username, dto.Password);
        if (!isValid)
            return Unauthorized("Invalid username or password.");

        var user = await _userService.GetUserByUsername(dto.Username);
        var token = _jwtService.GenerateToken(user);

        return Ok(new
        {
            token
        });
    }

    [Authorize]
    [HttpGet("keys/{userId}")]
    public async Task<IActionResult> GetPublicKey(Guid userId)
    {
        var user = await _userService.GetUserById(userId);

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
            var users = await _userService.GetAllUsers();
            var usernames = users.Select(u => u.UserName).ToList();

            if (!usernames.Any())
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
}