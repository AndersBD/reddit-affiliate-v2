using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using HtmlAgilityPack;
using Microsoft.Extensions.Logging;
using RedditAffiliateEngine.Models;
using System.Linq;
using System.Text.RegularExpressions;

namespace RedditAffiliateEngine.Crawler
{
    public class RedditHtmlCrawler : IRedditCrawler
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<RedditHtmlCrawler> _logger;
        private const string BASE_URL = "https://old.reddit.com/r/";
        private readonly Dictionary<string, string> _userAgents = new Dictionary<string, string>
        {
            { "Chrome", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36" },
            { "Firefox", "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/118.0" },
            { "Safari", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15" },
            { "Edge", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.2088.46" }
        };
        private readonly Random _random = new Random();

        public RedditHtmlCrawler(HttpClient httpClient, ILogger<RedditHtmlCrawler> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<IEnumerable<CreateRedditThreadDto>> CrawlSubredditAsync(string subreddit, RedditSortType sortType = RedditSortType.Hot, int limit = 25, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Starting to crawl r/{subreddit} with sort type {sortType}");
            
            string sortUrl = sortType switch
            {
                RedditSortType.Hot => "hot",
                RedditSortType.New => "new",
                RedditSortType.Top => "top",
                _ => "hot"
            };

            string url = $"{BASE_URL}{subreddit}/{sortUrl}";
            List<CreateRedditThreadDto> threads = new List<CreateRedditThreadDto>();
            
            try
            {
                // Rotate user agents to avoid blocking
                string userAgent = GetRandomUserAgent();
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent", userAgent);
                
                string html = await _httpClient.GetStringAsync(url, cancellationToken);
                
                var doc = new HtmlDocument();
                doc.LoadHtml(html);
                
                // Find thread elements
                var threadNodes = doc.DocumentNode.SelectNodes("//div[contains(@class, 'thing') and contains(@class, 'link')]");
                if (threadNodes == null)
                {
                    _logger.LogWarning($"No threads found in r/{subreddit}");
                    return threads;
                }
                
                foreach (var threadNode in threadNodes.Take(limit))
                {
                    try
                    {
                        var thread = ExtractThreadData(threadNode, subreddit);
                        if (thread != null)
                        {
                            threads.Add(thread);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error extracting thread data from r/{subreddit}");
                    }
                    
                    // Small delay between processing threads to be gentle on Reddit servers
                    await Task.Delay(100, cancellationToken);
                }
                
                _logger.LogInformation($"Successfully crawled {threads.Count} threads from r/{subreddit}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error crawling r/{subreddit}");
            }
            
            return threads;
        }

        public async Task<CreateRedditThreadDto?> GetThreadDetailsAsync(string permalink, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation($"Getting details for thread: {permalink}");
            
            try
            {
                string fullUrl = permalink.StartsWith("http") ? permalink : $"https://old.reddit.com{permalink}";
                
                // Rotate user agents to avoid blocking
                string userAgent = GetRandomUserAgent();
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent", userAgent);
                
                string html = await _httpClient.GetStringAsync(fullUrl, cancellationToken);
                
                var doc = new HtmlDocument();
                doc.LoadHtml(html);
                
                // Extract thread details from the page
                var titleNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'top-matter')]/p[contains(@class, 'title')]/a");
                if (titleNode == null)
                {
                    _logger.LogWarning($"Could not find title for thread: {permalink}");
                    return null;
                }
                
                string title = titleNode.InnerText.Trim();
                
                // Extract body content
                var selfTextNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'usertext-body')]/div[contains(@class, 'md')]");
                string body = selfTextNode != null ? selfTextNode.InnerText.Trim() : string.Empty;
                
                // Extract subreddit
                var subredditNode = doc.DocumentNode.SelectSingleNode("//a[contains(@class, 'subreddit')]");
                string subreddit = subredditNode != null ? subredditNode.InnerText.Trim().Replace("r/", "") : string.Empty;
                
                // Extract author
                var authorNode = doc.DocumentNode.SelectSingleNode("//a[contains(@class, 'author')]");
                string author = authorNode != null ? authorNode.InnerText.Trim() : "[deleted]";
                
                // Extract upvotes
                var scoreNode = doc.DocumentNode.SelectSingleNode("//div[contains(@class, 'score')]");
                int upvotes = 0;
                if (scoreNode != null && !string.IsNullOrEmpty(scoreNode.InnerText))
                {
                    // Handle "k" suffixes for thousands (e.g., "2.5k")
                    string scoreText = scoreNode.InnerText.Trim().ToLower();
                    if (scoreText.EndsWith("k"))
                    {
                        if (double.TryParse(scoreText.Replace("k", ""), out double kScore))
                        {
                            upvotes = (int)(kScore * 1000);
                        }
                    }
                    else
                    {
                        int.TryParse(scoreText, out upvotes);
                    }
                }
                
                // Extract comment count
                var commentCountNode = doc.DocumentNode.SelectSingleNode("//a[contains(@class, 'comments')]");
                int commentCount = 0;
                if (commentCountNode != null)
                {
                    var commentText = commentCountNode.InnerText.Trim();
                    var match = Regex.Match(commentText, @"(\d+)\s+comments");
                    if (match.Success && match.Groups.Count > 1)
                    {
                        int.TryParse(match.Groups[1].Value, out commentCount);
                    }
                }
                
                // Extract flair
                var flairNode = doc.DocumentNode.SelectSingleNode("//span[contains(@class, 'flair')]");
                string flair = flairNode != null ? flairNode.InnerText.Trim() : null;
                
                return new CreateRedditThreadDto
                {
                    Title = title,
                    Body = body,
                    Subreddit = subreddit,
                    Permalink = permalink,
                    Author = author,
                    Upvotes = upvotes,
                    CommentCount = commentCount,
                    Flair = flair
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting details for thread: {permalink}");
                return null;
            }
        }

        private CreateRedditThreadDto? ExtractThreadData(HtmlNode threadNode, string subreddit)
        {
            try
            {
                // Extract thread ID and permalink
                string id = threadNode.GetAttributeValue("id", "").Replace("thing_", "");
                if (string.IsNullOrEmpty(id))
                {
                    return null;
                }
                
                var permalinkNode = threadNode.SelectSingleNode(".//a[contains(@class, 'permalink')]");
                string permalink = permalinkNode != null ? permalinkNode.GetAttributeValue("href", "") : "";
                
                // Extract title
                var titleNode = threadNode.SelectSingleNode(".//p[contains(@class, 'title')]/a");
                string title = titleNode != null ? titleNode.InnerText.Trim() : "";
                
                // For text content, we'll need to fetch the full thread details later
                // but we can extract the post preview for now
                var expandoNode = threadNode.SelectSingleNode(".//div[contains(@class, 'expando')]/form/div");
                string body = expandoNode != null ? expandoNode.InnerText.Trim() : "";
                
                // Extract author
                var authorNode = threadNode.SelectSingleNode(".//a[contains(@class, 'author')]");
                string author = authorNode != null ? authorNode.InnerText.Trim() : "[deleted]";
                
                // Extract score/upvotes
                var scoreNode = threadNode.SelectSingleNode(".//div[contains(@class, 'score')]");
                int upvotes = 0;
                if (scoreNode != null)
                {
                    string scoreText = scoreNode.InnerText.Trim().ToLower();
                    if (scoreText.EndsWith("k"))
                    {
                        if (double.TryParse(scoreText.Replace("k", ""), out double kScore))
                        {
                            upvotes = (int)(kScore * 1000);
                        }
                    }
                    else
                    {
                        int.TryParse(scoreText, out upvotes);
                    }
                }
                
                // Extract comment count
                var commentNode = threadNode.SelectSingleNode(".//a[contains(@class, 'comments')]");
                int commentCount = 0;
                if (commentNode != null)
                {
                    var commentText = commentNode.InnerText.Trim();
                    var match = Regex.Match(commentText, @"(\d+)\s+comments");
                    if (match.Success && match.Groups.Count > 1)
                    {
                        int.TryParse(match.Groups[1].Value, out commentCount);
                    }
                }
                
                // Extract flair
                var flairNode = threadNode.SelectSingleNode(".//span[contains(@class, 'flair')]");
                string flair = flairNode != null ? flairNode.InnerText.Trim() : null;
                
                return new CreateRedditThreadDto
                {
                    Title = title,
                    Body = body,
                    Subreddit = subreddit,
                    Permalink = permalink,
                    Author = author,
                    Upvotes = upvotes,
                    CommentCount = commentCount,
                    Flair = flair
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error extracting thread data");
                return null;
            }
        }
        
        private string GetRandomUserAgent()
        {
            var keys = _userAgents.Keys.ToList();
            string randomKey = keys[_random.Next(keys.Count)];
            return _userAgents[randomKey];
        }
    }

    public enum RedditSortType
    {
        Hot,
        New,
        Top
    }
}