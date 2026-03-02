namespace TalentBridgePortal.DTOs
{
    public class UpdateResumeDto
    {
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public IFormFile Resume { get; set; }
    }
}
