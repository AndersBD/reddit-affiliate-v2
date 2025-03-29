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
        
        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
        
        [JsonPropertyName("thread_id")]
        public int ThreadId { get; set; }
        
        [JsonPropertyName("score")]
        public int Score { get; set; }
        
        [JsonPropertyName("intent")]
        public string? Intent { get; set; }
        
        [JsonPropertyName("matched_program_ids")]
        public List<int> MatchedProgramIds { get; set; } = new List<int>();
        
        [JsonPropertyName("serp_match")]
        public bool SerpMatch { get; set; }
        
        [JsonPropertyName("action")]
        public string? Action { get; set; }
        
        // Navigation property
        public RedditThread? Thread { get; set; }
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
        public int Limit { get; set; } = 25;
        public int Offset { get; set; } = 0;
        public string SortBy { get; set; } = "score";
        public string SortDirection { get; set; } = "desc";
    }
    
    public class CreateOpportunityDto
    {
        public int ThreadId { get; set; }
        public int Score { get; set; }
        public string? Intent { get; set; }
        public List<int> MatchedProgramIds { get; set; } = new List<int>();
        public bool SerpMatch { get; set; }
        public string? Action { get; set; }
    }
    
    public class UpdateOpportunityDto
    {
        public int? Score { get; set; }
        public string? Intent { get; set; }
        public List<int>? MatchedProgramIds { get; set; }
        public bool? SerpMatch { get; set; }
        public string? Action { get; set; }
    }
}