-- Schema for Reddit Affiliate Opportunity Engine
-- This SQL matches the Drizzle schema defined in shared/schema.ts

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Reddit Threads
CREATE TABLE IF NOT EXISTS reddit_threads (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  subreddit TEXT NOT NULL,
  permalink TEXT NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  author TEXT NOT NULL,
  flair TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  score INTEGER NOT NULL DEFAULT 0,
  intent_type TEXT,
  serp_rank INTEGER,
  has_serp BOOLEAN NOT NULL DEFAULT FALSE,
  matched_keywords JSONB NOT NULL DEFAULT '[]'::JSONB,
  affiliate_match INTEGER NOT NULL DEFAULT 0
);

-- Affiliate Programs
CREATE TABLE IF NOT EXISTS affiliate_programs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  promo_code TEXT,
  keywords JSONB NOT NULL DEFAULT '[]'::JSONB,
  commission_rate TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Comment Templates
CREATE TABLE IF NOT EXISTS comment_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  type TEXT NOT NULL,
  affiliate_program_id INTEGER
);

-- Crawl History
CREATE TABLE IF NOT EXISTS crawl_history (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  thread_count INTEGER NOT NULL DEFAULT 0,
  subreddits JSONB NOT NULL DEFAULT '[]'::JSONB,
  status TEXT NOT NULL DEFAULT 'running',
  error TEXT
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  intent TEXT,
  matched_program_ids JSONB NOT NULL DEFAULT '[]'::JSONB,
  serp_match BOOLEAN NOT NULL DEFAULT FALSE,
  action TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- SERP Results
CREATE TABLE IF NOT EXISTS serp_results (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL,
  query TEXT NOT NULL,
  position INTEGER,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_ranked BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reddit_threads_subreddit ON reddit_threads(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_threads_score ON reddit_threads(score);
CREATE INDEX IF NOT EXISTS idx_reddit_threads_created_at ON reddit_threads(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_thread_id ON opportunities(thread_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities(score);
CREATE INDEX IF NOT EXISTS idx_serp_results_thread_id ON serp_results(thread_id);
CREATE INDEX IF NOT EXISTS idx_crawl_history_status ON crawl_history(status);