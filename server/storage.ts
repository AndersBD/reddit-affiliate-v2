import { 
  users, type User, type InsertUser,
  redditThreads, type RedditThread, type InsertRedditThread,
  affiliatePrograms, type AffiliateProgram, type InsertAffiliateProgram,
  commentTemplates, type CommentTemplate, type InsertCommentTemplate,
  crawlHistory, type CrawlHistory, type InsertCrawlHistory,
  opportunities, type Opportunity, type InsertOpportunity,
  serpResults, type SerpResult, type InsertSerpResult
} from "@shared/schema";
import { redditCrawlerService } from "./services/redditCrawlerService";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Reddit threads operations
  getThreads(options?: ThreadFilterOptions): Promise<RedditThread[]>;
  getThreadById(id: number): Promise<RedditThread | undefined>;
  createThread(thread: InsertRedditThread): Promise<RedditThread>;
  updateThread(id: number, thread: Partial<InsertRedditThread>): Promise<RedditThread | undefined>;
  deleteThread(id: number): Promise<boolean>;
  
  // Affiliate programs operations
  getAffiliatePrograms(): Promise<AffiliateProgram[]>;
  getAffiliateProgramById(id: number): Promise<AffiliateProgram | undefined>;
  createAffiliateProgram(program: InsertAffiliateProgram): Promise<AffiliateProgram>;
  updateAffiliateProgram(id: number, program: Partial<InsertAffiliateProgram>): Promise<AffiliateProgram | undefined>;
  deleteAffiliateProgram(id: number): Promise<boolean>;
  
  // Comment templates operations
  getCommentTemplates(): Promise<CommentTemplate[]>;
  getCommentTemplateById(id: number): Promise<CommentTemplate | undefined>;
  getCommentTemplatesByType(type: string): Promise<CommentTemplate[]>;
  createCommentTemplate(template: InsertCommentTemplate): Promise<CommentTemplate>;
  updateCommentTemplate(id: number, template: Partial<InsertCommentTemplate>): Promise<CommentTemplate | undefined>;
  deleteCommentTemplate(id: number): Promise<boolean>;
  
  // Crawl history operations
  getCrawlHistory(): Promise<CrawlHistory[]>;
  getCrawlHistoryById(id: number): Promise<CrawlHistory | undefined>;
  createCrawlHistory(history: InsertCrawlHistory): Promise<CrawlHistory>;
  updateCrawlHistory(id: number, history: Partial<InsertCrawlHistory>): Promise<CrawlHistory | undefined>;
  
  // Opportunities operations
  getOpportunities(options?: OpportunityFilterOptions): Promise<Opportunity[]>;
  getOpportunityById(id: number): Promise<Opportunity | undefined>;
  getOpportunitiesByThreadId(threadId: number): Promise<Opportunity[]>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined>;
  deleteOpportunity(id: number): Promise<boolean>;
  
  // SERP Results operations
  getSerpResults(): Promise<SerpResult[]>;
  getSerpResultById(id: number): Promise<SerpResult | undefined>;
  getSerpResultsByThreadId(threadId: number): Promise<SerpResult[]>;
  createSerpResult(serpResult: InsertSerpResult): Promise<SerpResult>;
  updateSerpResult(id: number, serpResult: Partial<InsertSerpResult>): Promise<SerpResult | undefined>;
  deleteSerpResult(id: number): Promise<boolean>;
  
  // Trigger a crawler run
  runCrawler(subreddits: string[]): Promise<CrawlHistory>;
  
  // Refresh opportunities (analyze and score threads)
  refreshOpportunities(): Promise<number>;
}

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private redditThreads: Map<number, RedditThread>;
  private affiliatePrograms: Map<number, AffiliateProgram>;
  private commentTemplates: Map<number, CommentTemplate>;
  private crawlHistory: Map<number, CrawlHistory>;
  private opportunities: Map<number, Opportunity>;
  private serpResults: Map<number, SerpResult>;
  
  currentUserId: number;
  currentThreadId: number;
  currentAffiliateProgramId: number;
  currentCommentTemplateId: number;
  currentCrawlHistoryId: number;
  currentOpportunityId: number;
  currentSerpResultId: number;

  constructor() {
    this.users = new Map();
    this.redditThreads = new Map();
    this.affiliatePrograms = new Map();
    this.commentTemplates = new Map();
    this.crawlHistory = new Map();
    this.opportunities = new Map();
    this.serpResults = new Map();
    
    this.currentUserId = 1;
    this.currentThreadId = 1;
    this.currentAffiliateProgramId = 1;
    this.currentCommentTemplateId = 1;
    this.currentCrawlHistoryId = 1;
    this.currentOpportunityId = 1;
    this.currentSerpResultId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add sample affiliate programs
    const affiliatePrograms = [
      { 
        name: "Jasper AI", 
        description: "AI writing assistant for creating content", 
        link: "https://jasper.ai/?aff=123", 
        promoCode: "REDDIT20", 
        keywords: ["AI writer", "content creation", "blog writing", "Jasper", "AI writing"], 
        commissionRate: "30%",
        active: true
      },
      { 
        name: "Copy.ai", 
        description: "AI copywriting tool for marketers", 
        link: "https://copy.ai/?via=123", 
        promoCode: "REDDIT15", 
        keywords: ["copywriting", "marketing copy", "AI copywriter", "Copy.ai"], 
        commissionRate: "25%",
        active: true
      },
      { 
        name: "WriteSonic", 
        description: "AI content writing tool for blogs and articles", 
        link: "https://writesonic.com/?ref=123", 
        promoCode: "REDDIT10", 
        keywords: ["WriteSonic", "blog writing", "article writing", "AI content"], 
        commissionRate: "20%",
        active: true
      },
      { 
        name: "Frase.io", 
        description: "SEO content optimization tool", 
        link: "https://frase.io/?ref=123", 
        promoCode: "REDDIT25", 
        keywords: ["SEO", "content optimization", "Frase.io", "SEO writing"], 
        commissionRate: "35%",
        active: true
      },
      { 
        name: "Ahrefs", 
        description: "SEO toolset for backlinks and keyword research", 
        link: "https://ahrefs.com/affiliate/123", 
        promoCode: "REDDIT10", 
        keywords: ["SEO", "backlinks", "keyword research", "Ahrefs"], 
        commissionRate: "15%",
        active: true
      },
      { 
        name: "SEMrush", 
        description: "All-in-one marketing toolkit for SEO", 
        link: "https://semrush.com/refer/123", 
        promoCode: "REDDIT30", 
        keywords: ["SEO", "marketing toolkit", "SEMrush", "keyword research"], 
        commissionRate: "40%",
        active: true
      }
    ];
    
    affiliatePrograms.forEach(program => {
      this.createAffiliateProgram(program as InsertAffiliateProgram);
    });
    
    // Add sample comment templates
    const commentTemplates = [
      {
        name: "Friendly recommendation",
        template: "I've been using {{program}} for about 6 months for all my content creation needs, and it's been a game-changer for my workflow.\n\nFor your specific needs, {{program}} is actually perfect because {{benefit}}.\n\nWhat I like most is {{feature}} which lets you {{advantage}}. The content requires minimal editing compared to other tools I've tried.\n\nThey have a free trial you can check out: [{{link}}]({{link}})\n\nIf you're on a tight budget, their plan is just under $50/month. I found the investment worth it since it cut my content creation time by about 70%.",
        type: "FRIENDLY",
        affiliateProgramId: 1
      },
      {
        name: "Detailed comparison",
        template: "I've tested most of the popular AI writing tools, and here's my comparison for your needs:\n\n**{{program}}**: The best overall option because {{reason}}. Their {{feature}} is excellent for {{use_case}}. [{{link}}]({{link}})\n\n**Alternative 1**: Good but lacks {{limitation}}.\n\n**Alternative 2**: Cheaper but {{drawback}}.\n\nIf you want the best balance of quality, ease of use, and price, I'd recommend {{program}}. Use code {{promo_code}} for a discount.",
        type: "COMPARISON",
        affiliateProgramId: null
      },
      {
        name: "Personal experience",
        template: "When I started my blog, I was in exactly your position. After trying several options, I settled on {{program}} and it's been incredible for my workflow.\n\n**What I use it for**:\n- {{use_case_1}}\n- {{use_case_2}}\n- {{use_case_3}}\n\n**What impressed me**: {{feature}} and its {{benefit}}.\n\nAfter 6 months, my content production has {{improvement}}. If you want to try it: [{{link}}]({{link}})",
        type: "EXPERIENCE",
        affiliateProgramId: null
      },
      {
        name: "Expert review",
        template: "Digital marketing consultant here. For your specific needs, I'd recommend {{program}}.\n\n**Key advantages**:\n1. {{advantage_1}}\n2. {{advantage_2}}\n3. {{advantage_3}}\n\n**Pricing**: Their {{plan}} plan would fit your budget at {{price}}/month.\n\n**My clients' results**: {{result}}\n\nYou can get started with their trial here: [{{link}}]({{link}}). Use promo code {{promo_code}} for {{discount}}.",
        type: "EXPERT",
        affiliateProgramId: null
      }
    ];
    
    commentTemplates.forEach(template => {
      this.createCommentTemplate(template as InsertCommentTemplate);
    });
    
    // Add sample Reddit threads
    const redditThreads = [
      {
        title: "What's the best AI writing tool for content creation?",
        body: "Hey everyone, I'm looking to start creating content for my blog and YouTube channel. I've heard about AI writing tools like Jasper, Copy.ai, and WriteSonic. Has anyone used these? Which would you recommend for a beginner who wants to create SEO-friendly content without breaking the bank?\n\nI'm specifically looking for something that can help me create:\n- Blog post outlines\n- Full blog articles\n- YouTube scripts\n- Social media captions\n\nIdeally something that won't require too much editing afterwards. I know AI isn't perfect but I'm hoping to speed up my workflow significantly. Budget is around $50/month max.",
        subreddit: "contentcreation",
        permalink: "/r/contentcreation/comments/abc123/whats_the_best_ai_writing_tool_for_content",
        upvotes: 56,
        commentCount: 23,
        author: "content_creator_123",
        flair: "Question",
        score: 92,
        intentType: "COMPARISON",
        serpRank: 3,
        hasSerp: true,
        matchedKeywords: ["AI writing", "content creation", "Jasper", "WriteSonic", "Copy.ai"],
        affiliateMatch: 95
      },
      {
        title: "Best SEO tool for keyword research in 2023?",
        body: "I'm just starting out with SEO and need recommendations for keyword research tools. I've looked at Ahrefs and SEMrush but they're pretty expensive for a beginner. Are there any good alternatives that won't break the bank? What features should I prioritize?",
        subreddit: "SEO",
        permalink: "/r/SEO/comments/def456/best_seo_tool_for_keyword_research_in_2023",
        upvotes: 128,
        commentCount: 45,
        author: "seo_newbie",
        flair: "Question",
        score: 95,
        intentType: "QUESTION",
        serpRank: 1,
        hasSerp: true,
        matchedKeywords: ["SEO", "keyword research", "Ahrefs", "SEMrush"],
        affiliateMatch: 90
      },
      {
        title: "Is Jasper AI worth it for blog content?",
        body: "I'm considering subscribing to Jasper AI for my blog content. I currently publish 2-3 articles a week and it takes me forever. Has anyone used Jasper for blog content? Is the output good enough that it doesn't need heavy editing? How does it handle SEO content?",
        subreddit: "blogging",
        permalink: "/r/blogging/comments/ghi789/is_jasper_ai_worth_it_for_blog_content",
        upvotes: 43,
        commentCount: 19,
        author: "busy_blogger",
        flair: "Tool Question",
        score: 89,
        intentType: "REVIEW",
        serpRank: 8,
        hasSerp: true,
        matchedKeywords: ["Jasper AI", "blog content", "SEO content"],
        affiliateMatch: 85
      }
    ];
    
    redditThreads.forEach(thread => {
      this.createThread(thread as InsertRedditThread);
    });
    
    // Add sample crawl history
    const crawlHistory = [
      {
        threadCount: 38,
        subreddits: ["contentcreation", "SEO", "blogging", "juststart", "Entrepreneur"],
        status: "completed",
        error: null
      }
    ];
    
    crawlHistory.forEach(history => {
      this.createCrawlHistory(history as InsertCrawlHistory);
    });
    
    // Add sample opportunities
    const opportunities = [
      {
        threadId: 1,
        score: 92,
        intent: "COMPARISON",
        matchedProgramIds: [1, 2, 3],
        serpMatch: true,
        action: "pending"
      },
      {
        threadId: 2,
        score: 95,
        intent: "QUESTION",
        matchedProgramIds: [5, 6],
        serpMatch: true,
        action: "pending"
      },
      {
        threadId: 3,
        score: 89,
        intent: "REVIEW",
        matchedProgramIds: [1],
        serpMatch: true,
        action: "pending"
      }
    ];
    
    opportunities.forEach(opportunity => {
      this.createOpportunity(opportunity as InsertOpportunity);
    });
    
    // Add sample SERP results
    const serpResults = [
      {
        threadId: 1,
        query: "best ai writing tool",
        position: 3,
        isRanked: true
      },
      {
        threadId: 2,
        query: "best seo tool for keyword research",
        position: 1,
        isRanked: true
      },
      {
        threadId: 3,
        query: "is jasper ai worth it",
        position: 8,
        isRanked: true
      }
    ];
    
    serpResults.forEach(serpResult => {
      this.createSerpResult(serpResult as InsertSerpResult);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Reddit thread methods
  async getThreads(options: ThreadFilterOptions = {}): Promise<RedditThread[]> {
    let threads = Array.from(this.redditThreads.values());
    
    // Apply filters
    if (options.subreddit) {
      threads = threads.filter(thread => thread.subreddit === options.subreddit);
    }
    
    if (options.intentType) {
      threads = threads.filter(thread => thread.intentType === options.intentType);
    }
    
    if (options.serpRank) {
      if (options.serpRank === 'Top 3') {
        threads = threads.filter(thread => thread.hasSerp && thread.serpRank && thread.serpRank <= 3);
      } else if (options.serpRank === 'Top 10') {
        threads = threads.filter(thread => thread.hasSerp && thread.serpRank && thread.serpRank <= 10);
      } else if (options.serpRank === 'Top 20') {
        threads = threads.filter(thread => thread.hasSerp && thread.serpRank && thread.serpRank <= 20);
      } else if (options.serpRank === 'No Rank') {
        threads = threads.filter(thread => !thread.hasSerp);
      }
    }
    
    if (options.affiliateProgram) {
      // Find the affiliate program
      const program = Array.from(this.affiliatePrograms.values()).find(
        program => program.name === options.affiliateProgram
      );
      
      if (program) {
        // Check if any of the program's keywords match the thread's keywords
        threads = threads.filter(thread => 
          thread.matchedKeywords.some(keyword => 
            program.keywords.includes(keyword)
          )
        );
      }
    }
    
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      threads = threads.filter(thread => 
        thread.title.toLowerCase().includes(searchLower) || 
        thread.body.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply sorting
    if (options.sortBy) {
      threads.sort((a, b) => {
        const aValue = a[options.sortBy as keyof RedditThread];
        const bValue = b[options.sortBy as keyof RedditThread];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return options.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return options.sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
    } else {
      // Default sort by score descending
      threads.sort((a, b) => b.score - a.score);
    }
    
    // Apply pagination
    if (options.limit && options.offset !== undefined) {
      threads = threads.slice(options.offset, options.offset + options.limit);
    } else if (options.limit) {
      threads = threads.slice(0, options.limit);
    }
    
    return threads;
  }
  
  async getThreadById(id: number): Promise<RedditThread | undefined> {
    return this.redditThreads.get(id);
  }
  
  async createThread(insertThread: InsertRedditThread): Promise<RedditThread> {
    const id = this.currentThreadId++;
    const now = new Date();
    const thread: RedditThread = {
      ...insertThread,
      id,
      createdAt: now,
      crawledAt: now
    };
    this.redditThreads.set(id, thread);
    return thread;
  }
  
  async updateThread(id: number, threadUpdate: Partial<InsertRedditThread>): Promise<RedditThread | undefined> {
    const thread = this.redditThreads.get(id);
    if (!thread) {
      return undefined;
    }
    
    const updatedThread: RedditThread = {
      ...thread,
      ...threadUpdate
    };
    
    this.redditThreads.set(id, updatedThread);
    return updatedThread;
  }
  
  async deleteThread(id: number): Promise<boolean> {
    return this.redditThreads.delete(id);
  }
  
  // Affiliate program methods
  async getAffiliatePrograms(): Promise<AffiliateProgram[]> {
    return Array.from(this.affiliatePrograms.values());
  }
  
  async getAffiliateProgramById(id: number): Promise<AffiliateProgram | undefined> {
    return this.affiliatePrograms.get(id);
  }
  
  async createAffiliateProgram(insertProgram: InsertAffiliateProgram): Promise<AffiliateProgram> {
    const id = this.currentAffiliateProgramId++;
    const program: AffiliateProgram = {
      ...insertProgram,
      id
    };
    this.affiliatePrograms.set(id, program);
    return program;
  }
  
  async updateAffiliateProgram(id: number, programUpdate: Partial<InsertAffiliateProgram>): Promise<AffiliateProgram | undefined> {
    const program = this.affiliatePrograms.get(id);
    if (!program) {
      return undefined;
    }
    
    const updatedProgram: AffiliateProgram = {
      ...program,
      ...programUpdate
    };
    
    this.affiliatePrograms.set(id, updatedProgram);
    return updatedProgram;
  }
  
  async deleteAffiliateProgram(id: number): Promise<boolean> {
    return this.affiliatePrograms.delete(id);
  }
  
  // Comment template methods
  async getCommentTemplates(): Promise<CommentTemplate[]> {
    return Array.from(this.commentTemplates.values());
  }
  
  async getCommentTemplateById(id: number): Promise<CommentTemplate | undefined> {
    return this.commentTemplates.get(id);
  }
  
  async getCommentTemplatesByType(type: string): Promise<CommentTemplate[]> {
    return Array.from(this.commentTemplates.values()).filter(
      template => template.type === type
    );
  }
  
  async createCommentTemplate(insertTemplate: InsertCommentTemplate): Promise<CommentTemplate> {
    const id = this.currentCommentTemplateId++;
    const template: CommentTemplate = {
      ...insertTemplate,
      id
    };
    this.commentTemplates.set(id, template);
    return template;
  }
  
  async updateCommentTemplate(id: number, templateUpdate: Partial<InsertCommentTemplate>): Promise<CommentTemplate | undefined> {
    const template = this.commentTemplates.get(id);
    if (!template) {
      return undefined;
    }
    
    const updatedTemplate: CommentTemplate = {
      ...template,
      ...templateUpdate
    };
    
    this.commentTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteCommentTemplate(id: number): Promise<boolean> {
    return this.commentTemplates.delete(id);
  }
  
  // Crawl history methods
  async getCrawlHistory(): Promise<CrawlHistory[]> {
    return Array.from(this.crawlHistory.values());
  }
  
  async getCrawlHistoryById(id: number): Promise<CrawlHistory | undefined> {
    return this.crawlHistory.get(id);
  }
  
  async createCrawlHistory(insertHistory: InsertCrawlHistory): Promise<CrawlHistory> {
    const id = this.currentCrawlHistoryId++;
    const startedAt = new Date();
    const history: CrawlHistory = {
      ...insertHistory,
      id,
      startedAt,
      completedAt: insertHistory.status === "completed" ? new Date() : null
    };
    this.crawlHistory.set(id, history);
    return history;
  }
  
  async updateCrawlHistory(id: number, historyUpdate: Partial<InsertCrawlHistory>): Promise<CrawlHistory | undefined> {
    const history = this.crawlHistory.get(id);
    if (!history) {
      return undefined;
    }
    
    const updatedHistory: CrawlHistory = {
      ...history,
      ...historyUpdate,
      completedAt: historyUpdate.status === "completed" ? new Date() : history.completedAt
    };
    
    this.crawlHistory.set(id, updatedHistory);
    return updatedHistory;
  }
  
  // Run crawler
  async runCrawler(subreddits: string[]): Promise<CrawlHistory> {
    // Create a new crawl history entry
    const crawlHistory = await this.createCrawlHistory({
      status: "running",
      threadCount: 0,
      subreddits
    });
    
    // Mock a delay for the crawling process
    setTimeout(async () => {
      // Update the crawl history to completed
      await this.updateCrawlHistory(crawlHistory.id, {
        status: "completed",
        threadCount: Math.floor(Math.random() * 20) + 30 // Random number between 30-50
      });
    }, 5000);
    
    return crawlHistory;
  }

  // Opportunity methods
  async getOpportunities(options: OpportunityFilterOptions = {}): Promise<Opportunity[]> {
    let opportunities = Array.from(this.opportunities.values());
    
    // Apply filters
    if (options.threadId !== undefined) {
      opportunities = opportunities.filter(opportunity => opportunity.threadId === options.threadId);
    }
    
    if (options.intent) {
      opportunities = opportunities.filter(opportunity => opportunity.intent === options.intent);
    }
    
    if (options.score !== undefined) {
      opportunities = opportunities.filter(opportunity => opportunity.score === options.score);
    }
    
    if (options.scoreMin !== undefined) {
      opportunities = opportunities.filter(opportunity => opportunity.score >= options.scoreMin!);
    }
    
    if (options.scoreMax !== undefined) {
      opportunities = opportunities.filter(opportunity => opportunity.score <= options.scoreMax!);
    }
    
    if (options.serpMatch !== undefined) {
      opportunities = opportunities.filter(opportunity => opportunity.serpMatch === options.serpMatch);
    }
    
    if (options.action) {
      opportunities = opportunities.filter(opportunity => opportunity.action === options.action);
    }
    
    // Apply sorting
    if (options.sortBy) {
      opportunities.sort((a, b) => {
        const aValue = a[options.sortBy as keyof Opportunity];
        const bValue = b[options.sortBy as keyof Opportunity];
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return options.sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return options.sortDirection === 'asc' 
            ? aValue.localeCompare(bValue) 
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
    } else {
      // Default sort by score descending
      opportunities.sort((a, b) => b.score - a.score);
    }
    
    // Apply pagination
    if (options.limit && options.offset !== undefined) {
      opportunities = opportunities.slice(options.offset, options.offset + options.limit);
    } else if (options.limit) {
      opportunities = opportunities.slice(0, options.limit);
    }
    
    return opportunities;
  }

  async getOpportunityById(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async getOpportunitiesByThreadId(threadId: number): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values()).filter(
      opportunity => opportunity.threadId === threadId
    );
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.currentOpportunityId++;
    const now = new Date();
    const opportunity: Opportunity = {
      ...insertOpportunity,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async updateOpportunity(id: number, opportunityUpdate: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const opportunity = this.opportunities.get(id);
    if (!opportunity) {
      return undefined;
    }
    
    const now = new Date();
    const updatedOpportunity: Opportunity = {
      ...opportunity,
      ...opportunityUpdate,
      updatedAt: now
    };
    
    this.opportunities.set(id, updatedOpportunity);
    return updatedOpportunity;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    return this.opportunities.delete(id);
  }

  // SERP Results methods
  async getSerpResults(): Promise<SerpResult[]> {
    return Array.from(this.serpResults.values());
  }

  async getSerpResultById(id: number): Promise<SerpResult | undefined> {
    return this.serpResults.get(id);
  }

  async getSerpResultsByThreadId(threadId: number): Promise<SerpResult[]> {
    return Array.from(this.serpResults.values()).filter(
      serpResult => serpResult.threadId === threadId
    );
  }

  async createSerpResult(insertSerpResult: InsertSerpResult): Promise<SerpResult> {
    const id = this.currentSerpResultId++;
    const now = new Date();
    const serpResult: SerpResult = {
      ...insertSerpResult,
      id,
      checkedAt: now
    };
    this.serpResults.set(id, serpResult);
    return serpResult;
  }

  async updateSerpResult(id: number, serpResultUpdate: Partial<InsertSerpResult>): Promise<SerpResult | undefined> {
    const serpResult = this.serpResults.get(id);
    if (!serpResult) {
      return undefined;
    }
    
    const updatedSerpResult: SerpResult = {
      ...serpResult,
      ...serpResultUpdate
    };
    
    this.serpResults.set(id, updatedSerpResult);
    return updatedSerpResult;
  }

  async deleteSerpResult(id: number): Promise<boolean> {
    return this.serpResults.delete(id);
  }

  // Refresh opportunities
  /**
   * Classifies the intent of a thread based on its title and body
   * @param thread The Reddit thread to classify
   * @returns The intent type (DISCOVERY, COMPARISON, QUESTION, SHOWCASE)
   */
  private classifyThreadIntent(thread: RedditThread): string {
    const text = `${thread.title} ${thread.body}`.toLowerCase();
    
    // Check for comparison intent
    if (
      text.includes('vs') || 
      text.includes('versus') || 
      text.includes('compare') || 
      text.includes('better than') ||
      text.includes('alternative to') ||
      /which (?:one|tool|software|service|app) (?:is|should)/i.test(text) ||
      /(?:difference|differences) between/i.test(text)
    ) {
      return 'COMPARISON';
    }
    
    // Check for question intent
    if (
      text.includes('?') || 
      text.startsWith('how') || 
      text.startsWith('what') || 
      text.startsWith('why') ||
      text.startsWith('when') ||
      text.startsWith('where') ||
      text.startsWith('who') ||
      text.startsWith('can someone') ||
      text.startsWith('does anyone')
    ) {
      return 'QUESTION';
    }
    
    // Check for showcase intent
    if (
      text.includes('i made') || 
      text.includes('just launched') || 
      text.includes('created this') ||
      text.includes('built a') ||
      text.includes('my project') ||
      text.includes('showcase') ||
      text.includes('look what i') ||
      text.includes('check out my')
    ) {
      return 'SHOWCASE';
    }
    
    // Default to discovery intent
    return 'DISCOVERY';
  }
  
  /**
   * Finds keywords in a thread that match with affiliate program keywords
   * @param thread The Reddit thread to check
   * @param affiliatePrograms List of affiliate programs to match against
   * @returns Array of matched keywords
   */
  private findMatchingKeywords(thread: RedditThread, affiliatePrograms: AffiliateProgram[]): string[] {
    const text = `${thread.title} ${thread.body}`.toLowerCase();
    const matchedKeywords: string[] = [];
    
    // Check each affiliate program's keywords
    for (const program of affiliatePrograms) {
      // Check program name directly (common case for products like "Jasper AI")
      if (text.includes(program.name.toLowerCase()) && !matchedKeywords.includes(program.name)) {
        matchedKeywords.push(program.name);
      }
      
      // Check each program keyword
      for (const keyword of program.keywords) {
        if (text.includes(keyword.toLowerCase()) && !matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }
      
      // Check for variations with/without spaces or "AI" suffix (common patterns)
      // For example, match "JasperAI" with "Jasper AI" or "Jasper" with "Jasper AI"
      const nameWithoutSpaces = program.name.replace(/\s+/g, '').toLowerCase();
      const nameWithoutAI = program.name.replace(/\s*AI\s*$/i, '').toLowerCase();
      
      if (text.includes(nameWithoutSpaces) && 
          !matchedKeywords.includes(program.name) && 
          nameWithoutSpaces !== program.name.toLowerCase()) {
        matchedKeywords.push(program.name);
      }
      
      if (text.includes(nameWithoutAI) && 
          !matchedKeywords.includes(program.name) && 
          nameWithoutAI !== program.name.toLowerCase()) {
        matchedKeywords.push(program.name);
      }
    }
    
    return matchedKeywords;
  }
  
  /**
   * Calculates a score for a thread based on various factors
   * @param thread The Reddit thread to score
   * @param matchedProgramIds Array of matched affiliate program IDs
   * @param intent The classified intent type
   * @param hasSerpMatch Whether the thread has a SERP match
   * @returns A score between 0 and 100
   */
  private calculateThreadScore(
    thread: RedditThread, 
    matchedProgramIds: number[], 
    intent: string, 
    hasSerpMatch: boolean
  ): number {
    let score = 0;
    
    // Base score from upvotes (max 30 points)
    score += Math.min(thread.upvotes / 10, 30);
    
    // Intent score (max 20 points)
    switch (intent) {
      case 'DISCOVERY':
        score += 20;
        break;
      case 'COMPARISON':
        score += 15;
        break;
      case 'QUESTION':
        score += 10;
        break;
      case 'SHOWCASE':
        score += 5;
        break;
    }
    
    // Affiliate match score (max 30 points)
    score += Math.min(matchedProgramIds.length * 10, 30);
    
    // SERP score (20 points)
    if (hasSerpMatch) {
      score += 20;
    }
    
    // Cap the score at 100
    return Math.min(Math.round(score), 100);
  }
  
  async refreshOpportunities(): Promise<number> {
    // Get all threads
    const threads = await this.getThreads();
    let count = 0;
    
    // Get all affiliate programs for matching
    const affiliatePrograms = await this.getAffiliatePrograms();
    
    // Analyze each thread and create or update opportunities
    for (const thread of threads) {
      // Find matching keywords for this thread
      const matchedKeywords = this.findMatchingKeywords(thread, affiliatePrograms);
      
      // Get matched program IDs
      const matchedProgramIds: number[] = [];
      for (const program of affiliatePrograms) {
        // Check if program name is in matched keywords
        if (matchedKeywords.includes(program.name)) {
          matchedProgramIds.push(program.id);
          continue;
        }
        
        // Check if any program keywords are in matched keywords
        if (program.keywords.some(keyword => matchedKeywords.includes(keyword))) {
          matchedProgramIds.push(program.id);
        }
      }
      
      // Classify thread intent
      const intent = this.classifyThreadIntent(thread);
      
      // Check for SERP match
      const serpResults = await this.getSerpResultsByThreadId(thread.id);
      const hasSerpMatch = serpResults.length > 0 && serpResults.some(result => result.position !== null && result.position <= 10);
      
      // Calculate thread score
      const score = this.calculateThreadScore(thread, matchedProgramIds, intent, hasSerpMatch);
      
      // Update thread with new information
      await this.updateThread(thread.id, {
        intentType: intent,
        matchedKeywords,
        hasSerp: hasSerpMatch,
        score
      });
      
      // Check if there's an existing opportunity for this thread
      const existingOpportunities = await this.getOpportunitiesByThreadId(thread.id);
      
      if (existingOpportunities.length === 0) {
        // Create a new opportunity
        await this.createOpportunity({
          threadId: thread.id,
          score,
          intent,
          matchedProgramIds,
          serpMatch: hasSerpMatch,
          action: "pending"
        });
        
        count++;
      } else {
        // Update existing opportunity
        const opportunity = existingOpportunities[0];
        
        // Only update if there are changes
        if (
          opportunity.score !== score ||
          opportunity.intent !== intent ||
          opportunity.serpMatch !== hasSerpMatch ||
          JSON.stringify(opportunity.matchedProgramIds) !== JSON.stringify(matchedProgramIds)
        ) {
          await this.updateOpportunity(opportunity.id, {
            score,
            intent,
            matchedProgramIds,
            serpMatch: hasSerpMatch
          });
          
          count++;
        }
      }
    }
    
    return count;
  }
}

// Import the Supabase storage implementation
import { SupabaseStorage } from './supabase-storage';

// Use Supabase storage if SUPABASE_URL and SUPABASE_KEY are available, otherwise fall back to MemStorage
import { db } from "./db";
import { eq, desc, asc, and, like, between, or, sql } from "drizzle-orm";
import { getAllSubreddits } from "./subredditList";
import { log } from "./vite";

// DatabaseStorage implementation that uses drizzle-orm directly
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getThreads(options: ThreadFilterOptions = {}): Promise<RedditThread[]> {
    let query = db.select().from(redditThreads);
    
    // Apply filters
    const conditions = [];
    
    if (options.subreddit) {
      conditions.push(eq(redditThreads.subreddit, options.subreddit));
    }
    
    if (options.intentType) {
      conditions.push(eq(redditThreads.intentType, options.intentType));
    }
    
    if (options.serpRank) {
      if (options.serpRank === 'Top 3') {
        conditions.push(and(eq(redditThreads.hasSerp, true), sql`${redditThreads.serpRank} <= 3`));
      } else if (options.serpRank === 'Top 10') {
        conditions.push(and(eq(redditThreads.hasSerp, true), sql`${redditThreads.serpRank} <= 10`));
      } else if (options.serpRank === 'Top 20') {
        conditions.push(and(eq(redditThreads.hasSerp, true), sql`${redditThreads.serpRank} <= 20`));
      } else if (options.serpRank === 'No Rank') {
        conditions.push(or(eq(redditThreads.hasSerp, false), sql`${redditThreads.serpRank} IS NULL`));
      }
    }
    
    if (options.search) {
      conditions.push(or(
        like(redditThreads.title, `%${options.search}%`),
        like(redditThreads.body, `%${options.search}%`)
      ));
    }
    
    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    if (options.sortBy) {
      const direction = options.sortDirection === 'desc' ? desc : asc;
      
      if (options.sortBy === 'upvotes') {
        query = query.orderBy(direction(redditThreads.upvotes));
      } else if (options.sortBy === 'commentCount') {
        query = query.orderBy(direction(redditThreads.commentCount));
      } else if (options.sortBy === 'createdAt') {
        query = query.orderBy(direction(redditThreads.createdAt));
      } else if (options.sortBy === 'score') {
        query = query.orderBy(direction(redditThreads.score));
      } else if (options.sortBy === 'serpRank') {
        query = query.orderBy(direction(redditThreads.serpRank));
      }
    } else {
      // Default sort by createdAt desc
      query = query.orderBy(desc(redditThreads.createdAt));
    }
    
    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    try {
      const threads = await query;
      return threads;
    } catch (error) {
      log(`Error fetching threads: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return [];
    }
  }

  async getThreadById(id: number): Promise<RedditThread | undefined> {
    try {
      const [thread] = await db.select().from(redditThreads).where(eq(redditThreads.id, id));
      return thread || undefined;
    } catch (error) {
      log(`Error fetching thread: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async createThread(thread: InsertRedditThread): Promise<RedditThread> {
    try {
      const [createdThread] = await db
        .insert(redditThreads)
        .values(thread)
        .returning();
      return createdThread;
    } catch (error) {
      log(`Error creating thread: ${error instanceof Error ? error.message : String(error)}`, 'db');
      throw new Error(`Failed to create thread: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateThread(id: number, thread: Partial<InsertRedditThread>): Promise<RedditThread | undefined> {
    try {
      const [updatedThread] = await db
        .update(redditThreads)
        .set(thread)
        .where(eq(redditThreads.id, id))
        .returning();
      return updatedThread || undefined;
    } catch (error) {
      log(`Error updating thread: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async deleteThread(id: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(redditThreads)
        .where(eq(redditThreads.id, id))
        .returning();
      return !!deleted;
    } catch (error) {
      log(`Error deleting thread: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return false;
    }
  }
  
  async getAffiliatePrograms(): Promise<AffiliateProgram[]> {
    try {
      const programs = await db
        .select()
        .from(affiliatePrograms)
        .orderBy(asc(affiliatePrograms.name));
      return programs;
    } catch (error) {
      log(`Error fetching affiliate programs: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return [];
    }
  }

  async getAffiliateProgramById(id: number): Promise<AffiliateProgram | undefined> {
    try {
      const [program] = await db
        .select()
        .from(affiliatePrograms)
        .where(eq(affiliatePrograms.id, id));
      return program || undefined;
    } catch (error) {
      log(`Error fetching affiliate program: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async createAffiliateProgram(program: InsertAffiliateProgram): Promise<AffiliateProgram> {
    try {
      const [createdProgram] = await db
        .insert(affiliatePrograms)
        .values(program)
        .returning();
      return createdProgram;
    } catch (error) {
      log(`Error creating affiliate program: ${error instanceof Error ? error.message : String(error)}`, 'db');
      throw new Error(`Failed to create affiliate program: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateAffiliateProgram(id: number, program: Partial<InsertAffiliateProgram>): Promise<AffiliateProgram | undefined> {
    try {
      const [updatedProgram] = await db
        .update(affiliatePrograms)
        .set(program)
        .where(eq(affiliatePrograms.id, id))
        .returning();
      return updatedProgram || undefined;
    } catch (error) {
      log(`Error updating affiliate program: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async deleteAffiliateProgram(id: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(affiliatePrograms)
        .where(eq(affiliatePrograms.id, id))
        .returning();
      return !!deleted;
    } catch (error) {
      log(`Error deleting affiliate program: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return false;
    }
  }
  
  async getCommentTemplates(): Promise<CommentTemplate[]> {
    try {
      const templates = await db
        .select()
        .from(commentTemplates)
        .orderBy(asc(commentTemplates.name));
      return templates;
    } catch (error) {
      log(`Error fetching comment templates: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return [];
    }
  }

  async getCommentTemplateById(id: number): Promise<CommentTemplate | undefined> {
    try {
      const [template] = await db
        .select()
        .from(commentTemplates)
        .where(eq(commentTemplates.id, id));
      return template || undefined;
    } catch (error) {
      log(`Error fetching comment template: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async getCommentTemplatesByType(type: string): Promise<CommentTemplate[]> {
    try {
      const templates = await db
        .select()
        .from(commentTemplates)
        .where(eq(commentTemplates.type, type))
        .orderBy(asc(commentTemplates.name));
      return templates;
    } catch (error) {
      log(`Error fetching comment templates by type: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return [];
    }
  }

  async createCommentTemplate(template: InsertCommentTemplate): Promise<CommentTemplate> {
    try {
      const [createdTemplate] = await db
        .insert(commentTemplates)
        .values(template)
        .returning();
      return createdTemplate;
    } catch (error) {
      log(`Error creating comment template: ${error instanceof Error ? error.message : String(error)}`, 'db');
      throw new Error(`Failed to create comment template: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateCommentTemplate(id: number, template: Partial<InsertCommentTemplate>): Promise<CommentTemplate | undefined> {
    try {
      const [updatedTemplate] = await db
        .update(commentTemplates)
        .set(template)
        .where(eq(commentTemplates.id, id))
        .returning();
      return updatedTemplate || undefined;
    } catch (error) {
      log(`Error updating comment template: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async deleteCommentTemplate(id: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(commentTemplates)
        .where(eq(commentTemplates.id, id))
        .returning();
      return !!deleted;
    } catch (error) {
      log(`Error deleting comment template: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return false;
    }
  }
  
  async getCrawlHistory(): Promise<CrawlHistory[]> {
    try {
      const history = await db
        .select()
        .from(crawlHistory)
        .orderBy(desc(crawlHistory.startedAt));
      return history;
    } catch (error) {
      log(`Error fetching crawl history: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return [];
    }
  }

  async getCrawlHistoryById(id: number): Promise<CrawlHistory | undefined> {
    try {
      const [history] = await db
        .select()
        .from(crawlHistory)
        .where(eq(crawlHistory.id, id));
      return history || undefined;
    } catch (error) {
      log(`Error fetching crawl history: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async createCrawlHistory(history: InsertCrawlHistory): Promise<CrawlHistory> {
    try {
      const [createdHistory] = await db
        .insert(crawlHistory)
        .values(history)
        .returning();
      return createdHistory;
    } catch (error) {
      log(`Error creating crawl history: ${error instanceof Error ? error.message : String(error)}`, 'db');
      throw new Error(`Failed to create crawl history: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateCrawlHistory(id: number, history: Partial<InsertCrawlHistory>): Promise<CrawlHistory | undefined> {
    try {
      const [updatedHistory] = await db
        .update(crawlHistory)
        .set(history)
        .where(eq(crawlHistory.id, id))
        .returning();
      return updatedHistory || undefined;
    } catch (error) {
      log(`Error updating crawl history: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }
  
  async getOpportunities(options: OpportunityFilterOptions = {}): Promise<Opportunity[]> {
    try {
      let query = db.select().from(opportunities);
      
      // Apply filters
      const conditions = [];
      
      if (options.threadId) {
        conditions.push(eq(opportunities.threadId, options.threadId));
      }
      
      if (options.intent) {
        conditions.push(eq(opportunities.intent, options.intent));
      }
      
      if (options.score !== undefined) {
        conditions.push(eq(opportunities.score, options.score));
      }
      
      if (options.scoreMin !== undefined && options.scoreMax !== undefined) {
        conditions.push(between(opportunities.score, options.scoreMin, options.scoreMax));
      } else if (options.scoreMin !== undefined) {
        conditions.push(sql`${opportunities.score} >= ${options.scoreMin}`);
      } else if (options.scoreMax !== undefined) {
        conditions.push(sql`${opportunities.score} <= ${options.scoreMax}`);
      }
      
      if (options.serpMatch !== undefined) {
        conditions.push(eq(opportunities.serpMatch, options.serpMatch));
      }
      
      if (options.action) {
        conditions.push(eq(opportunities.action, options.action));
      }
      
      // Apply all conditions
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
      
      // Apply sorting
      if (options.sortBy) {
        const direction = options.sortDirection === 'desc' ? desc : asc;
        
        if (options.sortBy === 'score') {
          query = query.orderBy(direction(opportunities.score));
        } else if (options.sortBy === 'createdAt') {
          query = query.orderBy(direction(opportunities.createdAt));
        } else if (options.sortBy === 'updatedAt') {
          query = query.orderBy(direction(opportunities.updatedAt));
        }
      } else {
        // Default sort by score desc
        query = query.orderBy(desc(opportunities.score));
      }
      
      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.offset(options.offset);
      }
      
      const results = await query;
      return results;
    } catch (error) {
      log(`Error fetching opportunities: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return [];
    }
  }

  async getOpportunityById(id: number): Promise<Opportunity | undefined> {
    try {
      const [opportunity] = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.id, id));
      return opportunity || undefined;
    } catch (error) {
      log(`Error fetching opportunity: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async getOpportunitiesByThreadId(threadId: number): Promise<Opportunity[]> {
    try {
      const result = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.threadId, threadId))
        .orderBy(desc(opportunities.score));
      return result;
    } catch (error) {
      log(`Error fetching opportunities by thread ID: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return [];
    }
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    try {
      const [createdOpportunity] = await db
        .insert(opportunities)
        .values(opportunity)
        .returning();
      return createdOpportunity;
    } catch (error) {
      log(`Error creating opportunity: ${error instanceof Error ? error.message : String(error)}`, 'db');
      throw new Error(`Failed to create opportunity: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateOpportunity(id: number, opportunity: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    try {
      const [updatedOpportunity] = await db
        .update(opportunities)
        .set(opportunity)
        .where(eq(opportunities.id, id))
        .returning();
      return updatedOpportunity || undefined;
    } catch (error) {
      log(`Error updating opportunity: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(opportunities)
        .where(eq(opportunities.id, id))
        .returning();
      return !!deleted;
    } catch (error) {
      log(`Error deleting opportunity: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return false;
    }
  }
  
  async getSerpResults(): Promise<SerpResult[]> {
    try {
      const results = await db
        .select()
        .from(serpResults)
        .orderBy(desc(serpResults.checkedAt));
      return results;
    } catch (error) {
      log(`Error fetching SERP results: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return [];
    }
  }

  async getSerpResultById(id: number): Promise<SerpResult | undefined> {
    try {
      const [result] = await db
        .select()
        .from(serpResults)
        .where(eq(serpResults.id, id));
      return result || undefined;
    } catch (error) {
      log(`Error fetching SERP result: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async getSerpResultsByThreadId(threadId: number): Promise<SerpResult[]> {
    try {
      const results = await db
        .select()
        .from(serpResults)
        .where(eq(serpResults.threadId, threadId))
        .orderBy(desc(serpResults.checkedAt));
      return results;
    } catch (error) {
      log(`Error fetching SERP results by thread ID: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return [];
    }
  }

  async createSerpResult(serpResult: InsertSerpResult): Promise<SerpResult> {
    try {
      const [createdResult] = await db
        .insert(serpResults)
        .values(serpResult)
        .returning();
      return createdResult;
    } catch (error) {
      log(`Error creating SERP result: ${error instanceof Error ? error.message : String(error)}`, 'db');
      throw new Error(`Failed to create SERP result: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async updateSerpResult(id: number, serpResult: Partial<InsertSerpResult>): Promise<SerpResult | undefined> {
    try {
      const [updatedResult] = await db
        .update(serpResults)
        .set(serpResult)
        .where(eq(serpResults.id, id))
        .returning();
      return updatedResult || undefined;
    } catch (error) {
      log(`Error updating SERP result: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return undefined;
    }
  }

  async deleteSerpResult(id: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(serpResults)
        .where(eq(serpResults.id, id))
        .returning();
      return !!deleted;
    } catch (error) {
      log(`Error deleting SERP result: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return false;
    }
  }
  
  async runCrawler(subreddits: string[]): Promise<CrawlHistory> {
    try {
      // Create a new crawl history entry
      const crawlEntry: InsertCrawlHistory = {
        subreddits: subreddits.length > 0 ? subreddits : getAllSubreddits(),
        threadCount: 0,
        status: 'running'
      };
      
      const history = await this.createCrawlHistory(crawlEntry);
      
      // Use the real Reddit crawler service to fetch real threads
      log(`Starting real Reddit crawler for ${crawlEntry.subreddits.length} subreddits`, 'crawler');
      const crawledThreads = await redditCrawlerService.crawlSubreddits(
        crawlEntry.subreddits as string[], 
        5 // Fetch 5 threads per subreddit
      );
      
      log(`Crawled ${crawledThreads.length} threads from Reddit`, 'crawler');
      
      // Insert crawled threads
      let successCount = 0;
      for (const thread of crawledThreads) {
        try {
          await this.createThread(thread);
          successCount++;
        } catch (threadError) {
          log(`Error inserting thread: ${threadError instanceof Error ? threadError.message : String(threadError)}`, 'crawler');
          // Continue with other threads even if one fails
        }
      }
      
      // Update crawl history
      const updatedHistory = await this.updateCrawlHistory(history.id, {
        threadCount: successCount,
        status: 'completed'
      });
      
      return updatedHistory || history;
    } catch (error) {
      log(`Error running crawler: ${error instanceof Error ? error.message : String(error)}`, 'db');
      
      // Update the crawl history to mark as failed
      if (history) {
        await this.updateCrawlHistory(history.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : String(error)
        });
      }
      
      throw new Error(`Failed to run crawler: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async refreshOpportunities(): Promise<number> {
    try {
      // Get all threads
      const threads = await this.getThreads();
      
      // Get all affiliate programs
      const affiliatePrograms = await this.getAffiliatePrograms();
      
      let opportunityCount = 0;
      
      for (const thread of threads) {
        // Analyze thread intent
        const intent = this.classifyThreadIntent(thread);
        
        // Find matching keywords
        const matchedKeywords = this.findMatchingKeywords(thread, affiliatePrograms);
        
        // Find matching programs by keywords
        const matchedProgramIds = affiliatePrograms
          .filter(program => {
            const programKeywords = program.keywords as string[];
            return programKeywords.some(keyword => 
              matchedKeywords.includes(keyword.toLowerCase())
            );
          })
          .map(program => program.id);
        
        // Check if there's a SERP match
        const serpResults = await this.getSerpResultsByThreadId(thread.id);
        const hasSerpMatch = serpResults.some(result => result.isRanked);
        
        // Calculate score
        const score = this.calculateThreadScore(
          thread, 
          matchedProgramIds, 
          intent, 
          hasSerpMatch
        );
        
        // Create or update opportunity
        const existingOpportunities = await this.getOpportunitiesByThreadId(thread.id);
        
        if (existingOpportunities.length > 0) {
          // Update existing opportunity
          await this.updateOpportunity(existingOpportunities[0].id, {
            score,
            intent,
            matchedProgramIds,
            serpMatch: hasSerpMatch
          });
        } else {
          // Create new opportunity
          await this.createOpportunity({
            threadId: thread.id,
            score,
            intent,
            matchedProgramIds,
            serpMatch: hasSerpMatch,
            action: 'pending'
          });
        }
        
        // Update thread with intent and matched keywords
        await this.updateThread(thread.id, {
          intentType: intent,
          matchedKeywords: matchedKeywords,
          affiliateMatch: matchedProgramIds.length
        });
        
        opportunityCount++;
      }
      
      return opportunityCount;
    } catch (error) {
      log(`Error refreshing opportunities: ${error instanceof Error ? error.message : String(error)}`, 'db');
      return 0;
    }
  }
  
  private classifyThreadIntent(thread: RedditThread): string {
    const { title, body } = thread;
    const titleLower = title.toLowerCase();
    const bodyLower = body.toLowerCase();
    const content = `${titleLower} ${bodyLower}`;
    
    const patterns = {
      QUESTION: [
        "what's the best", "what is the best", "recommend", "suggestion", 
        "looking for", "alternative to", "better than", "vs", "versus",
        "advice", "help me", "opinion", "review", "worth it", "should i",
        "?", "how do i", "how to", "anyone use", "anyone tried"
      ],
      COMPARISON: [
        "compare", "vs", "versus", "better than", "difference between",
        "pros and cons", "advantages", "disadvantages", "best option"
      ],
      REVIEW: [
        "review", "experience with", "worth it", "thoughts on", "anyone use",
        "using", "tried", "opinions on", "feedback on", "thoughts about"
      ],
      DISCOVERY: [
        "discover", "new", "alternative", "just found", "check out", "hidden gem",
        "underrated", "discovery", "find", "unknown"
      ]
    };
    
    // Check for patterns
    for (const [intent, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return intent;
      }
    }
    
    // Default to QUESTION if no pattern matches
    return "QUESTION";
  }

  private findMatchingKeywords(thread: RedditThread, affiliatePrograms: AffiliateProgram[]): string[] {
    const { title, body } = thread;
    const content = `${title.toLowerCase()} ${body.toLowerCase()}`;
    
    const matchedKeywords: string[] = [];
    
    affiliatePrograms.forEach(program => {
      const keywords = program.keywords as string[];
      keywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword.toLowerCase());
        }
      });
    });
    
    return [...new Set(matchedKeywords)]; // Remove duplicates
  }

  private calculateThreadScore(
    thread: RedditThread, 
    matchedProgramIds: number[],
    intent: string,
    hasSerpMatch: boolean
  ): number {
    // Base score
    let score = 0;
    
    // Upvotes factor (max 30 points)
    if (thread.upvotes >= 100) {
      score += 30;
    } else if (thread.upvotes >= 50) {
      score += 20;
    } else if (thread.upvotes >= 10) {
      score += 10;
    } else {
      score += 5;
    }
    
    // Comment count factor (max 20 points)
    if (thread.commentCount >= 50) {
      score += 20;
    } else if (thread.commentCount >= 20) {
      score += 15;
    } else if (thread.commentCount >= 5) {
      score += 10;
    } else {
      score += 5;
    }
    
    // Affiliate match factor (max 25 points)
    if (matchedProgramIds.length >= 3) {
      score += 25;
    } else if (matchedProgramIds.length === 2) {
      score += 20;
    } else if (matchedProgramIds.length === 1) {
      score += 15;
    }
    
    // Intent factor (max 15 points)
    if (intent === 'QUESTION') {
      score += 15;
    } else if (intent === 'COMPARISON') {
      score += 12;
    } else if (intent === 'REVIEW') {
      score += 10;
    } else {
      score += 5;
    }
    
    // SERP match bonus (10 points)
    if (hasSerpMatch) {
      score += 10;
    }
    
    return Math.min(score, 100); // Cap at 100
  }
  
  // Helper method to generate sample threads for the crawler simulation
  private generateSampleThreads(subreddits: string[]): InsertRedditThread[] {
    const subredditList = subreddits.length > 0 ? subreddits : ['productivity', 'writing', 'Entrepreneur', 'webdev'];
    
    const sampleThreads: InsertRedditThread[] = [
      {
        title: "Best AI writing tool for content creation in 2023?",
        body: "I'm looking to scale my content creation and considering AI writing tools like Jasper, Copy.ai, and WriteSonic. Anyone have experience with these? Looking for real-world comparisons beyond their marketing material.\n\nSpecifically:\n1. How much editing is needed after generation?\n2. How does the quality compare between them?\n3. Are they worth the subscription cost?\n\nI write mostly in the tech and digital marketing space if that matters for the algorithm quality.",
        subreddit: subredditList[Math.floor(Math.random() * subredditList.length)],
        permalink: `/r/productivity/comments/abc123/best_ai_writing_tool_for_content_creation_in_2023`,
        upvotes: Math.floor(Math.random() * 100) + 20,
        commentCount: Math.floor(Math.random() * 40) + 10,
        author: "content_creator_" + Math.floor(Math.random() * 1000),
        flair: "Question",
        matchedKeywords: [],
        affiliateMatch: 0
      },
      {
        title: "Is SEMrush worth the price for a small blog?",
        body: "I've been running a small blog for about a year now and looking to step up my SEO game. SEMrush seems to be highly recommended but it's quite expensive. Is it worth the investment for a blog that's making around $500/month?\n\nHas anyone compared it to cheaper alternatives like Ahrefs or more affordable options? What specific features would make the price worthwhile for someone at my level?",
        subreddit: subredditList[Math.floor(Math.random() * subredditList.length)],
        permalink: `/r/blogging/comments/def456/is_semrush_worth_the_price_for_a_small_blog`,
        upvotes: Math.floor(Math.random() * 80) + 10,
        commentCount: Math.floor(Math.random() * 30) + 5,
        author: "blog_starter_" + Math.floor(Math.random() * 1000),
        flair: "SEO Question",
        matchedKeywords: [],
        affiliateMatch: 0
      },
      {
        title: "Jasper AI vs Copy.ai - which one gives better results?",
        body: "I'm trying to choose between Jasper AI and Copy.ai for my marketing agency. We need to create content for various clients across different niches.\n\nHas anyone used both extensively? Which one produces more natural-sounding content? I'm particularly interested in how they handle product descriptions and blog outlines.\n\nAlso, how do they compare in terms of pricing structures and limitations?",
        subreddit: subredditList[Math.floor(Math.random() * subredditList.length)],
        permalink: `/r/marketing/comments/ghi789/jasper_ai_vs_copyai_which_one_gives_better_results`,
        upvotes: Math.floor(Math.random() * 120) + 30,
        commentCount: Math.floor(Math.random() * 50) + 20,
        author: "marketing_pro_" + Math.floor(Math.random() * 1000),
        flair: "Comparison",
        matchedKeywords: [],
        affiliateMatch: 0
      }
    ];
    
    return sampleThreads;
  }
}

// Use DatabaseStorage as our primary storage implementation
export const storage = new DatabaseStorage();
