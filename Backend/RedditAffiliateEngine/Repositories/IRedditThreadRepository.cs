using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Repositories
{
    public interface IRedditThreadRepository
    {
        Task<List<RedditThread>> GetAllAsync(ThreadFilterOptions options = null);
        Task<RedditThread> GetByIdAsync(int id);
        Task<RedditThread> CreateAsync(CreateRedditThreadDto thread);
        Task<RedditThread> UpdateAsync(int id, Partial<CreateRedditThreadDto> thread);
        Task<bool> DeleteAsync(int id);
    }
}

// Helper class to handle partial updates
public class Partial<T> where T : class
{
    private readonly Dictionary<string, object> _properties = new Dictionary<string, object>();

    public void Set<TValue>(string propertyName, TValue value)
    {
        _properties[propertyName] = value;
    }

    public bool TryGetValue<TValue>(string propertyName, out TValue value)
    {
        if (_properties.TryGetValue(propertyName, out var objValue) && objValue is TValue typedValue)
        {
            value = typedValue;
            return true;
        }

        value = default;
        return false;
    }

    public bool HasProperty(string propertyName)
    {
        return _properties.ContainsKey(propertyName);
    }

    public IEnumerable<string> GetPropertyNames()
    {
        return _properties.Keys;
    }

    public IEnumerable<KeyValuePair<string, object>> GetProperties()
    {
        return _properties;
    }
}