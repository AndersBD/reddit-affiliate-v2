using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RedditAffiliateEngine.Models
{
    #region RedditThread DTOs
    
    /// <summary>
    /// DTO for creating a new Reddit thread
    /// </summary>
    public class CreateRedditThreadDto
    {
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Body { get; set; } = string.Empty;
        
        [Required]
        public string Subreddit { get; set; } = string.Empty;
        
        [Required]
        public string Permalink { get; set; } = string.Empty;
        
        [Required]
        public string Author { get; set; } = string.Empty;
        
        public int Upvotes { get; set; }
        
        public int CommentCount { get; set; }
        
        public string? Flair { get; set; }
        
        public int? Score { get; set; }
        
        public string? IntentType { get; set; }
        
        public int? SerpRank { get; set; }
        
        public DateTime CrawledAt { get; set; } = DateTime.UtcNow;
        
        public List<string>? MatchedKeywords { get; set; }
        
        public int? AffiliateMatch { get; set; }
    }
    
    /// <summary>
    /// DTO for updating a Reddit thread
    /// </summary>
    public class UpdateRedditThreadDto
    {
        public string? Title { get; set; }
        
        public string? Body { get; set; }
        
        public string? Subreddit { get; set; }
        
        public int? Upvotes { get; set; }
        
        public int? CommentCount { get; set; }
        
        public string? Flair { get; set; }
        
        public int? Score { get; set; }
        
        public string? IntentType { get; set; }
        
        public int? SerpRank { get; set; }
        
        public List<string>? MatchedKeywords { get; set; }
        
        public int? AffiliateMatch { get; set; }
    }
    
    #endregion
    
    #region Opportunity DTOs
    
    /// <summary>
    /// DTO for creating a new opportunity
    /// </summary>
    public class CreateOpportunityDto
    {
        [Required]
        public int ThreadId { get; set; }
        
        [Required]
        public int Score { get; set; }
        
        public string? Intent { get; set; }
        
        public List<int>? MatchedProgramIds { get; set; }
        
        public bool SerpMatch { get; set; }
        
        public string? Action { get; set; }
    }
    
    /// <summary>
    /// DTO for updating an opportunity
    /// </summary>
    public class UpdateOpportunityDto
    {
        public int? Score { get; set; }
        
        public string? Intent { get; set; }
        
        public List<int>? MatchedProgramIds { get; set; }
        
        public bool? SerpMatch { get; set; }
        
        public string? Action { get; set; }
    }
    
    #endregion
    
    #region SerpResult DTOs
    
    /// <summary>
    /// DTO for creating a new SERP result
    /// </summary>
    public class CreateSerpResultDto
    {
        [Required]
        public string Query { get; set; } = string.Empty;
        
        [Required]
        public int ThreadId { get; set; }
        
        public int? Position { get; set; }
        
        public bool IsRanked { get; set; }
    }
    
    /// <summary>
    /// DTO for updating a SERP result
    /// </summary>
    public class UpdateSerpResultDto
    {
        public string? Query { get; set; }
        
        public int? Position { get; set; }
        
        public bool? IsRanked { get; set; }
    }
    
    #endregion
    
    #region AffiliateProgram DTOs
    
    /// <summary>
    /// DTO for creating a new affiliate program
    /// </summary>
    public class CreateAffiliateProgramDto
    {
        [Required]
        public string Link { get; set; } = string.Empty;
        
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Description { get; set; } = string.Empty;
        
        public string? PromoCode { get; set; }
        
        [Required]
        public List<string> Keywords { get; set; } = new List<string>();
        
        public string? CommissionRate { get; set; }
        
        public bool Active { get; set; } = true;
    }
    
    /// <summary>
    /// DTO for updating an affiliate program
    /// </summary>
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
    
    #endregion
    
    #region CommentTemplate DTOs
    
    /// <summary>
    /// DTO for creating a new comment template
    /// </summary>
    public class CreateCommentTemplateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        public string Type { get; set; } = string.Empty;
        
        [Required]
        public string Template { get; set; } = string.Empty;
        
        public int? AffiliateProgramId { get; set; }
    }
    
    /// <summary>
    /// DTO for updating a comment template
    /// </summary>
    public class UpdateCommentTemplateDto
    {
        public string? Name { get; set; }
        
        public string? Type { get; set; }
        
        public string? Template { get; set; }
        
        public int? AffiliateProgramId { get; set; }
    }
    
    #endregion
    
    #region User DTOs
    
    /// <summary>
    /// DTO for creating a new user
    /// </summary>
    public class CreateUserDto
    {
        [Required]
        [MinLength(3)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [MinLength(8)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        public string? FullName { get; set; }
        
        public string Role { get; set; } = "User";
    }
    
    /// <summary>
    /// DTO for updating a user
    /// </summary>
    public class UpdateUserDto
    {
        public string? Email { get; set; }
        
        public string? FullName { get; set; }
        
        public string? Role { get; set; }
    }
    
    /// <summary>
    /// DTO for crawl history creation
    /// </summary>
    public class InsertCrawlHistory
    {
        public string Status { get; set; } = "Running";
        
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? CompletedAt { get; set; }
        
        public int ThreadCount { get; set; } = 0;
        
        public List<string> Subreddits { get; set; } = new List<string>();
        
        public string? Error { get; set; }
    }
    
    #endregion
}