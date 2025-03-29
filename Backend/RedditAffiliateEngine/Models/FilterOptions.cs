using System;
using System.Collections.Generic;

namespace RedditAffiliateEngine.Models
{
    /// <summary>
    /// Filter options for Reddit threads
    /// </summary>
    public class ThreadFilterOptions
    {
        public string? Subreddit { get; set; }
        public string? IntentType { get; set; }
        public string? SerpRank { get; set; }
        public string? AffiliateProgram { get; set; }
        public string? Search { get; set; }
        public int? Limit { get; set; }
        public int? Offset { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }
    
    /// <summary>
    /// Filter options for opportunities
    /// </summary>
    public class OpportunityFilterOptions
    {
        public int? ThreadId { get; set; }
        public string? Intent { get; set; }
        public int? Score { get; set; }
        public int? ScoreMin { get; set; }
        public int? ScoreMax { get; set; }
        public bool? SerpMatch { get; set; }
        public string? Action { get; set; }
        public int? Limit { get; set; }
        public int? Offset { get; set; }
        public string? SortBy { get; set; }
        public string? SortDirection { get; set; }
    }
    
    /// <summary>
    /// Statistics about Reddit threads
    /// </summary>
    public class ThreadStats
    {
        public int TotalThreads { get; set; }
        public int ThreadsWithOpportunities { get; set; }
        public int HighScoreThreads { get; set; }
        public Dictionary<string, int> ThreadsBySubreddit { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> ThreadsByIntentType { get; set; } = new Dictionary<string, int>();
        public int RankedThreads { get; set; }
        public int UnrankedThreads { get; set; }
    }
    
    /// <summary>
    /// Statistics about opportunities
    /// </summary>
    public class OpportunityStats
    {
        public int TotalOpportunities { get; set; }
        public int HighScoreOpportunities { get; set; }
        public int OpportunitiesWithSerpMatch { get; set; }
        public Dictionary<string, int> OpportunitiesByIntent { get; set; } = new Dictionary<string, int>();
        public Dictionary<string, int> OpportunitiesByAction { get; set; } = new Dictionary<string, int>();
    }
    
    /// <summary>
    /// Statistics about SERP results
    /// </summary>
    public class SerpStats
    {
        public int TotalSerpResults { get; set; }
        public int RankedThreads { get; set; }
        public int UnrankedThreads { get; set; }
        public Dictionary<int, int> ResultsByPosition { get; set; } = new Dictionary<int, int>();
        public DateTime? LastCheckedAt { get; set; }
    }
    
    /// <summary>
    /// Request for checking SERP position
    /// </summary>
    public class SerpCheckRequest
    {
        public int ThreadId { get; set; }
        public string? Query { get; set; }
    }
    
    /// <summary>
    /// Response for checking SERP position
    /// </summary>
    public class SerpCheckResponse
    {
        public bool Success { get; set; }
        public int? Position { get; set; }
        public string Query { get; set; } = string.Empty;
        public int ThreadId { get; set; }
        public string? Error { get; set; }
    }
    
    /// <summary>
    /// Reddit thread with opportunities
    /// </summary>
    public class ThreadWithOpportunities : RedditThread
    {
        public List<Opportunity> Opportunities { get; set; } = new List<Opportunity>();
    }
    
    /// <summary>
    /// Opportunity with thread data
    /// </summary>
    public class OpportunityWithThread : Opportunity
    {
        public RedditThread? Thread { get; set; }
    }
    
    /// <summary>
    /// SERP result with thread data
    /// </summary>
    public class SerpResultWithThread : SerpResult
    {
        public RedditThread? Thread { get; set; }
    }
    
    /// <summary>
    /// Opportunity with affiliate programs
    /// </summary>
    public class OpportunityWithAffiliatePrograms : Opportunity
    {
        public RedditThread? Thread { get; set; }
        public List<AffiliateProgram> AffiliatePrograms { get; set; } = new List<AffiliateProgram>();
    }
}