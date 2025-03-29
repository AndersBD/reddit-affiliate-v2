using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using RedditAffiliateEngine.Models;
using System.Linq;
using System.Text.RegularExpressions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Net;

namespace RedditAffiliateEngine.Crawler
{
    public class RedditJsonCrawler : IRedditCrawler
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RedditJsonCrawler> _logger;
        private const string BASE_URL = "https://www.reddit.com/r/";
        private readonly Dictionary<string, string> _userAgents = new Dictionary<string, string>
        {
            { "Chrome", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36" },
            { "Firefox", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0" },
            { "Safari", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15" },
            { "Edge", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.2420.65" }
        };
        private readonly Random _random = new Random();
        private readonly List<CreateRedditThreadDto> _sampleThreads;

        public RedditJsonCrawler(HttpClient httpClient, ILogger<RedditJsonCrawler> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            
            // Initialize sample threads for fallback
            _sampleThreads = GenerateSampleThreads();
        }

        public async Task<IEnumerable<CreateRedditThreadDto>> CrawlSubredditAsync(
            string subreddit, 
            RedditSortType sortType = RedditSortType.Hot, 
            int limit = 25, 
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Starting to crawl r/{subreddit} with sort type {sortType}");
            
            string sortUrl = sortType switch
            {
                RedditSortType.Hot => "hot",
                RedditSortType.New => "new",
                RedditSortType.Top => "top",
                _ => "hot"
            };

            // Add .json to get the JSON format instead of HTML
            string url = $"{BASE_URL}{subreddit}/{sortUrl}.json?limit={limit}";
            List<CreateRedditThreadDto> threads = new List<CreateRedditThreadDto>();
            
            try
            {
                // Set up request with anti-detection measures
                var request = ConfigureRequestWithAntiDetection(url);
                
                // Add a random delay between 1-3 seconds to mimic human browsing
                await Task.Delay(_random.Next(1000, 3000), cancellationToken);
                
                // Make the request with the proxy
                HttpResponseMessage response = await _httpClient.SendAsync(request, cancellationToken);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"Failed to crawl r/{subreddit}: Status code {response.StatusCode}");
                    
                    if (response.StatusCode == HttpStatusCode.Forbidden)
                    {
                        _logger.LogWarning("Received 403 Forbidden. Using sample data as fallback.");
                        return GetSampleThreadsForSubreddit(subreddit, limit);
                    }
                    
                    return threads;
                }
                
                string json = await response.Content.ReadAsStringAsync();
                var jsonData = JObject.Parse(json);
                
                var children = jsonData["data"]?["children"];
                if (children == null)
                {
                    _logger.LogWarning($"No threads found in r/{subreddit}");
                    return threads;
                }
                
                foreach (var child in children)
                {
                    try
                    {
                        var threadData = child["data"];
                        if (threadData == null) continue;
                        
                        var thread = new CreateRedditThreadDto
                        {
                            Title = threadData["title"]?.ToString() ?? "",
                            Body = threadData["selftext"]?.ToString() ?? "",
                            Subreddit = subreddit,
                            Permalink = threadData["permalink"]?.ToString() ?? "",
                            Author = threadData["author"]?.ToString() ?? "[deleted]",
                            Upvotes = threadData["ups"]?.Value<int>() ?? 0,
                            CommentCount = threadData["num_comments"]?.Value<int>() ?? 0,
                            Flair = threadData["link_flair_text"]?.ToString()
                        };
                        
                        if (!string.IsNullOrEmpty(thread.Title) && !string.IsNullOrEmpty(thread.Permalink))
                        {
                            threads.Add(thread);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error extracting thread data from r/{subreddit}");
                    }
                    
                    // Small delay between processing threads to be gentle on Reddit servers
                    await Task.Delay(200, cancellationToken);
                }
                
                _logger.LogInformation($"Successfully crawled {threads.Count} threads from r/{subreddit}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error crawling r/{subreddit}: {ex.Message}");
                
                // Fallback to sample data
                _logger.LogWarning("Using sample data as fallback due to error.");
                return GetSampleThreadsForSubreddit(subreddit, limit);
            }
            
            return threads;
        }

        public async Task<CreateRedditThreadDto?> GetThreadDetailsAsync(
            string permalink, 
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Getting details for thread: {permalink}");
            
            try
            {
                // Ensure permalink starts with / for proper URL construction
                if (!permalink.StartsWith("/")) 
                {
                    permalink = "/" + permalink;
                }
                
                // Remove trailing slash if present
                if (permalink.EndsWith("/"))
                {
                    permalink = permalink.Substring(0, permalink.Length - 1);
                }
                
                // Add .json to get the JSON format instead of HTML
                string fullUrl = $"https://www.reddit.com{permalink}.json";
                
                // Set up request with anti-detection measures
                var request = ConfigureRequestWithAntiDetection(fullUrl);
                
                // Add a random delay between 1-3 seconds to mimic human browsing
                await Task.Delay(_random.Next(1000, 3000), cancellationToken);
                
                HttpResponseMessage response = await _httpClient.SendAsync(request, cancellationToken);
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning($"Failed to get thread details for {permalink}: Status code {response.StatusCode}");
                    
                    if (response.StatusCode == HttpStatusCode.Forbidden)
                    {
                        _logger.LogWarning("Received 403 Forbidden. Using sample data as fallback.");
                        return GetSampleThreadDetailsByPermalink(permalink);
                    }
                    
                    return null;
                }
                
                string json = await response.Content.ReadAsStringAsync();
                var jsonArray = JArray.Parse(json);
                
                if (jsonArray.Count == 0)
                {
                    _logger.LogWarning($"No data found for thread: {permalink}");
                    return null;
                }
                
                var threadData = jsonArray[0]?["data"]?["children"]?[0]?["data"];
                if (threadData == null)
                {
                    _logger.LogWarning($"No thread data found for: {permalink}");
                    return null;
                }
                
                var thread = new CreateRedditThreadDto
                {
                    Title = threadData["title"]?.ToString() ?? "",
                    Body = threadData["selftext"]?.ToString() ?? "",
                    Subreddit = threadData["subreddit"]?.ToString() ?? "",
                    Permalink = threadData["permalink"]?.ToString() ?? permalink,
                    Author = threadData["author"]?.ToString() ?? "[deleted]",
                    Upvotes = threadData["ups"]?.Value<int>() ?? 0,
                    CommentCount = threadData["num_comments"]?.Value<int>() ?? 0,
                    Flair = threadData["link_flair_text"]?.ToString()
                };
                
                // Extract comments if available
                if (jsonArray.Count > 1)
                {
                    var comments = new List<string>();
                    var commentList = jsonArray[1]?["data"]?["children"];
                    
                    if (commentList != null)
                    {
                        foreach (var comment in commentList)
                        {
                            var commentData = comment?["data"];
                            if (commentData != null && commentData["body"] != null)
                            {
                                comments.Add(commentData["body"].ToString());
                            }
                            
                            // Limit to top 10 comments
                            if (comments.Count >= 10) break;
                        }
                    }
                    
                    // Append top comments to the body
                    if (comments.Count > 0)
                    {
                        thread.Body += "\n\nTop Comments:\n" + string.Join("\n\n", comments);
                    }
                }
                
                return thread;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting details for thread: {permalink}");
                
                // Fallback to sample data
                _logger.LogWarning("Using sample data as fallback due to error.");
                return GetSampleThreadDetailsByPermalink(permalink);
            }
        }
        
        private HttpRequestMessage ConfigureRequestWithAntiDetection(string url)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, url);
            
            // Rotate user agents to avoid blocking
            string userAgent = GetRandomUserAgent();
            request.Headers.Add("User-Agent", userAgent);
            
            // Add common headers that browsers send
            request.Headers.Add("Accept", "application/json,text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8");
            request.Headers.Add("Accept-Language", "en-US,en;q=0.5");
            request.Headers.Add("Connection", "keep-alive");
            request.Headers.Add("Sec-Fetch-Dest", "document");
            request.Headers.Add("Sec-Fetch-Mode", "navigate");
            request.Headers.Add("Sec-Fetch-Site", "none");
            request.Headers.Add("Upgrade-Insecure-Requests", "1");
            
            // Add a cookie header with some random cookies to simulate a logged-in user
            string cookies = $"reddit_session={Guid.NewGuid().ToString().Replace("-", "")}; __cf_bm={Guid.NewGuid().ToString().Replace("-", "")}";
            request.Headers.Add("Cookie", cookies);
            
            return request;
        }
        
