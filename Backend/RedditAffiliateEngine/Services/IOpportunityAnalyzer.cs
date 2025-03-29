using System.Threading.Tasks;

namespace RedditAffiliateEngine.Services
{
    public interface IOpportunityAnalyzer
    {
        Task<int> AnalyzeAndScoreThreadsAsync();
    }
}