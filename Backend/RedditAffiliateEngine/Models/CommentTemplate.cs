using System;
using System.Text.Json.Serialization;

namespace RedditAffiliateEngine.Models
{
    public class CommentTemplate
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;
        
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;
        
        [JsonPropertyName("template")]
        public string Template { get; set; } = string.Empty;
        
        [JsonPropertyName("affiliate_program_id")]
        public int? AffiliateProgramId { get; set; }
        
        // Navigation property
        public AffiliateProgram? AffiliateProgram { get; set; }
    }
    
    public class CreateCommentTemplateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Template { get; set; } = string.Empty;
        public int? AffiliateProgramId { get; set; }
    }
    
    public class UpdateCommentTemplateDto
    {
        public string? Name { get; set; }
        public string? Type { get; set; }
        public string? Template { get; set; }
        public int? AffiliateProgramId { get; set; }
    }
}