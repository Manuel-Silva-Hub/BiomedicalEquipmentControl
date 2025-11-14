using microservice_AuthService.DTOs;
using microservice_AuthService.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace microservice_AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager; //It is part of ASP.NET Core Identity, and is responsible for validating user credentials (email + password) securely.
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto userData)
        {
            var user = new ApplicationUser
            {
                UserName = userData.Email,
                Email = userData.Email,
                FullName = userData.FullName,
                RolHospital = userData.RolHospital
            };

            var result = await _userManager.CreateAsync(user, userData.Password);

            if (result.Succeeded)
                return Ok(new { message = "Usuario registrado correctamente" });

            return BadRequest(result.Errors);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto credentials)
        {
            var user = await _userManager.FindByEmailAsync(credentials.Email);

            if (user == null)
                return Unauthorized(new { message = "Usuario no encontrado" });

            // Validar contraseña
            var result = await _signInManager.CheckPasswordSignInAsync(user, credentials.Password, false);

            if (!result.Succeeded)
                return Unauthorized(new { message = "Contraseña incorrecta" });

            // Generar el token JWT
            var token = GenerateJwtToken(user);

            return Ok(new { token });
        }

        private JwtTokenResponse GenerateJwtToken(ApplicationUser user)
        {
            var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Email),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.NameIdentifier, user.Id),
<<<<<<< HEAD
        new Claim(ClaimTypes.Role, user.RolHospital ?? "Empleado")
=======
        new Claim("rol", user.RolHospital ?? "Empleado")
>>>>>>> authservice
    };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(2),
                signingCredentials: creds);

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new JwtTokenResponse
            {
                Token = tokenString,
                Expiration = token.ValidTo
            };

        }
    }
}
