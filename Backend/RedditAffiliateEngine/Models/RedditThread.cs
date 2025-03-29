using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RedditAffiliateEngine.Models
{
    public class RedditThread
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        
        [JsonPropertyName("body")]
        public string Body { get; set; } = string.Empty;
        
        [JsonPropertyName("subreddit")]
        public string Subreddit { get; set; } = string.Empty;
        
        [JsonPropertyName("permalink")]
        public string Permalink { get; set; } = string.Empty;
        
        [JsonPropertyName("upvotes")]
        public int Upvotes { get; set; }
        
        [JsonPropertyName("comment_count")]
        public int CommentCount { get; set; }
        
        [JsonPropertyName("author")]
        public string Author { get; set; } = string.Empty;
        
        [JsonPropertyName("flair")]
        public string? Flair { get; set; }
        
        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [JsonPropertyName("crawled_at")]
        public DateTime CrawledAt { get; set; }
        
        [JsonPropertyName("score")]
        public int Score { get; set; }
        
        [JsonPropertyName("intent_type")]
        public string? IntentType { get; set; }
        
        [JsonPropertyName("matched_keywords")]
        public List<string> MatchedKeywords { get; set; } = new List<string>();
        
        [JsonPropertyName("serp_rank")]
        public int? SerpRank { get; set; }
        
        [JsonPropertyName("affiliate_match")]
        public int AffiliateMatch { get; set; }
        
        // Navigation properties
        public List<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
        public List<SerpResult> SerpResults { get; set; } = new List<SerpResult>();
    }
    
    public class ThreadFilterOptions
    {
        public string? Subreddit { get; set; }
        public string? IntentType { get; set; }
        public string? SerpRank { get; set; }
        public string? AffiliateProgram { get; set; }
        public string? Search { get; set; }
        public int Limit { get; set; } = 25;
        public int Offset { get; set; } = 0;
        public string SortBy { get; set; } = "crawledAt";
        public string SortDirection { get; set; } = "desc";
    }
    
    public class CreateRedditThreadDto
    {
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Subreddit { get; set; } = string.Empty;
        public string Permalink { get; set; } = string.Empty;
        public int Upvotes { get; set; }
        public int CommentCount { get; set; }
        public string Author { get; set; } = string.Empty;
        public string? Flair { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime CrawledAt { get; set; } = DateTime.UtcNow;
        public int Score { get; set; }
        public string? IntentType { get; set; }
        public List<string> MatchedKeywords { get; set; } = new List<string>();
        public int? SerpRank { get; set; }
        public int AffiliateMatch { get; set; }
    }
    
    public class UpdateRedditThreadDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public int? Upvotes { get; set; }
        public int? CommentCount { get; set; }
        public int? Score { get; set; }
        public string? IntentType { get; set; }
        public List<string>? MatchedKeywords { get; set; }
        public int? SerpRank { get; set; }
        public int? AffiliateMatch { get; set; }
        public DateTime? CrawledAt { get; set; }
    }
}