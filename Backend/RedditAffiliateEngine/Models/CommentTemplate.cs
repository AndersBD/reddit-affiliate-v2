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
        public string Type { get; set; } = string.Empty; // "recommendation", "question", "general"
        
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
    
    public class CommentGenerationRequest
    {
        public int OpportunityId { get; set; }
        public int? CommentTemplateId { get; set; }
        public string? CustomTemplate { get; set; }
    }
    
    public class CommentGenerationResponse
    {
        public int OpportunityId { get; set; }
        public string Comment { get; set; } = string.Empty;
        public int ThreadId { get; set; }
        public string ThreadTitle { get; set; } = string.Empty;
        public string AffiliateProgramName { get; set; } = string.Empty;
        public string Template { get; set; } = string.Empty;
    }
    
    public class CommentTemplateWithProgram : CommentTemplate
    {
        [JsonPropertyName("affiliate_program_name")]
        public string AffiliateProgramName { get; set; } = string.Empty;
    }
    
    public class CommentTemplateStats
    {
        public int TotalTemplates { get; set; }
        public int RecommendationTemplates { get; set; }
        public int QuestionTemplates { get; set; }
        public int GeneralTemplates { get; set; }
        public int TemplatesWithAffiliateProgram { get; set; }
    }
}