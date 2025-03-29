import cron from 'node-cron';
import { storage } from './storage';
import { getAllSubreddits } from './subredditList';
import { log } from './vite';
import DotNetCrawlerService from './services/dotnetCrawlerService';

// Holds the cron job instance
let crawlerJob: cron.ScheduledTask | null = null;
// Flag to track if the job is currently running
let isRunning = false;
// Flag to track if an individual crawler run is in progress
let isCrawlInProgress = false;

/**
 * Start the crawler job to run every 12 hours
 */
function startCrawlerJob(): boolean {
  if (isRunning) {
    log('Crawler job is already running', 'scheduler');
    return false;
  }

  // Schedule job to run every 12 hours (at minute 0, every 12 hours)
  crawlerJob = cron.schedule("0 */12 * * *", async () => {
    await runCrawler();
  });

  isRunning = true;
  log('Crawler job scheduled to run every 12 hours', 'scheduler');
  return true;
}

/**
 * Run the crawler immediately
 */
async function runCrawlerNow(): Promise<void> {
  if (isCrawlInProgress) {
    log('A crawler run is already in progress', 'scheduler');
    return;
  }
  await runCrawler();
}

/**
 * Stop the crawler job
 */
function stopCrawlerJob(): boolean {
  if (!isRunning || !crawlerJob) {
    log('No crawler job is running', 'scheduler');
    return false;
  }

  crawlerJob.stop();
  isRunning = false;
  log('Crawler job stopped', 'scheduler');
  return true;
}

/**
 * Check if the crawler job is running
 */
function isCrawlerJobRunning(): boolean {
  return isRunning;
}

/**
 * Check if a crawler run is currently in progress
 */
function isCrawlerRunInProgress(): boolean {
  return isCrawlInProgress;
}

/**
 * Run the crawler on all standard subreddits
 */
async function runCrawler(): Promise<void> {
  if (isCrawlInProgress) {
    log('A crawler run is already in progress, skipping', 'scheduler');
    return;
  }
  
  isCrawlInProgress = true;
  
  try {
    const subreddits = getAllSubreddits();
    log(`Starting scheduled crawler run on ${subreddits.length} subreddits...`, 'scheduler');
    
    // Use the DotNetCrawlerService which will eventually call the .NET API
    const result = await DotNetCrawlerService.runCrawler(subreddits);
    
    // If result has an id property (from the storage implementation)
    const resultId = (result as any).id || 'unknown';
    log(`Scheduled crawler completed with ID: ${resultId}`, 'scheduler');
    
  } catch (error) {
    log(`Error running scheduled crawler: ${error}`, 'scheduler');
  } finally {
    isCrawlInProgress = false;
  }
}

// Export the functions as a crawler scheduler API
export const crawlerScheduler = {
  startCrawlerJob,
  runCrawlerNow,
  stopCrawlerJob,
  isCrawlerJobRunning,
  isCrawlerRunInProgress
};