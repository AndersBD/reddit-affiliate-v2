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
}