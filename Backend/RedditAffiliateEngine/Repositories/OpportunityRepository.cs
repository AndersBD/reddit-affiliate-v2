using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;
using Supabase;
using System.Text.Json;

namespace RedditAffiliateEngine.Repositories
{
    public class OpportunityRepository : IOpportunityRepository
    {
        private readonly SupabaseContext _context;
        private const string TABLE_NAME = "opportunities";

        public OpportunityRepository(SupabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Opportunity>> GetAllAsync(OpportunityFilterOptions options)
        {
            var query = _context.Client.From<Opportunity>(TABLE_NAME)
                .Select("*, thread:thread_id(*)");

            // Apply filters
            if (options.ThreadId.HasValue)
            {
                query = query.Where(o => o.ThreadId == options.ThreadId.Value);
            }

            if (!string.IsNullOrEmpty(options.Intent))
            {
                query = query.Where(o => o.Intent == options.Intent);
            }

            if (options.ScoreMin.HasValue)
            {
                query = query.Where(o => o.Score >= options.ScoreMin.Value);
            }

            if (options.ScoreMax.HasValue)
            {
                query = query.Where(o => o.Score <= options.ScoreMax.Value);
            }

            if (options.SerpMatch.HasValue)
            {
                query = query.Where(o => o.SerpMatch == options.SerpMatch.Value);
            }

            if (!string.IsNullOrEmpty(options.Action))
            {
                query = query.Where(o => o.Action == options.Action);
            }

            // Apply sorting
            if (!string.IsNullOrEmpty(options.SortBy))
            {
                var ordering = options.SortDirection?.ToLower() == "asc" 
                    ? Postgrest.Constants.Ordering.Ascending 
                    : Postgrest.Constants.Ordering.Descending;
                
                query = query.Order(options.SortBy, ordering);
            }

            // Apply pagination
            query = query.Range(options.Offset, options.Offset + options.Limit - 1);

            var response = await query.Get();
            
            return response.Models;
        }

        public async Task<Opportunity?> GetByIdAsync(int id)
        {
            var response = await _context.Client.From<Opportunity>(TABLE_NAME)
                .Select("*, thread:thread_id(*)")
                .Where(o => o.Id == id)
                .Single();

            return response;
        }

        public async Task<IEnumerable<Opportunity>> GetByThreadIdAsync(int threadId)
        {
            var response = await _context.Client.From<Opportunity>(TABLE_NAME)
                .Select("*, thread:thread_id(*)")
                .Where(o => o.ThreadId == threadId)
                .Order("score", Postgrest.Constants.Ordering.Descending)
                .Get();

            return response.Models;
        }

        public async Task<Opportunity> CreateAsync(CreateOpportunityDto opportunityDto)
        {
            var opportunity = new Opportunity
            {
                ThreadId = opportunityDto.ThreadId,
                MatchedKeywords = opportunityDto.MatchedKeywords,
                MatchedProgramIds = opportunityDto.MatchedProgramIds,
                Intent = opportunityDto.Intent,
                Score = opportunityDto.Score,
                SerpMatch = opportunityDto.SerpMatch,
                Action = opportunityDto.Action,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var response = await _context.Client.From<Opportunity>(TABLE_NAME)
                .Insert(opportunity);

            return response;
        }

        public async Task<bool> UpdateAsync(int id, Opportunity opportunity)
        {
            // Update the timestamp
            opportunity.UpdatedAt = DateTime.UtcNow;

            var response = await _context.Client.From<Opportunity>(TABLE_NAME)
                .Where(o => o.Id == id)
                .Update(opportunity);

            return response != null;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var response = await _context.Client.From<Opportunity>(TABLE_NAME)
                .Where(o => o.Id == id)
                .Delete();

            return response != null;
        }

        public async Task<int> GetTotalCountAsync(OpportunityFilterOptions options)
        {
            // Build a query string with conditions
            string conditions = "";

            if (options.ThreadId.HasValue)
            {
                conditions += $" AND thread_id = {options.ThreadId.Value}";
            }

            if (!string.IsNullOrEmpty(options.Intent))
            {
                conditions += $" AND intent = '{options.Intent}'";
            }

            if (options.ScoreMin.HasValue)
            {
                conditions += $" AND score >= {options.ScoreMin.Value}";
            }

            if (options.ScoreMax.HasValue)
            {
                conditions += $" AND score <= {options.ScoreMax.Value}";
            }

            if (options.SerpMatch.HasValue)
            {
                conditions += $" AND serp_match = {(options.SerpMatch.Value ? "true" : "false")}";
            }

            if (!string.IsNullOrEmpty(options.Action))
            {
                conditions += $" AND action = '{options.Action}'";
            }

            string sql = $"SELECT COUNT(*) FROM {TABLE_NAME} WHERE 1=1 {conditions}";

            var response = await _context.Client.Rpc(sql);
            return Convert.ToInt32(response.Content);
        }
    }
}