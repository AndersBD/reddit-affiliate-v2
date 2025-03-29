using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;
using Supabase;

namespace RedditAffiliateEngine.Repositories
{
    public class AffiliateProgramRepository : IAffiliateProgramRepository
    {
        private readonly SupabaseContext _context;
        private const string TABLE_NAME = "affiliate_programs";

        public AffiliateProgramRepository(SupabaseContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AffiliateProgram>> GetAllAsync()
        {
            var response = await _context.Client.From<AffiliateProgram>(TABLE_NAME)
                .Select("*")
                .Order("name", Postgrest.Constants.Ordering.Ascending)
                .Get();

            return response.Models;
        }

        public async Task<AffiliateProgram?> GetByIdAsync(int id)
        {
            var response = await _context.Client.From<AffiliateProgram>(TABLE_NAME)
                .Select("*")
                .Where(program => program.Id == id)
                .Single();

            return response;
        }

        public async Task<IEnumerable<AffiliateProgram>> GetByCategoryAsync(string category)
        {
            var response = await _context.Client.From<AffiliateProgram>(TABLE_NAME)
                .Select("*")
                .Where(program => program.Category == category)
                .Order("name", Postgrest.Constants.Ordering.Ascending)
                .Get();

            return response.Models;
        }

        public async Task<AffiliateProgram> CreateAsync(CreateAffiliateProgramDto programDto)
        {
            var program = new AffiliateProgram
            {
                Name = programDto.Name,
                Keywords = programDto.Keywords,
                PromoCode = programDto.PromoCode,
                Link = programDto.Link,
                Description = programDto.Description,
                Category = programDto.Category,
                LogoUrl = programDto.LogoUrl,
                Commission = programDto.Commission,
                IsActive = programDto.IsActive
            };

            var response = await _context.Client.From<AffiliateProgram>(TABLE_NAME)
                .Insert(program);

            return response;
        }

        public async Task<bool> UpdateAsync(int id, AffiliateProgram program)
        {
            var response = await _context.Client.From<AffiliateProgram>(TABLE_NAME)
                .Where(p => p.Id == id)
                .Update(program);

            return response != null;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var response = await _context.Client.From<AffiliateProgram>(TABLE_NAME)
                .Where(program => program.Id == id)
                .Delete();

            return response != null;
        }
    }
}