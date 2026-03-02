using System.ComponentModel.DataAnnotations;

namespace TalentBridgePortal.DTOs
{
    public class JobSeekerDto
    {
        public Guid Id { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }

        public string Email { get; set; }

        public string Password { get; set; }
        public string ResumeBase64 { get; set; }
        public string ResumeName { get; set; }
    }
}
