using Microsoft.AspNetCore.Mvc;
using TalentBridgePortal.DTOs;
using TalentBridgePortal.Models;
using TalentBridgePortal.Services;

namespace TalentBridgePortal.Controllers
{

    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _service;

        public AuthController(AuthService service)
        {
            _service = service;
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Register([FromForm] RegisterDto dto)
        {
            try
            {
                var userId = await _service.Register(dto);
                return Ok(new { Id = userId });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("signin")]
        public async Task<IActionResult> Signin(LoginDto dto)
        {
            JobSeeker token = await _service.Login(dto);

            if (token == null)
                return Unauthorized("Invalid credentials");

            var response = new JobSeeker
            {
                Id = token.Id,
                FirstName = token.FirstName,
                LastName = token.LastName,
                Email = token.Email,
                ResumeContent = token.ResumeContent
            };

            return Ok(response);
        }

    }
}
