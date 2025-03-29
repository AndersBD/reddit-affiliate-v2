using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using RedditAffiliateEngine.Models;
using Supabase;
using System.Text.Json;

namespace RedditAffiliateEngine.Repositories
{
    public class RedditThreadRepository : IRedditThreadRepository
    {
        private readonly SupabaseContext _context;
        private const string TABLE_NAME = "reddit_threads";

        public RedditThreadRepository(SupabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<RedditThread>> GetAllAsync(int limit = 25, int offset = 0)
        {
            var response = await _context.Client.From<RedditThread>(TABLE_NAME)
                .Select("*")
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Range(offset, offset + limit - 1)
                .Get();

            return response.Models;
        }

        public async Task<RedditThread?> GetByIdAsync(int id)
        {
            var response = await _context.Client.From<RedditThread>(TABLE_NAME)
                .Select("*")
                .Where(thread => thread.Id == id)
                .Single();

            return response;
        }

        public async Task<IEnumerable<RedditThread>> GetBySubredditAsync(string subreddit, int limit = 25, int offset = 0)
        {
            var response = await _context.Client.From<RedditThread>(TABLE_NAME)
                .Select("*")
                .Where(thread => thread.Subreddit == subreddit)
                .Order("created_at", Postgrest.Constants.Ordering.Descending)
                .Range(offset, offset + limit - 1)
                .Get();

            return response.Models;
        }

        public async Task<IEnumerable<RedditThread>> SearchAsync(string query, int limit = 25, int offset = 0)
        {
            // Using Postgres full-text search with to_tsquery
            var sql = $@"
                SELECT * FROM {TABLE_NAME}
                WHERE to_tsvector('english', title || ' ' || body) @@ to_tsquery('english', $1)
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
            ";
            
            // Convert query to Postgres tsquery format
            var formattedQuery = string.Join(" & ", query.Split(' ', StringSplitOptions.RemoveEmptyEntries));
            
            var response = await _context.Client.Rpc(sql, new Dictionary<string, object>
            {
                { "1", formattedQuery },
                { "2", limit },
                { "3", offset }
            });

            return JsonSerializer.Deserialize<List<RedditThread>>(response.Content.ToString())
                ?? new List<RedditThread>();
        }

        public async Task<RedditThread?> GetByPermalinkAsync(string permalink)
        {
            var response = await _context.Client.From<RedditThread>(TABLE_NAME)
                .Select("*")
                .Where(thread => thread.Permalink == permalink)
                .Single();

            return response;
        }

        public async Task<RedditThread> CreateAsync(CreateRedditThreadDto threadDto)
        {
            var thread = new RedditThread
            {
                Title = threadDto.Title,
                Body = threadDto.Body,
                Subreddit = threadDto.Subreddit,
                Upvotes = threadDto.Upvotes,
                CommentCount = threadDto.CommentCount,
                Permalink = threadDto.Permalink,
                Author = threadDto.Author,
                Flair = threadDto.Flair,
                CreatedAt = DateTime.UtcNow,
                CrawledAt = DateTime.UtcNow,
                IntentType = null,
                HasSerp = false,
                SerpRank = null,
                AffiliateMatch = 0,
                MatchedKeywords = new List<string>(),
                Score = 0
            };

            var response = await _context.Client.From<RedditThread>(TABLE_NAME)
                .Insert(thread);

            return response;
        }

        public async Task<bool> UpdateAsync(int id, RedditThread thread)
        {
            var response = await _context.Client.From<RedditThread>(TABLE_NAME)
                .Where(t => t.Id == id)
                .Update(thread);

            return response != null;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var response = await _context.Client.From<RedditThread>(TABLE_NAME)
                .Where(thread => thread.Id == id)
                .Delete();

            return response != null;
        }

        public async Task<int> GetTotalCountAsync()
        {
            var response = await _context.Client.Rpc("get_count", new Dictionary<string, object>
            {
                { "table_name", TABLE_NAME }
            });

            return Convert.ToInt32(response.Content);
        }
    }
}