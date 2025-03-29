// Types for Reddit Threads
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

// Types for Affiliate Programs
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

// Types for Comment Templates
export interface CommentTemplate {
  id: number;
  name: string;
  template: string;
  type: string;
  affiliateProgramId: number | null;
}

// Types for Crawl History
export interface CrawlHistory {
  id: number;
  startedAt: string;
  completedAt: string | null;
  threadCount: number;
  subreddits: string[];
  status: 'running' | 'completed' | 'failed';
  error?: string;
}

// Types for Thread Filtering
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

// Types for Comment Generation
export interface GenerateCommentRequest {
  threadId: number;
  affiliateProgramId: number;
  templateId: number;
}

export interface GenerateCommentResponse {
  comment: string;
}
