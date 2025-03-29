using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    public interface ICrawlHistoryRepository
    {
        Task<IEnumerable<CrawlHistory>> GetAllAsync(int limit = 25, int offset = 0);
        Task<CrawlHistory?> GetByIdAsync(int id);
        Task<CrawlHistory?> GetLatestAsync();
        Task<CrawlHistory> CreateAsync(CreateCrawlHistoryDto historyDto);
        Task<bool> UpdateAsync(int id, UpdateCrawlHistoryDto updateDto);
        Task<CrawlHistory> AddCompletedEntryAsync(CrawlHistory history);
    }
}