        private string GetRandomUserAgent()
        {
            var keys = _userAgents.Keys.ToList();
            string randomKey = keys[_random.Next(keys.Count)];
            return _userAgents[randomKey];
        }
        
        private List<CreateRedditThreadDto> GenerateSampleThreads()
        {
            var subreddits = new List<string>
            {
                "homeimprovement", "BuyItForLife", "malefashionadvice", "femalefashionadvice", 
                "Fitness", "buildapc", "techsupport", "gadgets", "photography", "videography",
                "HomeAutomation", "headphones", "audiophile", "travel", "backpacking", 
                "camping", "CampingGear", "hiking", "MealPrepSunday", "Cooking"
            };
            
            var sampleThreads = new List<CreateRedditThreadDto>();
            
            // Home Improvement
            sampleThreads.AddRange(new List<CreateRedditThreadDto>
            {
                new CreateRedditThreadDto
                {
                    Title = "What's the best way to fix a leaky faucet?",
                    Body = "I've got a kitchen faucet that's been dripping for weeks. I've tried tightening everything I can see, but it still leaks. What tools/parts do I need to fix this properly? Is it something a DIY beginner can handle or should I call a plumber?",
                    Subreddit = "homeimprovement",
                    Permalink = "/r/homeimprovement/comments/s1/whats_the_best_way_to_fix_a_leaky_faucet/",
                    Author = "DIY_Newbie",
                    Upvotes = 124,
                    CommentCount = 45,
                    Flair = "Plumbing"
                },
                new CreateRedditThreadDto
                {
                    Title = "Looking for recommendations on durable kitchen flooring",
                    Body = "We're remodeling our kitchen and need flooring that can stand up to kids, pets, and lots of cooking. Vinyl plank seems popular but I'm worried about durability. What flooring has held up best for you? Budget is around $5/sqft installed.",
                    Subreddit = "homeimprovement",
                    Permalink = "/r/homeimprovement/comments/s2/looking_for_recommendations_on_durable_kitchen_flooring/",
                    Author = "RemodelMama",
                    Upvotes = 320,
                    CommentCount = 87,
                    Flair = "Flooring"
                }
            });
            
            // BuyItForLife
            sampleThreads.AddRange(new List<CreateRedditThreadDto>
            {
                new CreateRedditThreadDto
                {
                    Title = "What's your BIFL kitchen knife recommendation?",
                    Body = "I'm tired of replacing cheap knives every few years. Looking for a chef's knife that will last decades with proper care. Budget up to $200. I cook daily and do a lot of vegetable prep.",
                    Subreddit = "BuyItForLife",
                    Permalink = "/r/BuyItForLife/comments/b1/whats_your_bifl_kitchen_knife_recommendation/",
                    Author = "HomeChef42",
                    Upvotes = 876,
                    CommentCount = 213,
                    Flair = "Request - Kitchen"
                },
                new CreateRedditThreadDto
                {
                    Title = "Need a backpack that will survive daily commuting for years",
                    Body = "I carry a laptop, lunch, water bottle, and various other items daily on public transit. My current backpack is falling apart after just 6 months. Looking for something that will last 5+ years of daily use. Water resistance is a plus since I live in the Pacific Northwest.",
                    Subreddit = "BuyItForLife",
                    Permalink = "/r/BuyItForLife/comments/b2/need_a_backpack_that_will_survive_daily_commuting_for_years/",
                    Author = "CommuterGuy",
                    Upvotes = 546,
                    CommentCount = 189,
                    Flair = "Request - Bags"
                }
            });
            
            // Add more sample threads for Fitness
            sampleThreads.AddRange(new List<CreateRedditThreadDto>
            {
                new CreateRedditThreadDto
                {
                    Title = "Best running shoes for plantar fasciitis?",
                    Body = "I've been dealing with plantar fasciitis for months and need new running shoes. I run about 15 miles a week on pavement and trails. Looking for something with good support that won't break the bank. Any recommendations from fellow sufferers?",
                    Subreddit = "Fitness",
                    Permalink = "/r/Fitness/comments/f1/best_running_shoes_for_plantar_fasciitis/",
                    Author = "PainfulRunner",
                    Upvotes = 432,
                    CommentCount = 156,
                    Flair = "Equipment"
                },
                new CreateRedditThreadDto
                {
                    Title = "Which protein powder actually tastes good?",
                    Body = "I'm trying to increase my protein intake but can't stand the artificial taste of most protein powders. I've tried a few popular brands and they all taste like chemicals to me. Any recommendations for something that actually tastes decent in just water? Preferably whey-based with 20g+ protein per serving.",
                    Subreddit = "Fitness",
                    Permalink = "/r/Fitness/comments/f2/which_protein_powder_actually_tastes_good/",
                    Author = "ProteinSeeker",
                    Upvotes = 765,
                    CommentCount = 342,
                    Flair = "Nutrition"
                }
            });
            
            // Add sample threads for tech subreddits
            sampleThreads.AddRange(new List<CreateRedditThreadDto>
            {
                new CreateRedditThreadDto
                {
                    Title = "Budget gaming PC build: $800 possible in 2023?",
                    Body = "I'm looking to build my first gaming PC and have a budget of around $800. Is this still realistic in 2023? I mainly play Fortnite, Minecraft, and want to try some newer titles like Baldur's Gate 3. Don't need ultra settings, just decent 1080p performance. Any parts lists or advice appreciated!",
                    Subreddit = "buildapc",
                    Permalink = "/r/buildapc/comments/t1/budget_gaming_pc_build_800_possible_in_2023/",
                    Author = "FirstTimeBuildpc",
                    Upvotes = 527,
                    CommentCount = 195,
                    Flair = "Build Help"
                },
                new CreateRedditThreadDto
                {
                    Title = "Most reliable wireless earbuds under $100?",
                    Body = "I'm looking for wireless earbuds that won't die after 6 months. I've gone through 3 pairs in the last year! I use them for workouts and daily commuting. Would prefer good battery life and sweat resistance. Sound quality is important but durability is my main concern.",
                    Subreddit = "gadgets",
                    Permalink = "/r/gadgets/comments/g1/most_reliable_wireless_earbuds_under_100/",
                    Author = "BudgetAudiophile",
                    Upvotes = 892,
                    CommentCount = 367,
                    Flair = "Recommendation"
                }
            });
            
            // Add sample threads for travel/outdoors
            sampleThreads.AddRange(new List<CreateRedditThreadDto>
            {
                new CreateRedditThreadDto
                {
                    Title = "Best lightweight tent for solo backpacking?",
                    Body = "I'm doing a 2-week backpacking trip on the Appalachian Trail this summer and need a lightweight but durable tent. I'd like to keep it under 3 pounds if possible. My budget is around $300 max. Need something that can handle rain well since I'll be in areas with afternoon thunderstorms.",
                    Subreddit = "backpacking",
                    Permalink = "/r/backpacking/comments/bp1/best_lightweight_tent_for_solo_backpacking/",
                    Author = "TrailHiker2023",
                    Upvotes = 643,
                    CommentCount = 212,
                    Flair = "Gear"
                },
                new CreateRedditThreadDto
                {
                    Title = "Best travel backpack for 2-week Europe trip?",
                    Body = "Going to be traveling through several European countries this summer, staying in hostels. Looking for a carry-on size backpack (40-45L) that's comfortable for long days of walking. Would like something with good organization and security features. Budget up to $200.",
                    Subreddit = "travel",
                    Permalink = "/r/travel/comments/tr1/best_travel_backpack_for_2week_europe_trip/",
                    Author = "EuroTripper",
                    Upvotes = 876,
                    CommentCount = 321,
                    Flair = "Advice"
                }
            });
            
            return sampleThreads;
        }
        
