using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Crawler
{
    public interface IRedditCrawler
    {
        Task<IEnumerable<CreateRedditThreadDto>> CrawlSubredditAsync(
            string subreddit, 
            RedditSortType sortType = RedditSortType.Hot, 
            int limit = 25, 
            CancellationToken cancellationToken = default);
            
        Task<CreateRedditThreadDto?> GetThreadDetailsAsync(
            string permalink, 
            CancellationToken cancellationToken = default);
    }
}