using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;

public class JwtTokenService
{
    private readonly RsaSecurityKey _rsaKey;
    private readonly string _issuer;
    private readonly string _audience;

    /// <summary>
    /// Configuration is used to get the private key from the appsettings.json file and create a new RSA key from it.
    /// </summary>
    /// <param name="configuration"></param>
    public JwtTokenService(IConfiguration configuration)
    {
        var privateKeyPem = configuration["JwtSettings:PrivateKey"]
            ?.Replace("-----BEGIN RSA PRIVATE KEY-----", "")
            .Replace("-----END RSA PRIVATE KEY-----", "")
            .Replace("\n", "");

        var rsa = RSA.Create();
        if (!string.IsNullOrEmpty(privateKeyPem))
        {
            var keyBytes = Convert.FromBase64String(privateKeyPem);
            rsa.ImportRSAPrivateKey(keyBytes, out _);
        }

        _rsaKey = new RsaSecurityKey(rsa);
        _issuer = configuration["JwtSettings:Issuer"];
        _audience = configuration["JwtSettings:Audience"];
    }

    /// <summary>
    /// Generates a JWT token for the user. The token is signed with the RSA key. The token contains the user's ID and username. The token has an expiration time of 1 hour.
    /// </summary>
    /// <param name="user"></param>
    /// <returns></returns>
    public string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName ?? string.Empty)
        };

        var creds = new SigningCredentials(_rsaKey, SecurityAlgorithms.RsaSha512);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}