using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using RedditAffiliateEngine.Crawler;
using RedditAffiliateEngine.Models;
using RedditAffiliateEngine.Repositories;

namespace RedditAffiliateEngine.Services
{
    public class RedditCrawlerService : IRedditCrawlerService
    {
        private readonly IRedditCrawler _redditCrawler;
        private readonly IRedditThreadRepository _threadRepository;
        private readonly ICrawlHistoryRepository _crawlHistoryRepository;
        private readonly ILogger<RedditCrawlerService> _logger;
        
        // Default subreddits to crawl if none are specified
        private readonly List<string> _defaultSubreddits = new List<string>
        {
            "homeimprovement", "BuyItForLife", "malefashionadvice", "femalefashionadvice", 
            "Fitness", "buildapc", "techsupport", "gadgets", "photography", "videography",
            "HomeAutomation", "headphones", "audiophile", "travel", "backpacking", 
            "camping", "CampingGear", "hiking", "MealPrepSunday", "Cooking", "booksuggestions",
            "suggestmeabook", "pcmasterrace", "gamingsuggestions", "ShouldIbuythisgame",
            "SkincareAddiction", "MakeupAddiction", "gardening", "houseplants", "Coffee",
            "snowboarding", "skiing", "bicycling", "running", "Golf", "boardgames", 
            "supplements", "yoga", "MechanicalKeyboards", "personalfinance", "Frugal"
        };

        public RedditCrawlerService(
            IRedditCrawler redditCrawler,
            IRedditThreadRepository threadRepository,
            ICrawlHistoryRepository crawlHistoryRepository,
            ILogger<RedditCrawlerService> logger)
        {
            _redditCrawler = redditCrawler;
            _threadRepository = threadRepository;
            _crawlHistoryRepository = crawlHistoryRepository;
            _logger = logger;
        }

        public async Task<CrawlHistory> RunCrawlerAsync(List<string>? subreddits = null, CancellationToken cancellationToken = default)
        {
            if (subreddits == null || !subreddits.Any())
            {
                subreddits = _defaultSubreddits;
            }
            
            var crawlHistoryDto = new CreateCrawlHistoryDto
            {
                StartedAt = DateTime.UtcNow,
                Subreddits = subreddits,
                Status = "IN_PROGRESS"
            };
            
            var crawlHistory = await _crawlHistoryRepository.CreateAsync(crawlHistoryDto);
            
            int threadsDiscovered = 0;
            int threadsSaved = 0;
            
            try
            {
                foreach (var subreddit in subreddits)
                {
                    try
                    {
                        _logger.LogInformation($"Crawling subreddit: {subreddit}");
                        
                        // Get threads from the subreddit
                        var threads = await _redditCrawler.CrawlSubredditAsync(
                            subreddit, 
                            RedditSortType.Hot, 
                            25, 
                            cancellationToken);
                        
                        threadsDiscovered += threads.Count();
                        
                        foreach (var threadDto in threads)
                        {
                            try
                            {
                                // Check if thread already exists
                                var existingThread = await _threadRepository.GetByPermalinkAsync(threadDto.Permalink);
                                
                                if (existingThread == null)
                                {
                                    // If it's a new thread, get full details
                                    var fullThreadDto = await _redditCrawler.GetThreadDetailsAsync(threadDto.Permalink, cancellationToken);
                                    
                                    if (fullThreadDto != null)
                                    {
                                        await _threadRepository.CreateAsync(fullThreadDto);
                                        threadsSaved++;
                                        
                                        // Prevent rate limiting
                                        await Task.Delay(1000, cancellationToken);
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, $"Error processing thread from {subreddit}");
                            }
                        }
                        
                        // Delay between subreddits to avoid rate limiting
                        await Task.Delay(2000, cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, $"Error crawling subreddit: {subreddit}");
                    }
                }
                
                // Update the crawl history with success status
                var updateDto = new UpdateCrawlHistoryDto
                {
                    CompletedAt = DateTime.UtcNow,
                    ThreadsDiscovered = threadsDiscovered,
                    ThreadsSaved = threadsSaved,
                    Status = "COMPLETED"
                };
                
                await _crawlHistoryRepository.UpdateAsync(crawlHistory.Id, updateDto);
                
                // Get the updated crawl history
                var updatedCrawlHistory = await _crawlHistoryRepository.GetByIdAsync(crawlHistory.Id);
                return updatedCrawlHistory ?? crawlHistory;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running crawler");
                
                // Update the crawl history with error status
                var updateDto = new UpdateCrawlHistoryDto
                {
                    CompletedAt = DateTime.UtcNow,
                    ThreadsDiscovered = threadsDiscovered,
                    ThreadsSaved = threadsSaved,
                    Status = "ERROR",
                    Error = ex.Message
                };
                
                await _crawlHistoryRepository.UpdateAsync(crawlHistory.Id, updateDto);
                
                // Get the updated crawl history
                var updatedCrawlHistory = await _crawlHistoryRepository.GetByIdAsync(crawlHistory.Id);
                return updatedCrawlHistory ?? crawlHistory;
            }
        }
    }
}