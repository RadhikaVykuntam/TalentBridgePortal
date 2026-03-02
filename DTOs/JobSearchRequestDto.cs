namespace TalentBridgePortal.DTOs
{
    public class JobSearchRequestDto
    {
        public string Query { get; set; } = string.Empty;   // optional
        public string Location { get; set; } = "India";     // default India
        public string JobType { get; set; } = string.Empty;
        public int Page { get; set; } = 1;
        public List<string> Skills { get; set; } = new();
        public string Experience { get; set; } = string.Empty; // fresher, junior, mid, senior
    }
}