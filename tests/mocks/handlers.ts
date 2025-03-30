import { http, HttpResponse } from 'msw';

// Define data types
export interface Thread {
  id: number;
  title: string;
  subreddit: string;
  url: string;
  upvotes: number;
  commentCount: number;
  crawledAt: string;
}

export interface Opportunity {
  id: number;
  threadId: number;
  score: number;
  intent: string | null;
  matchedProgramIds: number[];
  serpMatch: boolean;
  action: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AffiliateProgram {
  id: number;
  name: string;
  website: string;
  commission: string;
  category: string;
  keywords: string[];
  description: string;
}

// Sample data for tests
export const sampleThreads: Thread[] = [
  {
    id: 1,
    title: "What's the best way to monetize a blog in 2025?",
    subreddit: "blogging",
    url: "https://reddit.com/r/blogging/post1",
    upvotes: 152,
    commentCount: 47,
    crawledAt: "2025-03-28T14:22:41Z"
  },
  {
    id: 2,
    title: "Comparing Affiliate Programs: Amazon vs Commission Junction",
    subreddit: "SEO",
    url: "https://reddit.com/r/SEO/post2",
    upvotes: 89,
    commentCount: 31,
    crawledAt: "2025-03-28T09:15:32Z"
  },
  {
    id: 3,
    title: "Looking for recommendations on best hosting for WordPress",
    subreddit: "Wordpress",
    url: "https://reddit.com/r/Wordpress/post3",
    upvotes: 203,
    commentCount: 78,
    crawledAt: "2025-03-27T18:42:19Z"
  }
];

export const sampleOpportunities: Opportunity[] = [
  {
    id: 1,
    threadId: 1,
    score: 87,
    intent: "recommendation",
    matchedProgramIds: [1, 3, 5],
    serpMatch: true,
    action: null,
    createdAt: "2025-03-28T14:30:22Z",
    updatedAt: "2025-03-28T14:30:22Z"
  },
  {
    id: 2,
    threadId: 2,
    score: 92,
    intent: "comparison",
    matchedProgramIds: [1, 2],
    serpMatch: true,
    action: "followed_up",
    createdAt: "2025-03-28T09:22:10Z",
    updatedAt: "2025-03-28T15:45:18Z"
  },
  {
    id: 3,
    threadId: 3,
    score: 95,
    intent: "recommendation",
    matchedProgramIds: [4, 6],
    serpMatch: false,
    action: "saved",
    createdAt: "2025-03-27T19:01:45Z",
    updatedAt: "2025-03-27T19:01:45Z"
  }
];

export const sampleAffiliatePrograms: AffiliateProgram[] = [
  {
    id: 1,
    name: "Amazon Associates",
    website: "https://affiliate-program.amazon.com/",
    commission: "1-10%",
    category: "General",
    keywords: ["amazon", "product", "retail", "shop", "buy"],
    description: "The most popular affiliate program covering millions of products."
  },
  {
    id: 2,
    name: "Commission Junction",
    website: "https://www.cj.com/",
    commission: "5-15%",
    category: "General",
    keywords: ["cj", "commission junction", "retail", "shop"],
    description: "Large affiliate network with many brands and retailers."
  },
  {
    id: 3,
    name: "Bluehost",
    website: "https://www.bluehost.com/affiliates",
    commission: "$65 per signup",
    category: "Hosting",
    keywords: ["hosting", "wordpress", "web hosting", "domain", "website"],
    description: "Popular web hosting affiliate program with high commissions."
  },
  {
    id: 4,
    name: "SiteGround",
    website: "https://www.siteground.com/affiliates",
    commission: "$50-100 per signup",
    category: "Hosting",
    keywords: ["hosting", "wordpress", "web hosting", "website"],
    description: "Web hosting affiliate program with tiered commissions."
  }
];

// Mock API handlers for testing
export const handlers = [
  // GET /api/opportunities
  http.get('/api/opportunities', ({ request }) => {
    const url = new URL(request.url);
    const intent = url.searchParams.get('intent');
    const subreddit = url.searchParams.get('subreddit');
    const minScore = url.searchParams.get('minScore');
    
    let filteredOpportunities = [...sampleOpportunities];
    
    if (intent) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.intent === intent);
    }
    
    if (subreddit) {
      // Filter by thread's subreddit
      filteredOpportunities = filteredOpportunities.filter(opp => {
        const thread = sampleThreads.find(t => t.id === opp.threadId);
        return thread?.subreddit === subreddit;
      });
    }
    
    if (minScore) {
      const scoreThreshold = parseInt(minScore);
      filteredOpportunities = filteredOpportunities.filter(opp => opp.score >= scoreThreshold);
    }
    
    return HttpResponse.json({
      opportunities: filteredOpportunities,
      total: filteredOpportunities.length,
      limit: 10,
      offset: 0
    });
  }),
  
  // GET /api/opportunities/:id
  http.get('/api/opportunities/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const opportunity = sampleOpportunities.find(o => o.id === id);
    
    if (!opportunity) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json({ opportunity });
  }),
  
  // GET /api/threads
  http.get('/api/threads', () => {
    return HttpResponse.json({
      threads: sampleThreads,
      total: sampleThreads.length,
      limit: 10,
      offset: 0
    });
  }),
  
  // GET /api/threads/:id
  http.get('/api/threads/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const thread = sampleThreads.find(t => t.id === id);
    
    if (!thread) {
      return new HttpResponse(null, { status: 404 });
    }
    
    return HttpResponse.json({ thread });
  }),
  
  // GET /api/threads/:threadId/opportunities
  http.get('/api/threads/:threadId/opportunities', ({ params }) => {
    const threadId = parseInt(params.threadId as string);
    const threadOpportunities = sampleOpportunities.filter(o => o.threadId === threadId);
    
    return HttpResponse.json({
      opportunities: threadOpportunities,
      total: threadOpportunities.length,
      limit: 10,
      offset: 0
    });
  }),
  
  // GET /api/affiliate-programs
  http.get('/api/affiliate-programs', () => {
    return HttpResponse.json({
      programs: sampleAffiliatePrograms,
      total: sampleAffiliatePrograms.length,
      limit: 10,
      offset: 0
    });
  }),
  
  // POST /api/refresh-opportunities
  http.post('/api/refresh-opportunities', () => {
    return HttpResponse.json({ count: 5, message: "Opportunities refreshed successfully" });
  }),
  
  // POST /api/run-crawler
  http.post('/api/run-crawler', () => {
    return HttpResponse.json({
      id: 3,
      startedAt: new Date().toISOString(),
      completedAt: null,
      threadCount: 0,
      subreddits: ['SEO', 'blogging', 'Wordpress'],
      status: 'running'
    });
  }),
  
  // PATCH /api/opportunities/:id
  http.patch('/api/opportunities/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const opportunity = sampleOpportunities.find(o => o.id === id);
    
    if (!opportunity) {
      return new HttpResponse(null, { status: 404 });
    }
    
    const body = await request.json() as Record<string, unknown>;
    
    // Create updated opportunity with proper typing
    const updatedOpportunity = {
      id: opportunity.id,
      threadId: opportunity.threadId,
      score: body.score !== undefined ? Number(body.score) : opportunity.score,
      intent: body.intent !== undefined ? String(body.intent) : opportunity.intent,
      matchedProgramIds: opportunity.matchedProgramIds,
      serpMatch: opportunity.serpMatch,
      action: body.action !== undefined ? String(body.action) : opportunity.action,
      createdAt: opportunity.createdAt,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(updatedOpportunity);
  })
];