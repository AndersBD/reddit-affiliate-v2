import cron from 'node-cron';
import { storage } from './storage';
import { getAllSubreddits } from './subredditList';
import { log } from './vite';

// Holds the cron job instance
let crawlerJob: cron.ScheduledTask | null = null;
// Flag to track if the job is currently running
let isRunning = false;

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
 * Run the crawler on all standard subreddits
 */
async function runCrawler(): Promise<void> {
  try {
    const subreddits = getAllSubreddits();
    log(`Starting scheduled crawler run on ${subreddits.length} subreddits...`, 'scheduler');
    
    const result = await storage.runCrawler(subreddits);
    log(`Scheduled crawler started with ID: ${result.id}`, 'scheduler');
    
    // After the mock delay, the storage.runCrawler implementation will update the status
  } catch (error) {
    log(`Error running scheduled crawler: ${error}`, 'scheduler');
  }
}

// Export the functions as a crawler scheduler API
export const crawlerScheduler = {
  startCrawlerJob,
  runCrawlerNow,
  stopCrawlerJob,
  isCrawlerJobRunning
};