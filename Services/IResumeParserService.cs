using TalentBridgePortal.DTOs;

namespace TalentBridgePortal.Services
{
    public interface IResumeParserService
    {
        Task<ResumeEvaluationDto> EvaluateResumeFromDbAsync(string id);
    }
}
