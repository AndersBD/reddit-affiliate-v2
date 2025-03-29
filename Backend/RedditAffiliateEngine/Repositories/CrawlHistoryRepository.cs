using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;
using Supabase;

namespace RedditAffiliateEngine.Repositories
{
    public class CrawlHistoryRepository : ICrawlHistoryRepository
    {
        private readonly SupabaseContext _context;
        private const string TABLE_NAME = "crawl_history";

        public CrawlHistoryRepository(SupabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CrawlHistory>> GetAllAsync(int limit = 10, int offset = 0)
        {
            var response = await _context.Client.From<CrawlHistory>(TABLE_NAME)
                .Select("*")
                .Order("started_at", Postgrest.Constants.Ordering.Descending)
                .Range(offset, offset + limit - 1)
                .Get();

            return response.Models;
        }

        public async Task<CrawlHistory?> GetByIdAsync(int id)
        {
            var response = await _context.Client.From<CrawlHistory>(TABLE_NAME)
                .Select("*")
                .Where(history => history.Id == id)
                .Single();

            return response;
        }

        public async Task<CrawlHistory?> GetLatestAsync()
        {
            var response = await _context.Client.From<CrawlHistory>(TABLE_NAME)
                .Select("*")
                .Order("started_at", Postgrest.Constants.Ordering.Descending)
                .Limit(1)
                .Single();

            return response;
        }

        public async Task<CrawlHistory> CreateAsync(CreateCrawlHistoryDto historyDto)
        {
            var history = new CrawlHistory
            {
                StartedAt = historyDto.StartedAt,
                Subreddits = historyDto.Subreddits,
                Status = historyDto.Status,
                ThreadsDiscovered = 0,
                ThreadsSaved = 0
            };

            var response = await _context.Client.From<CrawlHistory>(TABLE_NAME)
                .Insert(history);

            return response;
        }

        public async Task<bool> UpdateAsync(int id, UpdateCrawlHistoryDto historyDto)
        {
            // We need to get the existing record first to update only specific fields
            var existing = await GetByIdAsync(id);
            if (existing == null)
            {
                return false;
            }

            // Update fields
            if (historyDto.CompletedAt.HasValue)
            {
                existing.CompletedAt = historyDto.CompletedAt;
            }
            
            existing.ThreadsDiscovered = historyDto.ThreadsDiscovered;
            existing.ThreadsSaved = historyDto.ThreadsSaved;
            existing.Status = historyDto.Status;
            existing.Error = historyDto.Error;

            var response = await _context.Client.From<CrawlHistory>(TABLE_NAME)
                .Where(h => h.Id == id)
                .Update(existing);

            return response != null;
        }
    }
}