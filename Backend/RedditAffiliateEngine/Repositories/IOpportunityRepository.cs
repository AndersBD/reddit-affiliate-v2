using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    /// <summary>
    /// Repository interface for handling opportunity operations
    /// </summary>
    public interface IOpportunityRepository
    {
        /// <summary>
        /// Get all opportunities with optional filtering
        /// </summary>
        Task<List<Opportunity>> GetOpportunitiesAsync(OpportunityFilterOptions? options = null);
        
        /// <summary>
        /// Get an opportunity by its ID
        /// </summary>
        Task<Opportunity?> GetOpportunityByIdAsync(int id);
        
        /// <summary>
        /// Get opportunities for a specific Reddit thread
        /// </summary>
        Task<List<Opportunity>> GetOpportunitiesByThreadIdAsync(int threadId);
        
        /// <summary>
        /// Create a new opportunity
        /// </summary>
        Task<Opportunity> CreateOpportunityAsync(CreateOpportunityDto opportunity);
        
        /// <summary>
        /// Update an existing opportunity
        /// </summary>
        Task<Opportunity?> UpdateOpportunityAsync(int id, UpdateOpportunityDto opportunity);
        
        /// <summary>
        /// Delete an opportunity by its ID
        /// </summary>
        Task<bool> DeleteOpportunityAsync(int id);
        
        /// <summary>
        /// Get opportunities with thread data
        /// </summary>
        Task<List<OpportunityWithThread>> GetOpportunitiesWithThreadAsync(OpportunityFilterOptions? options = null);
        
        /// <summary>
        /// Get an opportunity with thread data
        /// </summary>
        Task<OpportunityWithThread?> GetOpportunityWithThreadAsync(int id);
        
        /// <summary>
        /// Get opportunities with thread and affiliate program data
        /// </summary>
        Task<List<OpportunityWithAffiliatePrograms>> GetOpportunitiesWithDetailAsync(OpportunityFilterOptions? options = null);
        
        /// <summary>
        /// Get an opportunity with thread and affiliate program data
        /// </summary>
        Task<OpportunityWithAffiliatePrograms?> GetOpportunityWithDetailAsync(int id);
        
        /// <summary>
        /// Get statistics about opportunities
        /// </summary>
        Task<OpportunityStats> GetOpportunityStatsAsync();
        
        /// <summary>
        /// Generate opportunities for a Reddit thread
        /// </summary>
        Task<List<Opportunity>> GenerateOpportunitiesForThreadAsync(int threadId);
        
        /// <summary>
        /// Update opportunity scores for all threads
        /// </summary>
        Task<int> RefreshAllOpportunitiesAsync();
        
        /// <summary>
        /// Get opportunities by intent type
        /// </summary>
        Task<List<Opportunity>> GetOpportunitiesByIntentAsync(string intent, int limit = 20);
        
        /// <summary>
        /// Get opportunities that match a specific affiliate program
        /// </summary>
        Task<List<Opportunity>> GetOpportunitiesByAffiliateProgramAsync(int programId, int limit = 20);
    }
}