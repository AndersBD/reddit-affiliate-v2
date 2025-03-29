using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    public interface IOpportunityRepository
    {
        Task<IEnumerable<Opportunity>> GetAllAsync(OpportunityFilterOptions? options = null);
        Task<Opportunity?> GetByIdAsync(int id);
        Task<IEnumerable<Opportunity>> GetByThreadIdAsync(int threadId);
        Task<Opportunity> CreateAsync(CreateOpportunityDto opportunityDto);
        Task<bool> UpdateAsync(int id, Opportunity opportunity);
        Task<bool> DeleteAsync(int id);
        Task<int> RefreshOpportunitiesAsync();
    }
}