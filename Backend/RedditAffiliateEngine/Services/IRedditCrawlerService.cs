using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Services
{
    public interface IRedditCrawlerService
    {
        Task<CrawlHistory> RunCrawlerAsync(List<string>? subreddits = null, CancellationToken cancellationToken = default);
    }
}