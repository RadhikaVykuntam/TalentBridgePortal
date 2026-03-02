using System.Text.Json;
using System.Text.RegularExpressions;
using HtmlAgilityPack;
using TalentBridgePortal.DTOs;

namespace TalentBridgePortal.Services
{
    public class JobService : IJobService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public JobService(IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _httpClient = httpClientFactory.CreateClient();
            _configuration = configuration;
            _httpClient.DefaultRequestHeaders.Add("User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        }

        // ==========================================
        // ✅ MAIN METHOD - Calls all APIs in parallel
        // ==========================================
        public async Task<List<JobListingDto>> SearchJobsAsync(JobSearchRequestDto request)
        {
            var tasks = new List<Task<List<JobListingDto>>>
            {
                FetchRemotiveJobsAsync(request),
                FetchSimplyHiredJobsAsync(request),
                FetchTheMuseJobsAsync(request),
                FetchArbeitnowJobsAsync(request)
            };

            var results = await Task.WhenAll(tasks);

            var allJobs = results
                .SelectMany(j => j)
                .OrderBy(j => j.PostedDaysAgo)
                .ToList();

            Console.WriteLine($"Total jobs from all sources: {allJobs.Count}");
            return allJobs;
        }

        // ==========================================
        // ✅ 1. REMOTIVE API (Remote jobs, no key)
        // ==========================================
        private async Task<List<JobListingDto>> FetchRemotiveJobsAsync(JobSearchRequestDto request)
        {
            var jobs = new List<JobListingDto>();
            try
            {
                string searchQuery = BuildSearchQuery(request);
                string url = $"https://remotive.com/api/remote-jobs?search={Uri.EscapeDataString(searchQuery)}&limit=10";

                Console.WriteLine($"Remotive URL: {url}");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return jobs;

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("jobs", out var jobsArray)) return jobs;

                Console.WriteLine($"Remotive jobs found: {jobsArray.GetArrayLength()}");

                foreach (var job in jobsArray.EnumerateArray())
                {
                    try
                    {
                        string id = job.TryGetProperty("id", out var idP) ? idP.GetInt32().ToString() : Guid.NewGuid().ToString();
                        string title = job.TryGetProperty("title", out var titleP) ? titleP.GetString() ?? "" : "";
                        string company = job.TryGetProperty("company_name", out var compP) ? compP.GetString() ?? "" : "";
                        string location = job.TryGetProperty("candidate_required_location", out var locP) ? locP.GetString() ?? "Remote" : "Remote";
                        string applyUrl = job.TryGetProperty("url", out var urlP) ? urlP.GetString() ?? "#" : "#";
                        string jobType = job.TryGetProperty("job_type", out var jtP) ? jtP.GetString() ?? "full_time" : "full_time";
                        string salary = job.TryGetProperty("salary", out var salP) ? salP.GetString() ?? "" : "";
                        string pubDate = job.TryGetProperty("publication_date", out var dP) ? dP.GetString() ?? "" : "";
                        string category = job.TryGetProperty("category", out var catP) ? catP.GetString() ?? "" : "";
                        string description = job.TryGetProperty("description", out var descP) ? descP.GetString() ?? "" : "";

                        int daysAgo = CalculateDaysAgo(pubDate);

                        var skills = ExtractTagsAsSkills(job, request.Skills);
                        var qualifications = ExtractPointsFromDescription(description, "qualif", 4);
                        var responsibilities = ExtractPointsFromDescription(description, "responsibilit", 5);

                        if (!qualifications.Any())
                            qualifications = ExtractPointsFromDescription(description, "require", 4);
                        if (!responsibilities.Any())
                            responsibilities = ExtractPointsFromDescription(description, "you will", 5);

                        jobs.Add(new JobListingDto
                        {
                            Id = $"remotive_{id}",
                            Title = title,
                            Company = company,
                            Location = string.IsNullOrEmpty(location) ? "Remote" : location,
                            Type = "Remote",
                            JobType = NormalizeJobType(jobType),
                            Compensation = string.IsNullOrEmpty(salary) ? "Not specified" : salary,
                            PostedDate = daysAgo == 0 ? "Posted today" : $"Posted {daysAgo} days ago",
                            PostedDaysAgo = daysAgo,
                            CompanyType = category,
                            Skills = skills,
                            Qualifications = qualifications,
                            Responsibilities = responsibilities,
                            ApplyUrl = applyUrl,
                            Source = "Remotive"
                        });
                    }
                    catch { continue; }
                }
            }
            catch (Exception ex) { Console.WriteLine($"Remotive error: {ex.Message}"); }
            return jobs;
        }

        // ==========================================
        // ✅ 2. SIMPLYHIRED SCRAPER (No key needed)
        // ==========================================
        private async Task<List<JobListingDto>> FetchSimplyHiredJobsAsync(JobSearchRequestDto request)
        {
            var jobs = new List<JobListingDto>();
            try
            {
                string searchQuery = BuildSearchQuery(request);
                string location = string.IsNullOrEmpty(request.Location) ? "India" : request.Location;
                string url = $"https://www.simplyhired.com/search?q={Uri.EscapeDataString(searchQuery)}&l={Uri.EscapeDataString(location)}";

                Console.WriteLine($"SimplyHired URL: {url}");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
                _httpClient.DefaultRequestHeaders.Add("Accept",
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8");
                _httpClient.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");

                var response = await _httpClient.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"SimplyHired status: {response.StatusCode}");
                    return jobs;
                }

                var html = await response.Content.ReadAsStringAsync();
                var htmlDoc = new HtmlDocument();
                htmlDoc.LoadHtml(html);

                var jobCards = htmlDoc.DocumentNode.SelectNodes("//div[contains(@class,'SerpJob-jobCard')]") ??
                               htmlDoc.DocumentNode.SelectNodes("//article[contains(@class,'job')]") ??
                               htmlDoc.DocumentNode.SelectNodes("//div[contains(@class,'jobposting')]") ??
                               htmlDoc.DocumentNode.SelectNodes("//li[contains(@class,'job')]");

                if (jobCards == null)
                {
                    Console.WriteLine("SimplyHired: No job cards found.");
                    return jobs;
                }

                Console.WriteLine($"SimplyHired: Found {jobCards.Count} job cards.");

                foreach (var card in jobCards.Take(10))
                {
                    try
                    {
                        string title = card.SelectSingleNode(".//h2[contains(@class,'jobTitle')]//a")?.InnerText.Trim() ??
                                       card.SelectSingleNode(".//h3//a")?.InnerText.Trim() ??
                                       card.SelectSingleNode(".//a[@data-action='click']")?.InnerText.Trim() ?? "";

                        string company = card.SelectSingleNode(".//*[contains(@class,'company')]")?.InnerText.Trim() ??
                                         card.SelectSingleNode(".//*[contains(@class,'employer')]")?.InnerText.Trim() ?? "";

                        string location2 = card.SelectSingleNode(".//*[contains(@class,'location')]")?.InnerText.Trim() ??
                                           card.SelectSingleNode(".//*[contains(@class,'loc')]")?.InnerText.Trim() ?? location;

                        string salary = card.SelectSingleNode(".//*[contains(@class,'salary')]")?.InnerText.Trim() ??
                                        card.SelectSingleNode(".//*[contains(@class,'compensation')]")?.InnerText.Trim() ?? "Not specified";

                        string postedText = card.SelectSingleNode(".//*[contains(@class,'date')]")?.InnerText.Trim() ??
                                            card.SelectSingleNode(".//*[contains(@class,'posted')]")?.InnerText.Trim() ?? "";

                        string applyHref = card.SelectSingleNode(".//h2//a")?.GetAttributeValue("href", "") ??
                                           card.SelectSingleNode(".//h3//a")?.GetAttributeValue("href", "") ??
                                           card.SelectSingleNode(".//a[@data-action='click']")?.GetAttributeValue("href", "") ?? "#";

                        string applyUrl = applyHref.StartsWith("http")
                            ? applyHref
                            : $"https://www.simplyhired.com{applyHref}";

                        string description = card.SelectSingleNode(".//*[contains(@class,'description')]")?.InnerText.Trim() ?? "";

                        int daysAgo = ParseDaysAgo(postedText);
                        bool isRemote = location2.ToLower().Contains("remote");

                        var qualifications = ExtractPointsFromDescription(description, "qualif", 4);
                        var responsibilities = ExtractPointsFromDescription(description, "responsibilit", 5);

                        if (string.IsNullOrWhiteSpace(title)) continue;

                        jobs.Add(new JobListingDto
                        {
                            Id = $"simplyhired_{Guid.NewGuid()}",
                            Title = title,
                            Company = company,
                            Location = string.IsNullOrEmpty(location2) ? location : location2,
                            Type = isRemote ? "Remote" : "On-site",
                            JobType = DetectJobType(title),
                            Compensation = salary,
                            PostedDate = daysAgo == 0 ? "Posted today" : $"Posted {daysAgo} days ago",
                            PostedDaysAgo = daysAgo,
                            CompanyType = "",
                            Skills = request.Skills ?? new List<string>(),
                            Qualifications = qualifications,
                            Responsibilities = responsibilities,
                            ApplyUrl = applyUrl,
                            Source = "SimplyHired"
                        });
                    }
                    catch { continue; }
                }
            }
            catch (Exception ex) { Console.WriteLine($"SimplyHired error: {ex.Message}"); }
            return jobs;
        }

