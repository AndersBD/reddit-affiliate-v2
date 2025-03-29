using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RedditAffiliateEngine.Models
{
    public class CrawlHistory
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("status")]
        public string Status { get; set; } = "running"; // "running", "completed", "failed"
        
        [JsonPropertyName("started_at")]
        public DateTime StartedAt { get; set; }
        
        [JsonPropertyName("completed_at")]
        public DateTime? CompletedAt { get; set; }
        
        [JsonPropertyName("thread_count")]
        public int ThreadCount { get; set; }
        
        [JsonPropertyName("subreddits")]
        public List<string> Subreddits { get; set; } = new List<string>();
        
        [JsonPropertyName("error")]
        public string? Error { get; set; }
    }
    
    public class CreateCrawlHistoryDto
    {
        public string Status { get; set; } = "running";
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }
        public int ThreadCount { get; set; }
        public List<string> Subreddits { get; set; } = new List<string>();
        public string? Error { get; set; }
    }
    
    public class UpdateCrawlHistoryDto
    {
        public string? Status { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? ThreadCount { get; set; }
        public string? Error { get; set; }
    }
    
    public class CrawlRequest
    {
        public List<string> Subreddits { get; set; } = new List<string>();
        public int? Limit { get; set; }
    }
    
    public class CrawlResponse
    {
        public int CrawlHistoryId { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; }
        public int ThreadCount { get; set; }
        public List<string> Subreddits { get; set; } = new List<string>();
        public string Message { get; set; } = string.Empty;
    }
    
    public class CrawlStats
    {
        public int TotalCrawls { get; set; }
        public int SuccessfulCrawls { get; set; }
        public int FailedCrawls { get; set; }
        public int TotalThreadsCrawled { get; set; }
        public DateTime? LastCrawlDate { get; set; }
        public Dictionary<string, int> ThreadsBySubreddit { get; set; } = new Dictionary<string, int>();
        public TimeSpan AverageCrawlDuration { get; set; }
    }
}