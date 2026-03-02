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
            _apiKey = configuration["Groq:ApiKey"];
            _model = configuration["Groq:Model"] ?? "llama-3.3-70b-versatile";
        }

        public async Task<ResumeEvaluationDto> EvaluateResumeFromDbAsync(string jobSeekerId)
        {
            var jobSeeker = await _dbContext.JobSeekers
                                .FirstOrDefaultAsync(j => j.Email == jobSeekerId);

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
Evaluate this resume for general job market suitability.
You MUST respond in EXACTLY this format with no extra text before it:

PROBABILITY: 75
REASONING: First line of reasoning. Second line of reasoning.
SUMMARY: First line of summary. Second line of summary.
IMPROVEMENTS: List the top 3 most important things to improve, each on a new line starting with '- '.
MARKET_COMPARISON: Compare this resume against current market standards and list what is missing or below standard, each on a new line starting with '* '.

Rules:
- PROBABILITY must be a whole number between 0 and 100
- Do not write 75% just write 75
- REASONING must be exactly 2 lines only, focused on overall suitability
- SUMMARY must be exactly 2 lines focusing on candidate's key strengths
- IMPROVEMENTS must be the most critical and focused points only, maximum 3 points
- MARKET_COMPARISON must compare against current industry standards, maximum 4 points
- Keep everything concise and to the point

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