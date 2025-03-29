using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Services
{
    /// <summary>
    /// Interface for the SERP (Search Engine Results Page) checking service
    /// </summary>
    public interface ISerpCheckService
    {
        /// <summary>
        /// Check the SERP position of a Reddit thread for a specific query
        /// </summary>
        /// <param name="request">The SERP check request containing the thread ID and query</param>
        /// <returns>A response containing the position and status</returns>
        Task<SerpCheckResponse> CheckSerpPositionAsync(SerpCheckRequest request);
        
        /// <summary>
        /// Generate a search query based on a Reddit thread's content
        /// </summary>
        /// <param name="thread">The Reddit thread to generate a query for</param>
        /// <returns>A search query string</returns>
        string GenerateSearchQuery(RedditThread thread);
        
        /// <summary>
        /// Check if a URL appears in search results for a given query
        /// </summary>
        /// <param name="query">The search query</param>
        /// <param name="url">The URL to check for</param>
        /// <param name="maxPages">Maximum number of search pages to check</param>
        /// <returns>The position of the URL in search results, or null if not found</returns>
        Task<int?> FindUrlPositionInSearchResultsAsync(string query, string url, int maxPages = 5);
    }
}