using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    /// <summary>
    /// Repository interface for handling SERP (Search Engine Results Page) operations
    /// </summary>
    public interface ISerpResultRepository
    {
        /// <summary>
        /// Get all SERP results
        /// </summary>
        Task<List<SerpResult>> GetSerpResultsAsync();
        
        /// <summary>
        /// Get a SERP result by its ID
        /// </summary>
        Task<SerpResult?> GetSerpResultByIdAsync(int id);
        
        /// <summary>
        /// Get SERP results for a specific Reddit thread
        /// </summary>
        Task<List<SerpResult>> GetSerpResultsByThreadIdAsync(int threadId);
        
        /// <summary>
        /// Create a new SERP result
        /// </summary>
        Task<SerpResult> CreateSerpResultAsync(CreateSerpResultDto serpResult);
        
        /// <summary>
        /// Update an existing SERP result
        /// </summary>
        Task<SerpResult?> UpdateSerpResultAsync(int id, UpdateSerpResultDto serpResult);
        
        /// <summary>
        /// Delete a SERP result by its ID
        /// </summary>
        Task<bool> DeleteSerpResultAsync(int id);
        
        /// <summary>
        /// Get statistics about SERP results
        /// </summary>
        Task<SerpStats> GetSerpStatsAsync();
        
        /// <summary>
        /// Check the SERP position for a thread
        /// </summary>
        Task<SerpCheckResponse> CheckSerpPositionAsync(SerpCheckRequest request);
        
        /// <summary>
        /// Get SERP results with thread data
        /// </summary>
        Task<List<SerpResultWithThread>> GetSerpResultsWithThreadAsync();
        
        /// <summary>
        /// Get threads with SERP ranking
        /// </summary>
        Task<List<RedditThread>> GetRankedThreadsAsync(int limit = 20);
        
        /// <summary>
        /// Get threads without SERP ranking
        /// </summary>
        Task<List<RedditThread>> GetUnrankedThreadsAsync(int limit = 20);
        
        /// <summary>
        /// Get threads with highest SERP rankings
        /// </summary>
        Task<List<RedditThread>> GetTopRankedThreadsAsync(int limit = 10);
    }
}