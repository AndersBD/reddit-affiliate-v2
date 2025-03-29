using System;
using System.Text.Json.Serialization;

namespace RedditAffiliateEngine.Models
{
    public class SerpResult
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }
        
        [JsonPropertyName("query")]
        public string Query { get; set; } = string.Empty;
        
        [JsonPropertyName("thread_id")]
        public int ThreadId { get; set; }
        
        [JsonPropertyName("position")]
        public int? Position { get; set; }
        
        [JsonPropertyName("checked_at")]
        public DateTime CheckedAt { get; set; }
        
        [JsonPropertyName("is_ranked")]
        public bool IsRanked { get; set; }
        
        // Navigation property
        public RedditThread? Thread { get; set; }
    }
    
    public class CreateSerpResultDto
    {
        public string Query { get; set; } = string.Empty;
        public int ThreadId { get; set; }
        public int? Position { get; set; }
        public DateTime CheckedAt { get; set; } = DateTime.UtcNow;
        public bool IsRanked { get; set; }
    }
    
    public class UpdateSerpResultDto
    {
        public string? Query { get; set; }
        public int? Position { get; set; }
        public DateTime? CheckedAt { get; set; }
        public bool? IsRanked { get; set; }
    }
}