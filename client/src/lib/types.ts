// Type definitions for the application

// Thread filter options
export interface ThreadFilterOptions {
  subreddit?: string;
  intentType?: string;
  serpRank?: string;
  affiliateProgram?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Opportunity filter options
export interface OpportunityFilterOptions {
  threadId?: number;
  intent?: string;
  score?: number;
  scoreMin?: number;
  scoreMax?: number;
  serpMatch?: boolean;
  action?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// Reddit Thread
export interface RedditThread {
  id: number;
  title: string;
  body: string;
  subreddit: string;
  permalink: string;
  upvotes: number;
  commentCount: number;
  author: string;
  flair?: string;
  createdAt: string;
  crawledAt: string;
  score: number;
  intentType?: string;
  serpRank?: number;
  hasSerp: boolean;
  matchedKeywords: string[];
  affiliateMatch: number;
}

// Affiliate Program
export interface AffiliateProgram {
  id: number;
  name: string;
  description: string;
  link: string;
  promoCode?: string;
  keywords: string[];
  commissionRate?: string;
  active: boolean;
}

// Comment Template
export interface CommentTemplate {
  id: number;
  name: string;
  template: string;
  type: string;
  affiliateProgramId?: number;
}

// Crawl History
export interface CrawlHistory {
  id: number;
  startedAt: string;
  completedAt?: string;
  threadCount: number;
  subreddits: string[];
  status: string;
  error?: string;
}

// Opportunity
export interface Opportunity {
  id: number;
  threadId: number;
  score: number;
  intent?: string;
  matchedProgramIds: number[];
  serpMatch: boolean;
  action?: string;
  createdAt: string;
  updatedAt: string;
}

// SERP Result
export interface SerpResult {
  id: number;
  threadId: number;
  query: string;
  position?: number;
  checkedAt: string;
  isRanked: boolean;
}

// Stats Summary
export interface StatsSummary {
  totalOpportunities: number;
  highIntentCount: number;
  serpRankedCount: number;
  opportunitiesBySubreddit: Record<string, number>;
  opportunitiesByIntent: Record<string, number>;
  opportunitiesByAffiliateProgram: Record<string, number>;
}

// Generated Comment
export interface GeneratedComment {
  id?: number; 
  threadId: number;
  affiliateProgramId: number;
  templateId: number;
  comment: string;
  createdAt?: string;
}