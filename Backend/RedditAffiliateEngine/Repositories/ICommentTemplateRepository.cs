using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    /// <summary>
    /// Repository interface for handling comment template operations
    /// </summary>
    public interface ICommentTemplateRepository
    {
        /// <summary>
        /// Get all comment templates
        /// </summary>
        Task<List<CommentTemplate>> GetCommentTemplatesAsync();
        
        /// <summary>
        /// Get a comment template by its ID
        /// </summary>
        Task<CommentTemplate?> GetCommentTemplateByIdAsync(int id);
        
        /// <summary>
        /// Get comment templates by type
        /// </summary>
        Task<List<CommentTemplate>> GetCommentTemplatesByTypeAsync(string type);
        
        /// <summary>
        /// Create a new comment template
        /// </summary>
        Task<CommentTemplate> CreateCommentTemplateAsync(CreateCommentTemplateDto template);
        
        /// <summary>
        /// Update an existing comment template
        /// </summary>
        Task<CommentTemplate?> UpdateCommentTemplateAsync(int id, UpdateCommentTemplateDto template);
        
        /// <summary>
        /// Delete a comment template by its ID
        /// </summary>
        Task<bool> DeleteCommentTemplateAsync(int id);
        
        /// <summary>
        /// Get comment templates by affiliate program ID
        /// </summary>
        Task<List<CommentTemplate>> GetCommentTemplatesByAffiliateProgramIdAsync(int programId);
        
        /// <summary>
        /// Get comment templates with affiliate program data
        /// </summary>
        Task<List<CommentTemplateWithProgram>> GetCommentTemplatesWithProgramAsync();
        
        /// <summary>
        /// Get a comment template with affiliate program data
        /// </summary>
        Task<CommentTemplateWithProgram?> GetCommentTemplateWithProgramAsync(int id);
        
        /// <summary>
        /// Generate a comment for a specific opportunity
        /// </summary>
        Task<GeneratedComment> GenerateCommentAsync(GenerateCommentRequest request);
    }
    
    /// <summary>
    /// Comment template with affiliate program data
    /// </summary>
    public class CommentTemplateWithProgram : CommentTemplate
    {
        public AffiliateProgram? AffiliateProgram { get; set; }
    }
    
    /// <summary>
    /// Request for generating a comment
    /// </summary>
    public class GenerateCommentRequest
    {
        public int OpportunityId { get; set; }
        public int? TemplateId { get; set; }
        public string? CustomTemplate { get; set; }
        public Dictionary<string, string> Variables { get; set; } = new Dictionary<string, string>();
    }
    
    /// <summary>
    /// Response for a generated comment
    /// </summary>
    public class GeneratedComment
    {
        public string Comment { get; set; } = string.Empty;
        public Dictionary<string, string> ReplacedVariables { get; set; } = new Dictionary<string, string>();
        public int OpportunityId { get; set; }
        public int? TemplateId { get; set; }
    }
}