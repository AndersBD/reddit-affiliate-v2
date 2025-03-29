// Test script for the Reddit crawler with enhanced anti-detection measures
import { redditCrawlerService } from '../server/services/redditCrawlerService.ts';

async function testCrawler() {
  try {
    console.log('Starting crawler test...');
    console.log('Testing with a single subreddit...');
    
    // Test with a few tech-related subreddits
    const subreddits = ['technology', 'gadgets'];
    
    // Only fetch 2 threads per subreddit to avoid hitting rate limits
    const threadsPerSubreddit = 2;
    
    console.log(`Crawling ${subreddits.length} subreddits with ${threadsPerSubreddit} threads each...`);
    const threads = await redditCrawlerService.crawlSubreddits(subreddits, threadsPerSubreddit);
    
    console.log('Successfully crawled subreddits!');
    console.log(`Total threads retrieved: ${threads.length}`);
    
    if (threads.length > 0) {
      console.log('\nSample thread:');
      const sample = threads[0];
      console.log(`Title: ${sample.title}`);
      console.log(`Subreddit: r/${sample.subreddit}`);
      console.log(`Author: ${sample.author}`);
      console.log(`Upvotes: ${sample.upvotes}`);
      console.log(`Comments: ${sample.commentCount}`);
      console.log(`Permalink: ${sample.permalink}`);
      console.log(`Body snippet: ${sample.body.substring(0, 150)}...`);
    }
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error testing crawler:', error);
  }
}

// Run the test
testCrawler();