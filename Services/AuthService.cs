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
            Console.WriteLine($"{_context.JobSeekers.Count()}");
            var user = new JobSeeker
            {
                Id = Guid.NewGuid(),
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Password = dto.Password, // demo only
                ResumeContent = resumeData,
                ResumeName = dto.Resume.FileName
            };
            _context.JobSeekers.Add(user);
            await _context.SaveChangesAsync();
            return user.Id; 
        }

        public async Task<JobSeekerDto?> Login(LoginDto dto)
        {
            Console.WriteLine($"{_context.JobSeekers.Count()}");
            var user = await _context.JobSeekers.FirstOrDefaultAsync(j => j.Email == dto.Email && j.Password == dto.Password);
            if (user == null)
                return null;
            if (dto.Password ==null)
                return null;

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
        public async Task<string> UpdateResume(UpdateResumeDto dto)
        {
            var user = await _context.JobSeekers.FirstOrDefaultAsync(x => x.Email == dto.Email);
            if (user == null)
                return "Invalid credentials";
            if (dto.Resume == null || dto.Resume.Length == 0)
                return "invaild resume";
            using (var ms = new MemoryStream())
            {
                await dto.Resume.CopyToAsync(ms);
                user.ResumeContent = ms.ToArray();
            }
            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;
            user.ResumeName = dto.Resume.FileName;
            await _context.SaveChangesAsync();
            return "Updated Successfully";
        }
    }
}
