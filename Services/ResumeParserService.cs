using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using TalentBridgePortal.Data;
using TalentBridgePortal.DTOs;
using TalentBridgePortal.Services;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using DocumentFormat.OpenXml.Packaging;

namespace JobPortal.API.Services
{
    public class ResumeParserService : IResumeParserService
    {
        private readonly HttpClient _httpClient;
        private readonly ApplicationDbContext _dbContext;
        private readonly string _apiKey;
        private readonly string _model;

        public ResumeParserService(IHttpClientFactory httpClientFactory,
            ApplicationDbContext dbContext, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _dbContext = dbContext;
            _apiKey = configuration["Groq:ApiKey"] ?? throw new InvalidOperationException("Groq:ApiKey is missing from configuration.");
            _model = configuration["Groq:Model"] ?? "llama-3.3-70b-versatile";
        }

        public async Task<ResumeEvaluationDto> EvaluateResumeFromDbAsync(string email)
        {
            var jobSeeker = await _dbContext.JobSeekers
                                .FirstOrDefaultAsync(j => j.Email == email);

            if (jobSeeker == null || jobSeeker.ResumeContent == null)
                throw new Exception("Resume not found.");

            // ✅ Detect file type and extract text
            bool isPdf = jobSeeker.ResumeContent.Length > 4 &&
                         jobSeeker.ResumeContent[0] == 0x25 &&
                         jobSeeker.ResumeContent[1] == 0x50 &&
                         jobSeeker.ResumeContent[2] == 0x44 &&
                         jobSeeker.ResumeContent[3] == 0x46;

            string resumeText = isPdf
                ? ExtractTextFromPdf(jobSeeker.ResumeContent)
                : ExtractTextFromDocx(jobSeeker.ResumeContent);

            if (string.IsNullOrWhiteSpace(resumeText))
                throw new Exception("Could not extract text from resume.");

            string prompt = $@"
You are an expert resume evaluator. Carefully read and analyze the resume below.
First determine if this candidate is a FRESHER (0-1 years experience or student/recent graduate) or EXPERIENCED.

If FRESHER, calculate PROBABILITY based on:
- Academic performance and education quality (0-25 points)
- Technical skills and tools known (0-25 points)
- Projects, internships, certifications (0-25 points)
- Resume presentation and completeness (0-25 points)

If EXPERIENCED, calculate PROBABILITY based on:
- Years of experience (0-20 points)
- Technical skills relevance (0-20 points)
- Education qualification (0-20 points)
- Project experience and achievements (0-20 points)
- Resume presentation and completeness (0-20 points)

Add all scores and give final PROBABILITY out of 100.

You MUST respond in EXACTLY this format:

CANDIDATE_TYPE: [FRESHER or EXPERIENCED]
PROBABILITY: [calculated number]
REASONING: [2 lines based on actual resume content]
SUMMARY: [2 lines about this specific candidate's strengths]
IMPROVEMENTS:
- [specific improvement 1 based on what is missing in this resume]
- [specific improvement 2 based on what is missing in this resume]
- [specific improvement 3 based on what is missing in this resume]
MARKET_COMPARISON:
* [specific gap 1 comparing this resume to market standards for FRESHER or EXPERIENCED]
* [specific gap 2 comparing this resume to market standards]
* [specific gap 3 comparing this resume to market standards]
* [specific gap 4 comparing this resume to market standards]

Rules:
- PROBABILITY must be a whole number between 0 and 100
- Do not write 75% just write 75
- For FRESHER: focus on potential, academics, projects and internships
- For EXPERIENCED: focus on work history, achievements and impact
- Every section must be based on ACTUAL resume content
- Be strict and realistic with scoring

Resume:
{resumeText}
";


            var requestBody = new
            {
                model = _model,
                messages = new[]
                {
                    new { role = "user", content = prompt }
                }
            };

            string url = "https://api.groq.com/openai/v1/chat/completions";

            _httpClient.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

            var content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(url, content);

            if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
            {
                await Task.Delay(TimeSpan.FromSeconds(60));
                response = await _httpClient.PostAsync(url, content);
            }

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"Groq API error: {error}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);

            string aiResult = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString() ?? "";

            // ✅ Debug log
            Console.WriteLine("AI RAW RESPONSE: " + aiResult);

            // ✅ Parse PROBABILITY
            double probability = 0;
            var probabilityMatch = Regex.Match(aiResult, @"PROBABILITY:\s*(\d{1,3})(?:\s*%)?");
            if (probabilityMatch.Success)
            {
                probability = double.Parse(probabilityMatch.Groups[1].Value);
                if (probability > 100) probability = 100;
                if (probability < 0) probability = 0;
            }

            // ✅ Parse REASONING
            string reasoning = aiResult;
            var reasoningMatch = Regex.Match(aiResult, @"REASONING:\s*(.+?)(?=SUMMARY:|$)", RegexOptions.Singleline);
            if (reasoningMatch.Success)
                reasoning = reasoningMatch.Groups[1].Value.Trim();

            // ✅ Parse SUMMARY
            string summary = "";
            var summaryMatch = Regex.Match(aiResult, @"SUMMARY:\s*(.+?)(?=IMPROVEMENTS:|$)", RegexOptions.Singleline);
            if (summaryMatch.Success)
                summary = summaryMatch.Groups[1].Value.Trim();

            // ✅ Parse IMPROVEMENTS
            string improvements = "";
            var improvementsMatch = Regex.Match(aiResult, @"IMPROVEMENTS:\s*(.+?)$", RegexOptions.Singleline);
            if (improvementsMatch.Success)
                improvements = improvementsMatch.Groups[1].Value.Trim();

            // ✅ Parse MARKET_COMPARISON
            string marketComparison = "";
            var marketMatch = Regex.Match(aiResult, @"MARKET_COMPARISON:\s*(.+?)$", RegexOptions.Singleline);
            if (marketMatch.Success)
                marketComparison = marketMatch.Groups[1].Value.Trim();

            return new ResumeEvaluationDto
            {
                Probability = probability,
                ProbabilityDisplay = $"{probability}%",
                Reasoning = reasoning,
                Summary = summary,
                Improvements = improvements,
                MarketComparison = marketComparison
            };
        }

        // ✅ Extract text from PDF
        private string ExtractTextFromPdf(byte[] pdfBytes)
        {
            try
            {
                var sb = new StringBuilder();
                using var pdfDocument = PdfDocument.Open(pdfBytes);
                foreach (Page page in pdfDocument.GetPages())
                {
                    sb.AppendLine(page.Text);
                }
                return sb.ToString();
            }
            catch
            {
                return Encoding.UTF8.GetString(pdfBytes);
            }
        }

        // ✅ Extract text from DOCX
        private string ExtractTextFromDocx(byte[] docxBytes)
        {
            try
            {
                using var stream = new MemoryStream(docxBytes);
                using var wordDoc = DocumentFormat.OpenXml.Packaging.WordprocessingDocument.Open(stream, false);
                return wordDoc.MainDocumentPart?.Document?.Body?.InnerText ?? "";
            }
            catch
            {
                return Encoding.UTF8.GetString(docxBytes);
            }
        }
    }
}