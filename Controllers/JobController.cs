using Microsoft.AspNetCore.Mvc;
using TalentBridgePortal.DTOs;
using TalentBridgePortal.Services;

namespace TalentBridgePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobController : ControllerBase
    {
        private readonly IJobService _jobService;

        public JobController(IJobService jobService)
        {
            _jobService = jobService;
        }

        [HttpPost("search")]
        public async Task<IActionResult> SearchJobs([FromBody] JobSearchRequestDto request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Query) && request.Skills != null && request.Skills.Any())
                    request.Query = request.Skills.First();
                if (string.IsNullOrEmpty(request.Location))
                    request.Location = "India";
                if (request.Page <= 0)
                    request.Page = 1;

                var jobs = await _jobService.SearchJobsAsync(request);
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}