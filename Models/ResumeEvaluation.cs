namespace TalentBridgePortal.Models
{
    namespace JobPortal.API.Models
    {
        public class ResumeEvaluation
        {
            public Guid JobSeekerId { get; set; } 
            public string ResumeText { get; set; } = string.Empty;
            public double Probability { get; set; } 
            public string Reasoning { get; set; } = string.Empty;
            public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
        }
    }
}
