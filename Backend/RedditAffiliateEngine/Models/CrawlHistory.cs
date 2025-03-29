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
        public string Status { get; set; } = "pending";
        
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
        public string Status { get; set; } = "pending";
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
}