        // ==========================================
        // ✅ 3. THE MUSE API (No key needed)
        // ==========================================
        private async Task<List<JobListingDto>> FetchTheMuseJobsAsync(JobSearchRequestDto request)
        {
            var jobs = new List<JobListingDto>();
            try
            {
                string searchQuery = BuildSearchQuery(request);
                string url = $"https://www.themuse.com/api/public/jobs?descending=true&page=1&per_page=10&query={Uri.EscapeDataString(searchQuery)}";

                Console.WriteLine($"TheMuse URL: {url}");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return jobs;

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("results", out var results)) return jobs;

                Console.WriteLine($"TheMuse jobs found: {results.GetArrayLength()}");

                foreach (var job in results.EnumerateArray())
                {
                    try
                    {
                        string id = job.TryGetProperty("id", out var idP) ? idP.GetInt32().ToString() : Guid.NewGuid().ToString();
                        string title = job.TryGetProperty("name", out var titleP) ? titleP.GetString() ?? "" : "";
                        string pubDate = job.TryGetProperty("publication_date", out var dP) ? dP.GetString() ?? "" : "";
                        string level = "";
                        string company = "";
                        string location = "Remote";
                        string applyUrl = "#";

                        if (job.TryGetProperty("refs", out var refsP) &&
                            refsP.TryGetProperty("landing_page", out var landingP))
                            applyUrl = landingP.GetString() ?? "#";

                        if (job.TryGetProperty("company", out var compP) &&
                            compP.TryGetProperty("name", out var compName))
                            company = compName.GetString() ?? "";

                        if (job.TryGetProperty("locations", out var locs) && locs.GetArrayLength() > 0)
                        {
                            if (locs[0].TryGetProperty("name", out var locName))
                                location = locName.GetString() ?? "Remote";
                        }

                        if (job.TryGetProperty("levels", out var levels) && levels.GetArrayLength() > 0)
                        {
                            if (levels[0].TryGetProperty("name", out var levelName))
                                level = levelName.GetString() ?? "";
                        }

                        int daysAgo = CalculateDaysAgo(pubDate);
                        bool isRemote = location.ToLower().Contains("remote") || location.ToLower().Contains("flexible");

                        jobs.Add(new JobListingDto
                        {
                            Id = $"muse_{id}",
                            Title = title,
                            Company = company,
                            Location = location,
                            Type = isRemote ? "Remote" : "On-site",
                            JobType = MapMuseLevel(level),
                            Compensation = "Not specified",
                            PostedDate = daysAgo == 0 ? "Posted today" : $"Posted {daysAgo} days ago",
                            PostedDaysAgo = daysAgo,
                            CompanyType = "",
                            Skills = request.Skills ?? new List<string>(),
                            Qualifications = new List<string>(),
                            Responsibilities = new List<string>(),
                            ApplyUrl = applyUrl,
                            Source = "The Muse"
                        });
                    }
                    catch { continue; }
                }
            }
            catch (Exception ex) { Console.WriteLine($"TheMuse error: {ex.Message}"); }
            return jobs;
        }

        // ==========================================
        // ✅ 4. ARBEITNOW API (No key needed)
        // ==========================================
        private async Task<List<JobListingDto>> FetchArbeitnowJobsAsync(JobSearchRequestDto request)
        {
            var jobs = new List<JobListingDto>();
            try
            {
                string searchQuery = BuildSearchQuery(request);
                string url = $"https://www.arbeitnow.com/api/job-board-api?search={Uri.EscapeDataString(searchQuery)}";

                Console.WriteLine($"Arbeitnow URL: {url}");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode) return jobs;

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("data", out var data)) return jobs;

                Console.WriteLine($"Arbeitnow jobs found: {data.GetArrayLength()}");

                foreach (var job in data.EnumerateArray())
                {
                    try
                    {
                        string id = job.TryGetProperty("slug", out var idP) ? idP.GetString() ?? Guid.NewGuid().ToString() : Guid.NewGuid().ToString();
                        string title = job.TryGetProperty("title", out var titleP) ? titleP.GetString() ?? "" : "";
                        string company = job.TryGetProperty("company_name", out var cP) ? cP.GetString() ?? "" : "";
                        string location = job.TryGetProperty("location", out var locP) ? locP.GetString() ?? "" : "";
                        string applyUrl = job.TryGetProperty("url", out var urlP) ? urlP.GetString() ?? "#" : "#";
                        string description = job.TryGetProperty("description", out var descP) ? descP.GetString() ?? "" : "";
                        bool isRemote = job.TryGetProperty("remote", out var remP) && remP.GetBoolean();
                        long timestamp = job.TryGetProperty("created_at", out var tsP) ? tsP.GetInt64() : 0;

                        int daysAgo = 0;
                        if (timestamp > 0)
                        {
                            var postedDate = DateTimeOffset.FromUnixTimeSeconds(timestamp).DateTime;
                            daysAgo = (int)(DateTime.UtcNow - postedDate).TotalDays;
                        }

                        var skills = new List<string>();
                        if (job.TryGetProperty("tags", out var tags))
                        {
                            foreach (var tag in tags.EnumerateArray())
                            {
                                var tagStr = tag.GetString();
                                if (!string.IsNullOrEmpty(tagStr))
                                    skills.Add(tagStr);
                                if (skills.Count >= 5) break;
                            }
                        }
                        if (!skills.Any() && request.Skills != null)
                            skills = request.Skills.Take(5).ToList();

                        var qualifications = ExtractPointsFromDescription(description, "qualif", 4);
                        var responsibilities = ExtractPointsFromDescription(description, "responsibilit", 5);

                        jobs.Add(new JobListingDto
                        {
                            Id = $"arbeitnow_{id}",
                            Title = title,
                            Company = company,
                            Location = string.IsNullOrEmpty(location) ? "Remote" : location,
                            Type = isRemote ? "Remote" : "On-site",
                            JobType = "Full-time",
                            Compensation = "Not specified",
                            PostedDate = daysAgo == 0 ? "Posted today" : $"Posted {daysAgo} days ago",
                            PostedDaysAgo = daysAgo,
                            CompanyType = "",
                            Skills = skills,
                            Qualifications = qualifications,
                            Responsibilities = responsibilities,
                            ApplyUrl = applyUrl,
                            Source = "Arbeitnow"
                        });
                    }
                    catch { continue; }
                }
            }
            catch (Exception ex) { Console.WriteLine($"Arbeitnow error: {ex.Message}"); }
            return jobs;
        }

        // ==========================================
        // ✅ HELPER METHODS
        // ==========================================
        private string BuildSearchQuery(JobSearchRequestDto request)
        {
            var parts = new List<string>();

            if (!string.IsNullOrEmpty(request.Query))
                parts.Add(request.Query);

            if (request.Skills != null && request.Skills.Any())
                parts.AddRange(request.Skills.Take(2));

            return string.Join(" ", parts);
        }

        private int CalculateDaysAgo(string dateStr)
        {
            if (string.IsNullOrEmpty(dateStr)) return 0;
            if (DateTime.TryParse(dateStr, out var parsedDate))
                return (int)(DateTime.UtcNow - parsedDate).TotalDays;
            return 0;
        }

        private int ParseDaysAgo(string text)
        {
            if (string.IsNullOrEmpty(text)) return 0;
            text = text.ToLower();

            if (text.Contains("today") || text.Contains("just") || text.Contains("hour")) return 0;
            if (text.Contains("yesterday")) return 1;

            var dayMatch = Regex.Match(text, @"(\d+)\+?\s*day");
            if (dayMatch.Success) return int.Parse(dayMatch.Groups[1].Value);

            var weekMatch = Regex.Match(text, @"(\d+)\+?\s*week");
            if (weekMatch.Success) return int.Parse(weekMatch.Groups[1].Value) * 7;

            var monthMatch = Regex.Match(text, @"(\d+)\+?\s*month");
            if (monthMatch.Success) return int.Parse(monthMatch.Groups[1].Value) * 30;

            return 0;
        }

        private List<string> ExtractTagsAsSkills(JsonElement job, List<string>? fallbackSkills)
        {
            var skills = new List<string>();
            if (job.TryGetProperty("tags", out var tags))
            {
                foreach (var tag in tags.EnumerateArray())
                {
                    var tagStr = tag.GetString();
                    if (!string.IsNullOrEmpty(tagStr))
                        skills.Add(tagStr);
                    if (skills.Count >= 5) break;
                }
            }
            if (!skills.Any() && fallbackSkills != null)
                skills = fallbackSkills.Take(5).ToList();
            return skills;
        }

        private List<string> ExtractPointsFromDescription(string description, string keyword, int maxItems)
        {
            var results = new List<string>();
            try
            {
                var cleanText = Regex.Replace(description, "<.*?>", "\n");
                var lines = cleanText.Split('\n', StringSplitOptions.RemoveEmptyEntries);
                bool inSection = false;

                foreach (var line in lines)
                {
                    var trimmed = line.Trim();
                    if (trimmed.ToLower().Contains(keyword))
                    {
                        inSection = true;
                        continue;
                    }
                    if (inSection && trimmed.Length > 10 && trimmed.Length < 200)
                    {
                        results.Add(trimmed.TrimStart('-', '*', '•', ' '));
                        if (results.Count >= maxItems) break;
                    }
                    if (inSection && trimmed.Length == 0)
                        inSection = false;
                }
            }
            catch { }
            return results;
        }

        private string NormalizeJobType(string jobType) => jobType?.ToLower() switch
        {
            "full_time" => "Full-time",
            "part_time" => "Part-time",
            "contract" => "Contract",
            "freelance" => "Freelance",
            "internship" => "Internship",
            _ => "Full-time"
        };

        private string MapMuseLevel(string level) => level?.ToLower() switch
        {
            "internship" => "Internship",
            "entry level" => "Full-time",
            "mid level" => "Full-time",
            "senior level" => "Full-time",
            _ => "Full-time"
        };

        private string DetectJobType(string title)
        {
            title = title.ToLower();
            if (title.Contains("intern")) return "Internship";
            if (title.Contains("part time") || title.Contains("part-time")) return "Part-time";
            if (title.Contains("contract")) return "Contract";
            if (title.Contains("freelance")) return "Freelance";
            return "Full-time";
        }
    }
}