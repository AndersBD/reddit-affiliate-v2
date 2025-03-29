using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    /// <summary>
    /// Repository interface for handling affiliate program operations
    /// </summary>
    public interface IAffiliateProgramRepository
    {
        /// <summary>
        /// Get all affiliate programs
        /// </summary>
        Task<List<AffiliateProgram>> GetAffiliateProgramsAsync();
        
        /// <summary>
        /// Get an affiliate program by its ID
        /// </summary>
        Task<AffiliateProgram?> GetAffiliateProgramByIdAsync(int id);
        
        /// <summary>
        /// Create a new affiliate program
        /// </summary>
        Task<AffiliateProgram> CreateAffiliateProgramAsync(CreateAffiliateProgramDto program);
        
        /// <summary>
        /// Update an existing affiliate program
        /// </summary>
        Task<AffiliateProgram?> UpdateAffiliateProgramAsync(int id, UpdateAffiliateProgramDto program);
        
        /// <summary>
        /// Delete an affiliate program by its ID
        /// </summary>
        Task<bool> DeleteAffiliateProgramAsync(int id);
        
        /// <summary>
        /// Get affiliate programs by keyword match
        /// </summary>
        Task<List<AffiliateProgram>> GetAffiliateProgramsByKeywordAsync(string keyword);
        
        /// <summary>
        /// Get active affiliate programs
        /// </summary>
        Task<List<AffiliateProgram>> GetActiveAffiliateProgramsAsync();
        
        /// <summary>
        /// Check if keywords in the content match any affiliate program
        /// </summary>
        Task<List<KeywordMatch>> FindMatchingKeywordsAsync(string content);
        
        /// <summary>
        /// Get all keywords from all affiliate programs
        /// </summary>
        Task<List<string>> GetAllKeywordsAsync();
        
        /// <summary>
        /// Get affiliate programs with related thread counts
        /// </summary>
        Task<List<AffiliateProgramWithStats>> GetAffiliateProgramsWithStatsAsync();
        
        /// <summary>
        /// Toggle the active status of an affiliate program
        /// </summary>
        Task<AffiliateProgram?> ToggleAffiliateProgramStatusAsync(int id);
    }
    
    /// <summary>
    /// DTO for keyword matches in content
    /// </summary>
    public class KeywordMatch
    {
        public int AffiliateProgramId { get; set; }
        public string AffiliateProgramName { get; set; } = string.Empty;
        public List<string> MatchedKeywords { get; set; } = new List<string>();
        public int OccurrenceCount { get; set; }
    }
    
    /// <summary>
    /// DTO for affiliate program with stats
    /// </summary>
    public class AffiliateProgramWithStats : AffiliateProgram
    {
        public int ThreadCount { get; set; }
        public int OpportunityCount { get; set; }
        public int HighScoreOpportunityCount { get; set; } // Opportunities with score > 70
        public DateTime? LastThreadDate { get; set; }
    }
}