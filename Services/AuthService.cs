using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TalentBridgePortal.Data;
using TalentBridgePortal.DTOs;
using TalentBridgePortal.Models;

namespace TalentBridgePortal.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;

        public AuthService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Guid> Register(RegisterDto dto)
        {
            if (await _context.JobSeekers.AnyAsync(x => x.Email == dto.Email))
                throw new InvalidOperationException("User already exists"); 

            byte[] resumeData;
            using (var ms = new MemoryStream())
            {
                await dto.Resume.CopyToAsync(ms);
                resumeData = ms.ToArray();
            }

            var user = new JobSeeker
            {
                Id = Guid.NewGuid(),
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Password = dto.Password, // demo only
                ResumeContent = resumeData
            };

            _context.JobSeekers.Add(user);
            await _context.SaveChangesAsync();

            return user.Id; 
        }

        public async Task<JobSeeker?> Login(LoginDto dto)
        {
            var user = await _context.JobSeekers
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (user == null)
                return null;

            if (dto.Password ==null)
                return null;

            // Convert resume bytes to Base64 to send via JSON
            string resumeBase64 = user.ResumeContent != null
                ? Convert.ToBase64String(user.ResumeContent)
                : "";

            return new JobSeekerDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                ResumeName = user.ResumeName ?? "",
                ResumeBase64 = resumeBase64
            };
        }
        public async Task<bool> UpdateResume(UpdateResumeDto dto)
        {
            var user = await _context.JobSeekers.FirstOrDefaultAsync(x => x.Email == dto.Email);
            if (user == null)
                return false;
            if (dto.Resume == null || dto.Resume.Length == 0)
                return false;
            using (var ms = new MemoryStream())
            {
                await dto.Resume.CopyToAsync(ms);
                user.ResumeContent = ms.ToArray();
            }
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.ResumeName = dto.Resume.FileName;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
