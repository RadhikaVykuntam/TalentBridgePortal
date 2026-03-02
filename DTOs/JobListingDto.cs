namespace TalentBridgePortal.DTOs
{
    public class JobListingDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Company { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string JobType { get; set; } = string.Empty;
        public string Compensation { get; set; } = string.Empty;
        public string PostedDate { get; set; } = string.Empty;
        public int PostedDaysAgo { get; set; }
        public string CompanyType { get; set; } = string.Empty;
        public List<string> Skills { get; set; } = new();
        public List<string> Qualifications { get; set; } = new();
        public List<string> Responsibilities { get; set; } = new();
        public string ApplyUrl { get; set; } = "#";
        public string Source { get; set; } = string.Empty;
    }
}