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
        
        [JsonPropertyName("serp_rank")]
        public int? SerpRank { get; set; }
        
        [JsonPropertyName("matched_keywords")]
        public List<string> MatchedKeywords { get; set; } = new List<string>();
        
        [JsonPropertyName("affiliate_match")]
        public int AffiliateMatch { get; set; }
        
        // Navigation properties
        public List<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
        public List<SerpResult> SerpResults { get; set; } = new List<SerpResult>();
    }
    
    public class CreateRedditThreadDto
    {
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public string Subreddit { get; set; } = string.Empty;
        public string Permalink { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public int Upvotes { get; set; }
        public int CommentCount { get; set; }
        public string? Flair { get; set; }
        public int Score { get; set; }
        public string? IntentType { get; set; }
        public int? SerpRank { get; set; }
        public List<string> MatchedKeywords { get; set; } = new List<string>();
        public int AffiliateMatch { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime CrawledAt { get; set; } = DateTime.UtcNow;
    }
    
    public class UpdateRedditThreadDto
    {
        public string? Title { get; set; }
        public string? Body { get; set; }
        public string? Subreddit { get; set; }
        public string? Permalink { get; set; }
        public string? Author { get; set; }
        public int? Upvotes { get; set; }
        public int? CommentCount { get; set; }
        public string? Flair { get; set; }
        public int? Score { get; set; }
        public string? IntentType { get; set; }
        public int? SerpRank { get; set; }
        public List<string>? MatchedKeywords { get; set; }
        public int? AffiliateMatch { get; set; }
        public DateTime? CrawledAt { get; set; }
    }
    
    public class ThreadFilterOptions
    {
        public string? Subreddit { get; set; }
        public string? IntentType { get; set; }
        public string? SerpRank { get; set; } // "ranked", "not_ranked", "all"
        public string? AffiliateProgram { get; set; }
        public string? Search { get; set; }
        public int? Limit { get; set; }
        public int? Offset { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; } // "asc", "desc"
    }
    
    public class ThreadStats
    {
        public int TotalThreads { get; set; }
        public Dictionary<string, int> ThreadsBySubreddit { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> ThreadsByIntent { get; set; } = new Dictionary<string, int>();
        public int ThreadsWithSerpRank { get; set; }
        public int ThreadsWithAffiliateMatch { get; set; }
        public double AverageScore { get; set; }
        public double AverageUpvotes { get; set; }
        public double AverageCommentCount { get; set; }
    }
    
    public class ThreadWithOpportunities : RedditThread
    {
        [JsonPropertyName("opportunity_count")]
        public int OpportunityCount { get; set; }
        
        [JsonPropertyName("top_opportunity_score")]
        public int? TopOpportunityScore { get; set; }
    }
}