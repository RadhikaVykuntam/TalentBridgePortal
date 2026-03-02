using TalentBridgePortal.DTOs;

namespace TalentBridgePortal.Services
{
    public interface IJobService
    {
        Task<List<JobListingDto>> SearchJobsAsync(JobSearchRequestDto request);
    }
}