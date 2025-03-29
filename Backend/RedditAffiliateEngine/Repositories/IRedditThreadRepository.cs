using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    /// <summary>
    /// Repository interface for handling Reddit thread operations
    /// </summary>
    public interface IRedditThreadRepository
    {
        /// <summary>
        /// Get all threads with optional filtering
        /// </summary>
        Task<List<RedditThread>> GetThreadsAsync(ThreadFilterOptions? options = null);
        
        /// <summary>
        /// Get a thread by its ID
        /// </summary>
        Task<RedditThread?> GetThreadByIdAsync(int id);
        
        /// <summary>
        /// Create a new thread
        /// </summary>
        Task<RedditThread> CreateThreadAsync(CreateRedditThreadDto thread);
        
        /// <summary>
        /// Update an existing thread
        /// </summary>
        Task<RedditThread?> UpdateThreadAsync(int id, UpdateRedditThreadDto thread);
        
        /// <summary>
        /// Delete a thread by its ID
        /// </summary>
        Task<bool> DeleteThreadAsync(int id);
        
        /// <summary>
        /// Get threads with opportunities data
        /// </summary>
        Task<List<ThreadWithOpportunities>> GetThreadsWithOpportunitiesAsync(ThreadFilterOptions? options = null);
        
        /// <summary>
        /// Get thread with opportunities data
        /// </summary>
        Task<ThreadWithOpportunities?> GetThreadWithOpportunitiesAsync(int id);
        
        /// <summary>
        /// Get statistics about threads
        /// </summary>
        Task<ThreadStats> GetThreadStatsAsync();
        
        /// <summary>
        /// Search for threads by keywords
        /// </summary>
        Task<List<RedditThread>> SearchThreadsAsync(string query, int limit = 10);
        
        /// <summary>
        /// Get threads filtered by intent type
        /// </summary>
        Task<List<RedditThread>> GetThreadsByIntentAsync(string intentType, int limit = 20);
        
        /// <summary>
        /// Get threads that match an affiliate program
        /// </summary>
        Task<List<RedditThread>> GetThreadsByAffiliateProgramAsync(int programId, int limit = 20);
        
        /// <summary>
        /// Check if a thread already exists by permalink
        /// </summary>
        Task<bool> ThreadExistsByPermalinkAsync(string permalink);
    }
}