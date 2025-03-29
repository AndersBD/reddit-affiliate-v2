using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using RedditAffiliateEngine.Models;
using RedditAffiliateEngine.Repositories;

namespace RedditAffiliateEngine.Services
{
    public class OpportunityAnalyzer : IOpportunityAnalyzer
    {
        private readonly IRedditThreadRepository _threadRepository;
        private readonly IOpportunityRepository _opportunityRepository;
        private readonly ISerpResultRepository _serpResultRepository;
        private readonly IAffiliateProgramRepository _affiliateProgramRepository;
        private readonly IIntentClassifier _intentClassifier;
        private readonly ILogger<OpportunityAnalyzer> _logger;

        public OpportunityAnalyzer(
            IRedditThreadRepository threadRepository,
            IOpportunityRepository opportunityRepository,
            ISerpResultRepository serpResultRepository,
            IAffiliateProgramRepository affiliateProgramRepository,
            IIntentClassifier intentClassifier,
            ILogger<OpportunityAnalyzer> logger)
        {
            _threadRepository = threadRepository;
            _opportunityRepository = opportunityRepository;
            _serpResultRepository = serpResultRepository;
            _affiliateProgramRepository = affiliateProgramRepository;
            _intentClassifier = intentClassifier;
            _logger = logger;
        }

        public async Task<int> AnalyzeAndScoreThreadsAsync()
        {
            try
            {
                // Get all threads
                var threads = await _threadRepository.GetAllAsync(1000);
                
                // Get all affiliate programs for matching
                var affiliatePrograms = await _affiliateProgramRepository.GetAllAsync();
                
                int opportunitiesCreated = 0;
                
                foreach (var thread in threads)
                {
                    try
                    {
                        // 1. Classify thread intent if not already classified
                        if (string.IsNullOrEmpty(thread.IntentType))
                        {
                            string intent = _intentClassifier.ClassifyIntentAsString(thread);
                            thread.IntentType = intent;
                            await _threadRepository.UpdateAsync(thread.Id, thread);
                        }
                        
                        // 2. Find matching keywords
                        var matchedKeywords = FindMatchingKeywords(thread, affiliatePrograms.ToList());
                        
                        // 3. Get matched program IDs
                        var matchedProgramIds = GetMatchedProgramIds(matchedKeywords, affiliatePrograms.ToList());
                        thread.AffiliateMatch = matchedProgramIds.Count;
                        thread.MatchedKeywords = matchedKeywords;
                        
                        // 4. Check if there are any SERP results for this thread
                        var serpResults = await _serpResultRepository.GetByThreadIdAsync(thread.Id);
                        bool hasSerpMatch = serpResults.Any();
                        thread.HasSerp = hasSerpMatch;
                        
                        // 5. Calculate opportunity score
                        int score = CalculateThreadScore(
                            thread, 
                            matchedProgramIds,
                            thread.IntentType, 
                            hasSerpMatch);
                        
                        // 6. Check if opportunity already exists for this thread
                        var existingOpportunities = await _opportunityRepository.GetByThreadIdAsync(thread.Id);
                        
                        if (!existingOpportunities.Any())
                        {
                            // Create new opportunity
                            var action = DetermineAction(score, thread.IntentType);
                            
                            var opportunityDto = new CreateOpportunityDto
                            {
                                ThreadId = thread.Id,
                                MatchedKeywords = matchedKeywords,
                                MatchedProgramIds = matchedProgramIds,
                                Intent = thread.IntentType,
                                Score = score,
                                SerpMatch = hasSerpMatch,
                                Action = action
                            };
                            
                            await _opportunityRepository.CreateAsync(opportunityDto);
                            opportunitiesCreated++;
                        }
                        else
                        {
                            // Update existing opportunity
                            var existingOpportunity = existingOpportunities.First();
                            var action = DetermineAction(score, thread.IntentType);
                            
                            existingOpportunity.MatchedKeywords = matchedKeywords;
                            existingOpportunity.MatchedProgramIds = matchedProgramIds;
                            existingOpportunity.Intent = thread.IntentType;
                            existingOpportunity.Score = score;
                            existingOpportunity.SerpMatch = hasSerpMatch;
                            existingOpportunity.Action = action;
                            existingOpportunity.UpdatedAt = DateTime.UtcNow;
                            
                            await _opportunityRepository.UpdateAsync(existingOpportunity.Id, existingOpportunity);
                        }
                        
                        // Update thread score
                        thread.Score = score;
                        await _threadRepository.UpdateAsync(thread.Id, thread);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error analyzing thread ID {ThreadId}", thread.Id);
                    }
                }
                
                return opportunitiesCreated;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing and scoring threads");
                throw;
            }
        }

