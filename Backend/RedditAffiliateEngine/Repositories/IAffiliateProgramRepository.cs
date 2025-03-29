using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    public interface IAffiliateProgramRepository
    {
        Task<List<AffiliateProgram>> GetAllAsync();
        Task<AffiliateProgram> GetByIdAsync(int id);
        Task<AffiliateProgram> CreateAsync(CreateAffiliateProgramDto program);
        Task<AffiliateProgram> UpdateAsync(int id, Partial<CreateAffiliateProgramDto> program);
        Task<bool> DeleteAsync(int id);
    }
}