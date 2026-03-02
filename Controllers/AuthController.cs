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
            JobSeekerDto response = await _service.Login(dto);

            if (response == null)
                return Unauthorized("Invalid credentials");

            return Ok(response);
        }

        [HttpPost("updateresume")]
        public async Task<IActionResult> UpdateResume(UpdateResumeDto dto)
        {
            string response = await _service.UpdateResume(dto);
            if (response == null)
                return NotFound($"Job seeker with email '{dto.Email}' not found.");
            return Ok(response);
        }
    }
}
