namespace TalentBridgePortal.DTOs
{
    public class ResumeEvaluationDto
    {
        public double Probability { get; set; }
        public string ProbabilityDisplay { get; set; } = string.Empty;
        public string Reasoning { get; set; } = string.Empty;
        public string Summary { get; set; } = string.Empty;
        public string Improvements { get; set; } = string.Empty;
        public string MarketComparison { get; set; } = string.Empty;
    }
}