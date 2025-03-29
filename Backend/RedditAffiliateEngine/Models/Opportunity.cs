using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RedditAffiliateEngine.Models
{
    public class Opportunity
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [JsonPropertyName("score")]
        public int Score { get; set; }
        
        [JsonPropertyName("thread_id")]
        public int ThreadId { get; set; }
        
        [JsonPropertyName("intent")]
        public string? Intent { get; set; }
        
        [JsonPropertyName("matched_program_ids")]
        public List<int> MatchedProgramIds { get; set; } = new List<int>();
        
        [JsonPropertyName("serp_match")]
        public bool SerpMatch { get; set; }
        
        [JsonPropertyName("action")]
        public string? Action { get; set; } // "contacted", "skipped", "pending"
        
        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
        
        // Navigation properties
        public RedditThread? Thread { get; set; }
        public List<AffiliateProgram> AffiliatePrograms { get; set; } = new List<AffiliateProgram>();
    }
    
    public class CreateOpportunityDto
    {
        public int ThreadId { get; set; }
        public int Score { get; set; }
        public string? Intent { get; set; }
        public List<int> MatchedProgramIds { get; set; } = new List<int>();
        public bool SerpMatch { get; set; }
        public string? Action { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public class UpdateOpportunityDto
    {
        public int? Score { get; set; }
        public string? Intent { get; set; }
        public List<int>? MatchedProgramIds { get; set; }
        public bool? SerpMatch { get; set; }
        public string? Action { get; set; }
        public DateTime? UpdatedAt { get; set; } = DateTime.UtcNow;
    }
    
    public class OpportunityFilterOptions
    {
        public int? ThreadId { get; set; }
        public string? Intent { get; set; }
        public int? Score { get; set; }
        public int? ScoreMin { get; set; }
        public int? ScoreMax { get; set; }
        public bool? SerpMatch { get; set; }
        public string? Action { get; set; }
        public int? Limit { get; set; }
        public int? Offset { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; } // "asc", "desc"
    }
    
    public class OpportunityStats
    {
        public int TotalOpportunities { get; set; }
        public int HighScoreOpportunities { get; set; } // Score >= 70
        public int MediumScoreOpportunities { get; set; } // Score 40-69
        public int LowScoreOpportunities { get; set; } // Score < 40
        public int OpportunitiesWithSerpMatch { get; set; }
        public Dictionary<string, int> OpportunitiesByIntent { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> OpportunitiesByAction { get; set; } = new Dictionary<string, int>();
        public double AverageScore { get; set; }
    }
    
    public class OpportunityWithThread : Opportunity
    {
        [JsonPropertyName("thread_title")]
        public string ThreadTitle { get; set; } = string.Empty;
        
        [JsonPropertyName("subreddit")]
        public string Subreddit { get; set; } = string.Empty;
        
        [JsonPropertyName("permalink")]
        public string Permalink { get; set; } = string.Empty;
        
        [JsonPropertyName("upvotes")]
        public int Upvotes { get; set; }
        
        [JsonPropertyName("comment_count")]
        public int CommentCount { get; set; }
    }
    
    public class OpportunityWithAffiliatePrograms : OpportunityWithThread
    {
        [JsonPropertyName("affiliate_programs")]
        public List<AffiliateProgram> AffiliatePrograms { get; set; } = new List<AffiliateProgram>();
    }
}