using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using RedditAffiliateEngine.Models;

namespace RedditAffiliateEngine.Services
{
    public enum IntentType
    {
        DISCOVERY,
        COMPARISON,
        QUESTION,
        SHOWCASE,
        UNKNOWN
    }

    public class IntentClassifier : IIntentClassifier
    {
        private readonly ILogger<IntentClassifier> _logger;
        
        // Keywords associated with each intent type
        private readonly Dictionary<IntentType, List<string>> _intentKeywords = new Dictionary<IntentType, List<string>>
        {
            { 
                IntentType.DISCOVERY, 
                new List<string> { 
                    "recommend", "looking for", "suggest", "alternative", "best", "top", "any recommendations",
                    "options", "discover", "find", "what's good", "help me find", "advice on", "seeking"
                } 
            },
            { 
                IntentType.COMPARISON, 
                new List<string> { 
                    "vs", "versus", "compare", "or", "better than", "difference between", "comparison",
                    "which is better", "pros and cons", "advantages"
                } 
            },
            { 
                IntentType.QUESTION, 
                new List<string> { 
                    "how do i", "how to", "what is", "why does", "can anyone", "help with", "worth it",
                    "should i", "does anyone", "has anyone", "how can", "experience with"
                } 
            },
            { 
                IntentType.SHOWCASE, 
                new List<string> { 
                    "just finished", "i made", "check out", "sharing", "created", "my project", 
                    "showcase", "look what", "i built", "portfolio", "my work"
                } 
            }
        };

        public IntentClassifier(ILogger<IntentClassifier> logger)
        {
            _logger = logger;
        }

        public IntentType ClassifyIntent(RedditThread thread)
        {
            string title = thread.Title.ToLower();
            string body = thread.Body.ToLower();
            
            try
            {
                // Check for question marks in title (strong indicator of QUESTION intent)
                if (title.Contains("?"))
                {
                    return IntentType.QUESTION;
                }
                
                // Check for comparison indicators in title
                if (Regex.IsMatch(title, @"\bvs\.?\b|\bor\b|\bversus\b") || title.Contains(" or "))
                {
                    return IntentType.COMPARISON;
                }
                
                // Check for showcase indicators
                if ((thread.Flair != null && (thread.Flair.ToLower().Contains("showcase") || 
                                             thread.Flair.ToLower().Contains("project"))) ||
                    title.StartsWith("i made") || title.StartsWith("i built") || 
                    title.StartsWith("check out my") || title.StartsWith("just launched"))
                {
                    return IntentType.SHOWCASE;
                }
                
                // Score each intent type based on keyword matches
                var scores = new Dictionary<IntentType, int>
                {
                    { IntentType.DISCOVERY, 0 },
                    { IntentType.COMPARISON, 0 },
                    { IntentType.QUESTION, 0 },
                    { IntentType.SHOWCASE, 0 }
                };
                
                // Calculate scores based on keyword matches
                foreach (var intentType in _intentKeywords.Keys)
                {
                    foreach (var keyword in _intentKeywords[intentType])
                    {
                        // Higher weight for matches in title
                        if (title.Contains(keyword))
                        {
                            scores[intentType] += 2;
                        }
                        
                        // Lower weight for matches in body
                        if (body.Contains(keyword))
                        {
                            scores[intentType] += 1;
                        }
                    }
                }
                
                // Find the intent with the highest score
                IntentType highestScoringIntent = IntentType.UNKNOWN;
                int highestScore = 0;
                
                foreach (var intent in scores.Keys)
                {
                    if (scores[intent] > highestScore)
                    {
                        highestScore = scores[intent];
                        highestScoringIntent = intent;
                    }
                }
                
                // If we have a clear winner with a score > 0, return it
                if (highestScore > 0)
                {
                    return highestScoringIntent;
                }
                
                // Default to DISCOVERY if nothing else matches
                return IntentType.DISCOVERY;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error classifying intent for thread {ThreadId}", thread.Id);
                return IntentType.UNKNOWN;
            }
        }

        public string ClassifyIntentAsString(RedditThread thread)
        {
            return ClassifyIntent(thread).ToString();
        }
    }
}