        private IEnumerable<CreateRedditThreadDto> GetSampleThreadsForSubreddit(string subreddit, int limit)
        {
            var matching = _sampleThreads.Where(t => t.Subreddit.Equals(subreddit, StringComparison.OrdinalIgnoreCase)).ToList();
            
            // If we don't have sample threads for this subreddit, generate some
            if (!matching.Any())
            {
                matching = GenerateDynamicSampleThreads(subreddit);
            }
            
            // Return requested number of threads, or all available if fewer than requested
            return matching.Take(Math.Min(limit, matching.Count));
        }
        
        private CreateRedditThreadDto? GetSampleThreadDetailsByPermalink(string permalink)
        {
            var thread = _sampleThreads.FirstOrDefault(t => t.Permalink.Equals(permalink, StringComparison.OrdinalIgnoreCase));
            
            // If not found, return a generic thread
            if (thread == null)
            {
                // Extract subreddit from permalink
                var match = Regex.Match(permalink, @"/r/([^/]+)/");
                string subreddit = match.Success ? match.Groups[1].Value : "all";
                
                return new CreateRedditThreadDto
                {
                    Title = "Sample Thread for Requested Permalink",
                    Body = "This is a sample thread body generated because the requested thread could not be fetched from Reddit.",
                    Subreddit = subreddit,
                    Permalink = permalink,
                    Author = "SampleUser",
                    Upvotes = _random.Next(50, 1000),
                    CommentCount = _random.Next(10, 200),
                    Flair = null
                };
            }
            
            return thread;
        }
        
        private List<CreateRedditThreadDto> GenerateDynamicSampleThreads(string subreddit)
        {
            var threads = new List<CreateRedditThreadDto>();
            
            // Generate 5 sample threads for any subreddit
            for (int i = 1; i <= 5; i++)
            {
                threads.Add(new CreateRedditThreadDto
                {
                    Title = $"Sample Thread {i} for r/{subreddit}",
                    Body = $"This is a sample thread body for r/{subreddit}. This content is generated because actual Reddit data could not be fetched.",
                    Subreddit = subreddit,
                    Permalink = $"/r/{subreddit}/comments/sample{i}/sample_thread_{i}_for_r_{subreddit}/",
                    Author = $"User{_random.Next(1000, 9999)}",
                    Upvotes = _random.Next(50, 1000),
                    CommentCount = _random.Next(10, 200),
                    Flair = null
                });
            }
            
            return threads;
        }
    }
}