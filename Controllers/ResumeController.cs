using Microsoft.AspNetCore.Mvc;
using TalentBridgePortal.Services;

namespace TalentBridgePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ResumeController : ControllerBase
    {
        private readonly IResumeParserService _resumeParserService;

        public ResumeController(IResumeParserService resumeParserService)
        {
            _resumeParserService = resumeParserService;
        }

        [HttpGet("evaluate/{email}")]
        public async Task<IActionResult> EvaluateFromDb(string email)
        {
            try
            {
                var result = await _resumeParserService.EvaluateResumeFromDbAsync(email);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}