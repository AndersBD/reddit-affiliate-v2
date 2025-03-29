using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using RedditAffiliateEngine.Models;
using RedditAffiliateEngine.Repositories;

namespace RedditAffiliateEngine.Services
{
    /// <summary>
    /// Service for checking Google SERP (Search Engine Results Page) positions
    /// </summary>
    public class SerpCheckService : ISerpCheckService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SerpCheckService> _logger;
        private readonly HttpClient _httpClient;
        private readonly IRedditThreadRepository _threadRepository;
        private readonly ISerpResultRepository _serpResultRepository;
        private readonly string _serpApiKey;

        /// <summary>
        /// Constructor for SerpCheckService
        /// </summary>
        public SerpCheckService(
            IConfiguration configuration,
            ILogger<SerpCheckService> logger,
            HttpClient httpClient,
            IRedditThreadRepository threadRepository,
            ISerpResultRepository serpResultRepository)
        {
            _configuration = configuration;
            _logger = logger;
            _httpClient = httpClient;
            _threadRepository = threadRepository;
            _serpResultRepository = serpResultRepository;
            _serpApiKey = configuration["SERPAPI_KEY"] ?? throw new ArgumentNullException("SERPAPI_KEY is not configured");
        }

        /// <summary>
        /// Check the SERP position of a Reddit thread for a specific query
        /// </summary>
        public async Task<SerpCheckResponse> CheckSerpPositionAsync(SerpCheckRequest request)
        {
            try
            {
                _logger.LogInformation($"Checking SERP position for thread ID {request.ThreadId} with query: {request.Query}");
                
                // Get the thread
                var thread = await _threadRepository.GetThreadByIdAsync(request.ThreadId);
                if (thread == null)
                {
                    return new SerpCheckResponse
                    {
                        Success = false,
                        ThreadId = request.ThreadId,
                        Error = "Thread not found"
                    };
                }

                // Generate query if not provided
                string query = !string.IsNullOrEmpty(request.Query) 
                    ? request.Query 
                    : GenerateSearchQuery(thread);

                // Extract the domain part for checking in results
                string redditDomain = "reddit.com";
                string threadUrl = thread.Permalink;
                
                // Make sure the URL starts with reddit.com
                if (!threadUrl.Contains(redditDomain))
                {
                    threadUrl = $"{redditDomain}{threadUrl}";
                }

                // Check position
                int? position = await FindUrlPositionInSearchResultsAsync(query, threadUrl);

                // Save result to database
                var serpResult = new CreateSerpResultDto
                {
                    ThreadId = request.ThreadId,
                    Query = query,
                    Position = position,
                    IsRanked = position.HasValue
                };

                await _serpResultRepository.CreateSerpResultAsync(serpResult);

                // Update thread with SERP rank
                var threadUpdate = new UpdateRedditThreadDto
                {
                    SerpRank = position
                };
                
                await _threadRepository.UpdateThreadAsync(thread.Id, threadUpdate);

                return new SerpCheckResponse
                {
                    Success = true,
                    ThreadId = request.ThreadId,
                    Query = query,
                    Position = position
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking SERP position for thread ID {request.ThreadId}");
                return new SerpCheckResponse
                {
                    Success = false,
                    ThreadId = request.ThreadId,
                    Query = request.Query ?? "",
                    Error = ex.Message
                };
            }
        }

        /// <summary>
        /// Generate a search query based on a Reddit thread's content
        /// </summary>
        public string GenerateSearchQuery(RedditThread thread)
        {
            // Create a search query from the thread title
            // Remove special characters and limit to 60 chars
            string query = thread.Title;
            
            // If title is short, add some relevant words from the body
            if (query.Length < 30 && !string.IsNullOrEmpty(thread.Body))
            {
                string[] bodyWords = thread.Body
                    .Split(new[] { ' ', '\n', '\r', '\t' }, StringSplitOptions.RemoveEmptyEntries)
                    .Where(w => w.Length > 4)  // Only use words with > 4 chars
                    .Take(5)  // Take up to 5 words
                    .ToArray();
                
                if (bodyWords.Length > 0)
                {
                    query += " " + string.Join(" ", bodyWords);
                }
            }
            
            // Ensure the query is not too long
            if (query.Length > 60)
            {
                query = query.Substring(0, 60);
            }

            // Add the subreddit as additional context
            query += $" {thread.Subreddit} reddit";
            
            return query;
        }

        /// <summary>
        /// Check if a URL appears in search results for a given query
        /// </summary>
        public async Task<int?> FindUrlPositionInSearchResultsAsync(string query, string url, int maxPages = 5)
        {
            int position = 0;
            
            for (int page = 0; page < maxPages; page++)
            {
                int start = page * 10;
                string serpApiUrl = $"https://serpapi.com/search.json?engine=google&q={Uri.EscapeDataString(query)}&api_key={_serpApiKey}&start={start}";
                
                try
                {
                    _logger.LogInformation($"Querying SerpApi for: {query} (page {page+1})");
                    var response = await _httpClient.GetStringAsync(serpApiUrl);
                    
                    // Parse the response
                    var searchResults = JsonSerializer.Deserialize<JsonElement>(response);
                    
                    // Check if organic results exist
                    if (searchResults.TryGetProperty("organic_results", out var organicResults))
                    {
                        foreach (var result in organicResults.EnumerateArray())
                        {
                            position++;
                            
                            if (result.TryGetProperty("link", out var link))
                            {
                                string resultUrl = link.GetString() ?? "";
                                
                                // Check if the URL matches our target
                                if (resultUrl.Contains(url, StringComparison.OrdinalIgnoreCase))
                                {
                                    _logger.LogInformation($"Found match at position {position}: {resultUrl}");
                                    return position;
                                }
                            }
                        }
                    }
                    else
                    {
                        _logger.LogWarning("No organic results found in the SerpApi response");
                        break;
                    }
                    
                    // Check if there are more results
                    bool hasMore = false;
                    if (searchResults.TryGetProperty("pagination", out var pagination))
                    {
                        hasMore = pagination.TryGetProperty("next", out _);
                    }
                    
                    if (!hasMore)
                    {
                        break;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error in SerpApi request for query: {query}");
                    throw;
                }
            }
            
            // URL not found in the search results
            return null;
        }
    }
}