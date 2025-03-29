using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RedditAffiliateEngine.Models
{
    public class AffiliateProgram
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("link")]
        public string Link { get; set; } = string.Empty;
        
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
        
        [JsonPropertyName("promo_code")]
        public string? PromoCode { get; set; }
        
        [JsonPropertyName("keywords")]
        public List<string> Keywords { get; set; } = new List<string>();
        
        [JsonPropertyName("commission_rate")]
        public string? CommissionRate { get; set; }
        
        [JsonPropertyName("active")]
        public bool Active { get; set; } = true;
        
        // Navigation properties
        public List<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
        public List<CommentTemplate> CommentTemplates { get; set; } = new List<CommentTemplate>();
    }
    
    public class CreateAffiliateProgramDto
    {
        public string Link { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PromoCode { get; set; }
        public List<string> Keywords { get; set; } = new List<string>();
        public string? CommissionRate { get; set; }
        public bool Active { get; set; } = true;
    }
    
    public class UpdateAffiliateProgramDto
    {
        public string? Link { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? PromoCode { get; set; }
        public List<string>? Keywords { get; set; }
        public string? CommissionRate { get; set; }
        public bool? Active { get; set; }
    }
    
    public class AffiliateProgramStats
    {
        public int TotalPrograms { get; set; }
        public int ActivePrograms { get; set; }
        public int InactivePrograms { get; set; }
        public int TotalOpportunities { get; set; }
        public Dictionary<string, int> OpportunitiesByProgram { get; set; } = new Dictionary<string, int>();
        public List<AffiliateProgramMatch> TopMatchedPrograms { get; set; } = new List<AffiliateProgramMatch>();
    }
    
    public class AffiliateProgramMatch
    {
        public int AffiliateProgramId { get; set; }
        public string ProgramName { get; set; } = string.Empty;
        public int MatchCount { get; set; }
        public double AverageOpportunityScore { get; set; }
    }
    
    public class KeywordAnalysisResult
    {
        public string Keyword { get; set; } = string.Empty;
        public int Occurrences { get; set; }
        public int ThreadsMatched { get; set; }
        public double AverageOpportunityScore { get; set; }
    }
}