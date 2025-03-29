import { 
  users, type User, type InsertUser,
  redditThreads, type RedditThread, type InsertRedditThread,
  affiliatePrograms, type AffiliateProgram, type InsertAffiliateProgram,
  commentTemplates, type CommentTemplate, type InsertCommentTemplate,
  crawlHistory, type CrawlHistory, type InsertCrawlHistory,
  opportunities, type Opportunity, type InsertOpportunity,
  serpResults, type SerpResult, type InsertSerpResult
} from "@shared/schema";

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
  async refreshOpportunities(): Promise<number> {
    // Get all threads
    const threads = await this.getThreads();
    let count = 0;
    
    // Analyze each thread and create or update opportunities
    for (const thread of threads) {
      // Check if there's an existing opportunity for this thread
      const existingOpportunities = await this.getOpportunitiesByThreadId(thread.id);
      
      if (existingOpportunities.length === 0) {
        // Create a new opportunity
        const matchedProgramIds: number[] = [];
        
        // Find affiliate programs that match this thread
        const affiliatePrograms = await this.getAffiliatePrograms();
        for (const program of affiliatePrograms) {
          // Check if any keywords match
          if (program.keywords.some(keyword => thread.matchedKeywords.includes(keyword))) {
            matchedProgramIds.push(program.id);
          }
        }
        
        // Create the opportunity with a score based on thread attributes
        await this.createOpportunity({
          threadId: thread.id,
          score: thread.score,
          intent: thread.intentType || undefined,
          matchedProgramIds,
          serpMatch: thread.hasSerp,
          action: "pending"
        });
        
        count++;
      } else {
        // Update existing opportunity
        const opportunity = existingOpportunities[0];
        const matchedProgramIds: number[] = [];
        
        // Find affiliate programs that match this thread
        const affiliatePrograms = await this.getAffiliatePrograms();
        for (const program of affiliatePrograms) {
          // Check if any keywords match
          if (program.keywords.some(keyword => thread.matchedKeywords.includes(keyword))) {
            matchedProgramIds.push(program.id);
          }
        }
        
        // Only update if there are changes
        if (
          opportunity.score !== thread.score ||
          opportunity.intent !== thread.intentType ||
          opportunity.serpMatch !== thread.hasSerp ||
          JSON.stringify(opportunity.matchedProgramIds) !== JSON.stringify(matchedProgramIds)
        ) {
          await this.updateOpportunity(opportunity.id, {
            score: thread.score,
            intent: thread.intentType || undefined,
            matchedProgramIds,
            serpMatch: thread.hasSerp
          });
          
          count++;
        }
      }
    }
    
    return count;
  }
}

export const storage = new MemStorage();
