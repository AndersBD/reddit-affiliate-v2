using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    public interface ICommentTemplateRepository
    {
        Task<IEnumerable<CommentTemplate>> GetAllAsync();
        Task<CommentTemplate?> GetByIdAsync(int id);
        Task<IEnumerable<CommentTemplate>> GetByTypeAsync(string type);
        Task<IEnumerable<CommentTemplate>> GetByAffiliateProgramIdAsync(int affiliateProgramId);
        Task<CommentTemplate> CreateAsync(CreateCommentTemplateDto templateDto);
        Task<bool> UpdateAsync(int id, CommentTemplate template);
        Task<bool> DeleteAsync(int id);
    }
}