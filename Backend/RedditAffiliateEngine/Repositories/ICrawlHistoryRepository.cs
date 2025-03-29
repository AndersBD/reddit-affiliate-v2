using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    /// <summary>
    /// Repository interface for handling crawler history operations
    /// </summary>
    public interface ICrawlHistoryRepository
    {
        /// <summary>
        /// Get all crawl history entries
        /// </summary>
        Task<List<CrawlHistory>> GetCrawlHistoryAsync();
        
        /// <summary>
        /// Get a crawl history entry by its ID
        /// </summary>
        Task<CrawlHistory?> GetCrawlHistoryByIdAsync(int id);
        
        /// <summary>
        /// Create a new crawl history entry
        /// </summary>
        Task<CrawlHistory> CreateCrawlHistoryAsync(InsertCrawlHistory history);
        
        /// <summary>
        /// Update an existing crawl history entry
        /// </summary>
        Task<CrawlHistory?> UpdateCrawlHistoryAsync(int id, Partial<InsertCrawlHistory> history);
        
        /// <summary>
        /// Get the most recent crawl history
        /// </summary>
        Task<CrawlHistory?> GetLastCrawlHistoryAsync();
        
        /// <summary>
        /// Check if a crawl is currently in progress
        /// </summary>
        Task<bool> IsCrawlInProgressAsync();
        
        /// <summary>
        /// Get statistics about crawler runs
        /// </summary>
        Task<CrawlStats> GetCrawlStatsAsync();
        
        /// <summary>
        /// Mark a crawl history entry as completed
        /// </summary>
        Task<CrawlHistory?> CompleteCrawlHistoryAsync(int id, int threadCount, string? error = null);
        
        /// <summary>
        /// Mark a crawl history as failed
        /// </summary>
        Task<CrawlHistory?> FailCrawlHistoryAsync(int id, string error);
    }
    
    /// <summary>
    /// Partial update type for CrawlHistory
    /// </summary>
    public class Partial<T> where T : class
    {
        public Dictionary<string, object?> Updates { get; set; } = new Dictionary<string, object?>();
    }
    
    /// <summary>
    /// Statistics about crawler runs
    /// </summary>
    public class CrawlStats
    {
        public int TotalCrawls { get; set; }
        public int SuccessfulCrawls { get; set; }
        public int FailedCrawls { get; set; }
        public int ThreadsCrawled { get; set; }
        public DateTime? LastCrawlTime { get; set; }
        public double AverageCrawlTime { get; set; } // in seconds
        public double AverageThreadsPerCrawl { get; set; }
    }
}