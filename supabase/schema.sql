-- Supabase schema for Reddit Affiliate Opportunity Engine

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for future auth)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Reddit threads table
CREATE TABLE IF NOT EXISTS reddit_threads (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  subreddit TEXT NOT NULL,
  permalink TEXT NOT NULL UNIQUE,
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
  matched_keywords JSONB NOT NULL DEFAULT '[]',
  affiliate_match INTEGER NOT NULL DEFAULT 0
);

-- Create index on subreddit and permalink for faster lookup
CREATE INDEX IF NOT EXISTS idx_reddit_threads_subreddit ON reddit_threads(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_threads_permalink ON reddit_threads(permalink);
CREATE INDEX IF NOT EXISTS idx_reddit_threads_score ON reddit_threads(score DESC);

-- Affiliate programs table
CREATE TABLE IF NOT EXISTS affiliate_programs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  link TEXT NOT NULL,
  promo_code TEXT,
  keywords JSONB NOT NULL DEFAULT '[]',
  commission_rate TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Comment templates table
CREATE TABLE IF NOT EXISTS comment_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  template TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g., "DISCOVERY", "COMPARISON", "QUESTION", "REVIEW"
  affiliate_program_id INTEGER REFERENCES affiliate_programs(id) ON DELETE SET NULL
);

-- Crawl history table
CREATE TABLE IF NOT EXISTS crawl_history (
  id SERIAL PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  thread_count INTEGER NOT NULL DEFAULT 0,
  subreddits JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'running', -- "running", "completed", "failed"
  error TEXT
);

-- Opportunities table (new)
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES reddit_threads(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  intent TEXT,
  matched_program_ids JSONB NOT NULL DEFAULT '[]',
  serp_match BOOLEAN NOT NULL DEFAULT FALSE,
  action TEXT, -- e.g., "replied", "pending", "ignored"
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index for faster lookup of top opportunities
CREATE INDEX IF NOT EXISTS idx_opportunities_score ON opportunities(score DESC);
CREATE INDEX IF NOT EXISTS idx_opportunities_thread_id ON opportunities(thread_id);

-- SERP results table (new)
CREATE TABLE IF NOT EXISTS serp_results (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER NOT NULL REFERENCES reddit_threads(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  position INTEGER,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_ranked BOOLEAN NOT NULL DEFAULT FALSE
);

-- Create index on thread_id for SERP results
CREATE INDEX IF NOT EXISTS idx_serp_results_thread_id ON serp_results(thread_id);

-- Function to update 'updated_at' column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update 'updated_at' on opportunities table
CREATE TRIGGER update_opportunities_updated_at
BEFORE UPDATE ON opportunities
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (to be implemented with auth)
-- For now, all tables are accessible without auth for the MVP