        private List<string> FindMatchingKeywords(RedditThread thread, List<AffiliateProgram> affiliatePrograms)
        {
            var matchedKeywords = new List<string>();
            
            try
            {
                string content = (thread.Title + " " + thread.Body).ToLower();
                
                foreach (var program in affiliatePrograms)
                {
                    foreach (var keyword in program.Keywords)
                    {
                        if (content.Contains(keyword.ToLower()))
                        {
                            if (!matchedKeywords.Contains(keyword))
                            {
                                matchedKeywords.Add(keyword);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding matching keywords for thread ID {ThreadId}", thread.Id);
            }
            
            return matchedKeywords;
        }

        private List<int> GetMatchedProgramIds(List<string> matchedKeywords, List<AffiliateProgram> affiliatePrograms)
        {
            var matchedProgramIds = new List<int>();
            
            try
            {
                foreach (var program in affiliatePrograms)
                {
                    foreach (var keyword in matchedKeywords)
                    {
                        if (program.Keywords.Contains(keyword) && !matchedProgramIds.Contains(program.Id))
                        {
                            matchedProgramIds.Add(program.Id);
                            break;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting matched program IDs");
            }
            
            return matchedProgramIds;
        }

        private int CalculateThreadScore(
            RedditThread thread, 
            List<int> matchedProgramIds, 
            string intent, 
            bool hasSerpMatch)
        {
            try
            {
                // Base score starts at 0
                double score = 0;
                
                // 1. Score based on intent (up to 20 points)
                switch (intent)
                {
                    case "DISCOVERY":
                        score += 20;
                        break;
                    case "QUESTION":
                        score += 15;
                        break;
                    case "COMPARISON":
                        score += 18;
                        break;
                    case "SHOWCASE":
                        score += 5;
                        break;
                    default:
                        score += 0;
                        break;
                }
                
                // 2. Score based on affiliate program matches (up to 25 points)
                // More matches = higher score
                int programMatches = matchedProgramIds.Count;
                score += Math.Min(programMatches * 5, 25);
                
                // 3. Score based on SERP match (up to 20 points)
                if (hasSerpMatch)
                {
                    score += 20;
                }
                
                // 4. Score based on engagement (up to 15 points)
                // Higher upvotes and comments = higher engagement
                int upvotes = thread.Upvotes;
                int commentCount = thread.CommentCount;
                
                double upvoteScore = Math.Min(upvotes / 10.0, 10.0); // Max 10 points for upvotes
                double commentScore = Math.Min(commentCount / 5.0, 5.0); // Max 5 points for comments
                
                score += upvoteScore + commentScore;
                
                // 5. Score based on recency (up to 10 points)
                // Newer posts get more points
                TimeSpan age = DateTime.UtcNow - thread.CreatedAt;
                double daysSinceCreation = age.TotalDays;
                
                if (daysSinceCreation <= 1) // Less than 1 day old
                {
                    score += 10;
                }
                else if (daysSinceCreation <= 7) // Less than 1 week old
                {
                    score += 7;
                }
                else if (daysSinceCreation <= 30) // Less than 1 month old
                {
                    score += 3;
                }
                
                // 6. Score based on keyword matches (up to 10 points)
                // More keyword matches = higher score
                int keywordMatches = thread.MatchedKeywords.Count;
                score += Math.Min(keywordMatches * 2, 10);
                
                // Ensure score stays within 0-100 range
                return (int)Math.Max(0, Math.Min(100, Math.Round(score)));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating thread score for thread ID {ThreadId}", thread.Id);
                return 0;
            }
        }

        private string DetermineAction(int score, string intent)
        {
            if (score >= 70)
            {
                return "COMMENT";
            }
            else if (score >= 40)
            {
                if (intent == "DISCOVERY" || intent == "QUESTION")
                {
                    return "MONITOR";
                }
                else
                {
                    return "REVIEW";
                }
            }
            else
            {
                return "IGNORE";
            }
        }
    }
}