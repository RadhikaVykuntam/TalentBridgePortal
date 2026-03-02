using JobPortal.API.Services;
using Microsoft.EntityFrameworkCore;
using OpenAI;
using TalentBridgePortal.Data;
using TalentBridgePortal.Services;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<AuthService>();
// Add these lines
builder.Services.AddHttpClient();

// Register your service correctly
builder.Services.AddScoped<IResumeParserService, ResumeParserService>();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthorization();

app.MapControllers();


app.Run();