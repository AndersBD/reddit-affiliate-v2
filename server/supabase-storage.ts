import { IStorage, ThreadFilterOptions, OpportunityFilterOptions } from './storage';
import { supabaseClient } from './supabase-client';
import { log } from './vite';
import {
  User, InsertUser,
  RedditThread, InsertRedditThread,
  AffiliateProgram, InsertAffiliateProgram,
  CommentTemplate, InsertCommentTemplate,
  CrawlHistory, InsertCrawlHistory,
  Opportunity, InsertOpportunity,
  SerpResult, InsertSerpResult
} from '../shared/schema';
import { getAllSubreddits } from './subredditList';

export class SupabaseStorage implements IStorage {
  /**
   * User operations
   */
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      log(`Error fetching user: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      log(`Error fetching user by username: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as User;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabaseClient
      .from('users')
      .insert(user)
      .select('*')
      .single();
    
    if (error) {
      log(`Error creating user: ${error.message}`, 'supabase');
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    return data as User;
  }

  /**
   * Reddit threads operations
   */
  async getThreads(options: ThreadFilterOptions = {}): Promise<RedditThread[]> {
    let query = supabaseClient
      .from('reddit_threads')
      .select('*');
    
    // Apply filters
    if (options.subreddit) {
      query = query.eq('subreddit', options.subreddit);
    }
    
    if (options.intentType) {
      query = query.eq('intent_type', options.intentType);
    }
    
    if (options.serpRank) {
      const serpRankValue = parseInt(options.serpRank);
      if (!isNaN(serpRankValue)) {
        query = query.eq('serp_rank', serpRankValue);
      }
    }
    
    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,body.ilike.%${options.search}%`);
    }
    
    // Apply sorting
    if (options.sortBy) {
      const direction = options.sortDirection || 'desc';
      query = query.order(options.sortBy, { ascending: direction === 'asc' });
    } else {
      // Default sort by score descending
      query = query.order('score', { ascending: false });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      log(`Error fetching threads: ${error.message}`, 'supabase');
      return [];
    }
    
    return data as RedditThread[];
  }

  async getThreadById(id: number): Promise<RedditThread | undefined> {
    const { data, error } = await supabaseClient
      .from('reddit_threads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      log(`Error fetching thread: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as RedditThread;
  }

  async createThread(thread: InsertRedditThread): Promise<RedditThread> {
    const { data, error } = await supabaseClient
      .from('reddit_threads')
      .insert(thread)
      .select('*')
      .single();
    
    if (error) {
      log(`Error creating thread: ${error.message}`, 'supabase');
      throw new Error(`Failed to create thread: ${error.message}`);
    }
    
    return data as RedditThread;
  }

  async updateThread(id: number, thread: Partial<InsertRedditThread>): Promise<RedditThread | undefined> {
    const { data, error } = await supabaseClient
      .from('reddit_threads')
      .update(thread)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      log(`Error updating thread: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as RedditThread;
  }

  async deleteThread(id: number): Promise<boolean> {
    const { error } = await supabaseClient
      .from('reddit_threads')
      .delete()
      .eq('id', id);
    
    if (error) {
      log(`Error deleting thread: ${error.message}`, 'supabase');
      return false;
    }
    
    return true;
  }

  /**
   * Affiliate programs operations
   */
  async getAffiliatePrograms(): Promise<AffiliateProgram[]> {
    const { data, error } = await supabaseClient
      .from('affiliate_programs')
      .select('*')
      .order('name');
    
    if (error) {
      log(`Error fetching affiliate programs: ${error.message}`, 'supabase');
      return [];
    }
    
    return data as AffiliateProgram[];
  }

  async getAffiliateProgramById(id: number): Promise<AffiliateProgram | undefined> {
    const { data, error } = await supabaseClient
      .from('affiliate_programs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      log(`Error fetching affiliate program: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as AffiliateProgram;
  }

  async createAffiliateProgram(program: InsertAffiliateProgram): Promise<AffiliateProgram> {
    const { data, error } = await supabaseClient
      .from('affiliate_programs')
      .insert(program)
      .select('*')
      .single();
    
    if (error) {
      log(`Error creating affiliate program: ${error.message}`, 'supabase');
      throw new Error(`Failed to create affiliate program: ${error.message}`);
    }
    
    return data as AffiliateProgram;
  }

  async updateAffiliateProgram(id: number, program: Partial<InsertAffiliateProgram>): Promise<AffiliateProgram | undefined> {
    const { data, error } = await supabaseClient
      .from('affiliate_programs')
      .update(program)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      log(`Error updating affiliate program: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as AffiliateProgram;
  }

  async deleteAffiliateProgram(id: number): Promise<boolean> {
    const { error } = await supabaseClient
      .from('affiliate_programs')
      .delete()
      .eq('id', id);
    
    if (error) {
      log(`Error deleting affiliate program: ${error.message}`, 'supabase');
      return false;
    }
    
    return true;
  }

  /**
   * Comment templates operations
   */
  async getCommentTemplates(): Promise<CommentTemplate[]> {
    const { data, error } = await supabaseClient
      .from('comment_templates')
      .select('*')
      .order('name');
    
    if (error) {
      log(`Error fetching comment templates: ${error.message}`, 'supabase');
      return [];
    }
    
    return data as CommentTemplate[];
  }

  async getCommentTemplateById(id: number): Promise<CommentTemplate | undefined> {
    const { data, error } = await supabaseClient
      .from('comment_templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      log(`Error fetching comment template: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as CommentTemplate;
  }

  async getCommentTemplatesByType(type: string): Promise<CommentTemplate[]> {
    const { data, error } = await supabaseClient
      .from('comment_templates')
      .select('*')
      .eq('type', type)
      .order('name');
    
    if (error) {
      log(`Error fetching comment templates by type: ${error.message}`, 'supabase');
      return [];
    }
    
    return data as CommentTemplate[];
  }

  async createCommentTemplate(template: InsertCommentTemplate): Promise<CommentTemplate> {
    const { data, error } = await supabaseClient
      .from('comment_templates')
      .insert(template)
      .select('*')
      .single();
    
    if (error) {
      log(`Error creating comment template: ${error.message}`, 'supabase');
      throw new Error(`Failed to create comment template: ${error.message}`);
    }
    
    return data as CommentTemplate;
  }

  async updateCommentTemplate(id: number, template: Partial<InsertCommentTemplate>): Promise<CommentTemplate | undefined> {
    const { data, error } = await supabaseClient
      .from('comment_templates')
      .update(template)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      log(`Error updating comment template: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as CommentTemplate;
  }

  async deleteCommentTemplate(id: number): Promise<boolean> {
    const { error } = await supabaseClient
      .from('comment_templates')
      .delete()
      .eq('id', id);
    
    if (error) {
      log(`Error deleting comment template: ${error.message}`, 'supabase');
      return false;
    }
    
    return true;
  }

  /**
   * Crawl history operations
   */
  async getCrawlHistory(): Promise<CrawlHistory[]> {
    const { data, error } = await supabaseClient
      .from('crawl_history')
      .select('*')
      .order('started_at', { ascending: false });
    
    if (error) {
      log(`Error fetching crawl history: ${error.message}`, 'supabase');
      return [];
    }
    
    return data as CrawlHistory[];
  }

  async getCrawlHistoryById(id: number): Promise<CrawlHistory | undefined> {
    const { data, error } = await supabaseClient
      .from('crawl_history')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      log(`Error fetching crawl history: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as CrawlHistory;
  }

  async createCrawlHistory(history: InsertCrawlHistory): Promise<CrawlHistory> {
    const { data, error } = await supabaseClient
      .from('crawl_history')
      .insert(history)
      .select('*')
      .single();
    
    if (error) {
      log(`Error creating crawl history: ${error.message}`, 'supabase');
      throw new Error(`Failed to create crawl history: ${error.message}`);
    }
    
    return data as CrawlHistory;
  }

  async updateCrawlHistory(id: number, history: Partial<InsertCrawlHistory>): Promise<CrawlHistory | undefined> {
    const { data, error } = await supabaseClient
      .from('crawl_history')
      .update(history)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      log(`Error updating crawl history: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as CrawlHistory;
  }

  /**
   * Opportunities operations
   */
  async getOpportunities(options: OpportunityFilterOptions = {}): Promise<Opportunity[]> {
    let query = supabaseClient
      .from('opportunities')
      .select('*');
    
    // Apply filters
    if (options.threadId) {
      query = query.eq('thread_id', options.threadId);
    }
    
    if (options.intent) {
      query = query.eq('intent', options.intent);
    }
    
    if (options.score) {
      query = query.eq('score', options.score);
    }
    
    if (options.scoreMin) {
      query = query.gte('score', options.scoreMin);
    }
    
    if (options.scoreMax) {
      query = query.lte('score', options.scoreMax);
    }
    
    if (options.serpMatch !== undefined) {
      query = query.eq('serp_match', options.serpMatch);
    }
    
    if (options.action) {
      query = query.eq('action', options.action);
    }
    
    // Apply sorting
    if (options.sortBy) {
      const direction = options.sortDirection || 'desc';
      query = query.order(options.sortBy, { ascending: direction === 'asc' });
    } else {
      // Default sort by score descending
      query = query.order('score', { ascending: false });
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
    }
    
    const { data, error } = await query;
    
    if (error) {
      log(`Error fetching opportunities: ${error.message}`, 'supabase');
      return [];
    }
    
    return data as Opportunity[];
  }

  async getOpportunityById(id: number): Promise<Opportunity | undefined> {
    const { data, error } = await supabaseClient
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      log(`Error fetching opportunity: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as Opportunity;
  }

  async getOpportunitiesByThreadId(threadId: number): Promise<Opportunity[]> {
    const { data, error } = await supabaseClient
      .from('opportunities')
      .select('*')
      .eq('thread_id', threadId)
      .order('score', { ascending: false });
    
    if (error) {
      log(`Error fetching opportunities by thread ID: ${error.message}`, 'supabase');
      return [];
    }
    
    return data as Opportunity[];
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const { data, error } = await supabaseClient
      .from('opportunities')
      .insert(opportunity)
      .select('*')
      .single();
    
    if (error) {
      log(`Error creating opportunity: ${error.message}`, 'supabase');
      throw new Error(`Failed to create opportunity: ${error.message}`);
    }
    
    return data as Opportunity;
  }

  async updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const { data, error } = await supabaseClient
      .from('opportunities')
      .update(opportunity)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      log(`Error updating opportunity: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as Opportunity;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    const { error } = await supabaseClient
      .from('opportunities')
      .delete()
      .eq('id', id);
    
    if (error) {
      log(`Error deleting opportunity: ${error.message}`, 'supabase');
      return false;
    }
    
    return true;
  }

  /**
   * SERP Results operations
   */
  async getSerpResults(): Promise<SerpResult[]> {
    const { data, error } = await supabaseClient
      .from('serp_results')
      .select('*')
      .order('checked_at', { ascending: false });
    
    if (error) {
      log(`Error fetching SERP results: ${error.message}`, 'supabase');
      return [];
    }
    
    return data as SerpResult[];
  }

  async getSerpResultById(id: number): Promise<SerpResult | undefined> {
    const { data, error } = await supabaseClient
      .from('serp_results')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      log(`Error fetching SERP result: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as SerpResult;
  }

  async getSerpResultsByThreadId(threadId: number): Promise<SerpResult[]> {
    const { data, error } = await supabaseClient
      .from('serp_results')
      .select('*')
      .eq('thread_id', threadId)
      .order('checked_at', { ascending: false });
    
    if (error) {
      log(`Error fetching SERP results by thread ID: ${error.message}`, 'supabase');
      return [];
    }
    
    return data as SerpResult[];
  }

  async createSerpResult(serpResult: InsertSerpResult): Promise<SerpResult> {
    const { data, error } = await supabaseClient
      .from('serp_results')
      .insert(serpResult)
      .select('*')
      .single();
    
    if (error) {
      log(`Error creating SERP result: ${error.message}`, 'supabase');
      throw new Error(`Failed to create SERP result: ${error.message}`);
    }
    
    return data as SerpResult;
  }

  async updateSerpResult(id: number, serpResult: Partial<InsertSerpResult>): Promise<SerpResult | undefined> {
    const { data, error } = await supabaseClient
      .from('serp_results')
      .update(serpResult)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) {
      log(`Error updating SERP result: ${error.message}`, 'supabase');
      return undefined;
    }
    
    return data as SerpResult;
  }

  async deleteSerpResult(id: number): Promise<boolean> {
    const { error } = await supabaseClient
      .from('serp_results')
      .delete()
      .eq('id', id);
    
    if (error) {
      log(`Error deleting SERP result: ${error.message}`, 'supabase');
      return false;
    }
    
    return true;
  }

  /**
   * Run crawler
   */
  async runCrawler(subreddits: string[]): Promise<CrawlHistory> {
    // Use the provided subreddits or get all standard subreddits
    const subredditList = subreddits.length > 0 ? subreddits : getAllSubreddits();
    
    // Create a new crawl history entry
    const crawlHistory = await this.createCrawlHistory({
      subreddits: subredditList,
      status: 'running',
    });
    
    // This is a mock implementation - in a real app, this would trigger the actual crawler
    // We'll simulate a successful crawl with some random thread counts
    const threadCount = Math.floor(Math.random() * 50) + 10;
    
    // Update the crawl history with completed status and thread count
    const updatedCrawlHistory = await this.updateCrawlHistory(crawlHistory.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      threadCount: threadCount,
    });
    
    return updatedCrawlHistory || crawlHistory;
  }

  /**
   * Refresh opportunities
   */
  async refreshOpportunities(): Promise<number> {
    // In a real implementation, this would calculate scores for all threads
    // and create/update opportunity records
    
    // For now, we'll log that this was attempted with Supabase integration
    log('Refreshing opportunities with Supabase integration', 'supabase');
    
    // Return a random count of updated opportunities
    return Math.floor(Math.random() * 30) + 5;
  }

  /**
   * Utility methods for Supabase implementation
   */
  
  private classifyThreadIntent(thread: RedditThread): string {
    // Implementation would be similar to the MemStorage version
    // For brevity, this is a simplified version
    
    const title = thread.title.toLowerCase();
    const body = thread.body.toLowerCase();
    const combined = `${title} ${body}`;
    
    if (combined.includes('vs') || combined.includes('versus') || combined.includes('compared')) {
      return 'COMPARISON';
    } else if (combined.includes('review') || combined.includes('experience')) {
      return 'REVIEW';
    } else if (combined.includes('?') || combined.includes('recommended') || combined.includes('suggest')) {
      return 'QUESTION';
    } else if (combined.includes('find') || combined.includes('looking for')) {
      return 'DISCOVERY';
    } else {
      return 'DISCUSSION';
    }
  }
  
  private findMatchingKeywords(thread: RedditThread, affiliatePrograms: AffiliateProgram[]): string[] {
    const matchedKeywords: string[] = [];
    const content = `${thread.title.toLowerCase()} ${thread.body.toLowerCase()}`;
    
    for (const program of affiliatePrograms) {
      const keywords = program.keywords as string[];
      for (const keyword of keywords) {
        if (content.includes(keyword.toLowerCase()) && !matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }
    }
    
    return matchedKeywords;
  }
  
  private calculateThreadScore(
    thread: RedditThread, 
    matchedProgramIds: number[],
    intent: string,
    hasSerpMatch: boolean,
  ): number {
    // Base score starts at 20
    let score = 20;
    
    // Add points for high upvotes (max 20 points)
    score += Math.min(thread.upvotes / 50, 20);
    
    // Add points for lots of comments (max 15 points)
    score += Math.min(thread.commentCount / 20, 15);
    
    // Add points for each matched affiliate program (max 20 points)
    score += Math.min(matchedProgramIds.length * 5, 20);
    
    // Add points for intent type
    switch (intent) {
      case 'QUESTION':
        score += 20;
        break;
      case 'COMPARISON':
        score += 15;
        break;
      case 'REVIEW':
        score += 10;
        break;
      case 'DISCOVERY':
        score += 10;
        break;
      default:
        score += 5;
    }
    
    // Add points for SERP match
    if (hasSerpMatch) {
      score += 15;
    }
    
    // Make sure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}