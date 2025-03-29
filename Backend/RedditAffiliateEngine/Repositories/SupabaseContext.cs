using System;
using Supabase;
using Microsoft.Extensions.Configuration;

namespace RedditAffiliateEngine.Repositories
{
    public class SupabaseContext
    {
        private readonly Client _client;

        public SupabaseContext(IConfiguration configuration)
        {
            var url = configuration["Supabase:Url"] 
                ?? throw new ArgumentNullException("Supabase:Url", "Supabase URL is not configured");
            var key = configuration["Supabase:Key"] 
                ?? throw new ArgumentNullException("Supabase:Key", "Supabase key is not configured");
            
            var options = new SupabaseOptions
            {
                AutoRefreshToken = true,
                AutoConnectRealtime = false
            };
            
            _client = new Client(url, key, options);
        }

        public Client Client => _client;
    }
}