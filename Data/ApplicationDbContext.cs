using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using TalentBridgePortal.Models;
using TalentBridgePortal.Models.JobPortal.API.Models;

namespace TalentBridgePortal.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)  : base(options) { }

        public DbSet<JobSeeker> JobSeekers { get; set; }
    }
}
