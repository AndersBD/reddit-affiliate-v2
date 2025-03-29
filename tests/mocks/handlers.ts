import { http, HttpResponse } from 'msw';
import type { 
  RedditThread, 
  AffiliateProgram, 
  CommentTemplate, 
  CrawlHistory,
  Opportunity,
  SerpResult
} from '../../client/src/lib/types';

// Sample data for tests
export const sampleThreads: RedditThread[] = [
  {
    id: 1,
    title: 'Best SEO tool for keyword research?',
    body: 'I\'m looking for a good SEO tool that specializes in keyword research. Any recommendations?',
    subreddit: 'SEO',
    permalink: '/r/SEO/comments/abc123/best_seo_tool_for_keyword_research',
    upvotes: 25,
    commentCount: 12,
    author: 'seoguru',
    createdAt: '2023-05-15T10:15:00Z',
    crawledAt: '2023-05-15T12:30:00Z',
    score: 0.85,
    intentType: 'recommendation',
    serpRank: 3,
    hasSerp: true,
    matchedKeywords: ['seo', 'keyword research'],
    affiliateMatch: 2
  },
  {
    id: 2,
    title: 'Jasper AI vs Copy.ai - which is better for blogging?',
    body: 'I\'ve been using Copy.ai but wondering if Jasper is worth the switch for creating blog content.',
    subreddit: 'blogging',
    permalink: '/r/blogging/comments/def456/jasper_ai_vs_copyai_which_is_better_for_blogging',
    upvotes: 42,
    commentCount: 18,
    author: 'contentcreator',
    createdAt: '2023-05-16T14:20:00Z',
    crawledAt: '2023-05-16T15:45:00Z',
    score: 0.92,
    intentType: 'comparison',
    serpRank: 1,
    hasSerp: true,
    matchedKeywords: ['jasper ai', 'copy.ai', 'blogging'],
    affiliateMatch: 1
  }
];

export const sampleAffiliatePrograms: AffiliateProgram[] = [
  {
    id: 1,
    name: 'Jasper AI',
    description: 'AI writing assistant for content creators',
    link: 'https://jasper.ai/refer/affiliate',
    promoCode: 'REDDIT20',
    keywords: ['jasper', 'jarvis ai', 'conversion ai', 'ai writing', 'content creation'],
    commissionRate: '30% recurring',
    active: true
  },
  {
    id: 2,
    name: 'Semrush',
    description: 'All-in-one SEO tool suite',
    link: 'https://semrush.com/partner/affiliate',
    promoCode: 'SEOFIRST',
    keywords: ['seo', 'keyword research', 'competitor analysis', 'semrush'],
    commissionRate: '40% first month',
    active: true
  }
];

export const sampleCommentTemplates: CommentTemplate[] = [
  {
    id: 1,
    name: 'General Recommendation',
    template: 'Have you tried {{program}}? {{benefit}}. You can check it out here: {{link}}',
    type: 'recommendation',
    affiliateProgramId: 1
  },
  {
    id: 2,
    name: 'Comparison Winner',
    template: 'After testing both, I\'d recommend {{program}} because {{reason}}. {{feature}} is particularly good for {{use_case}}. Get started here: {{link}} (use promo code {{promo_code}} for {{discount}})',
    type: 'comparison',
    affiliateProgramId: 1
  }
];

export const sampleCrawlHistory: CrawlHistory[] = [
  {
    id: 1,
    startedAt: '2023-05-15T10:00:00Z',
    completedAt: '2023-05-15T10:15:00Z',
    threadCount: 120,
    subreddits: ['SEO', 'marketing', 'contentcreators'],
    status: 'completed'
  },
  {
    id: 2,
    startedAt: '2023-05-17T09:30:00Z',
    completedAt: null,
    threadCount: 0,
    subreddits: ['blogging', 'Entrepreneur', 'startups'],
    status: 'running'
  }
];

export const sampleOpportunities: Opportunity[] = [
  {
    id: 1,
    threadId: 1,
    score: 85,
    intent: 'recommendation',
    matchedProgramIds: [2],
    serpMatch: true,
    action: 'pending',
    createdAt: '2023-05-15T12:35:00Z',
    updatedAt: '2023-05-15T12:35:00Z'
  },
  {
    id: 2,
    threadId: 2,
    score: 92,
    intent: 'comparison',
    matchedProgramIds: [1],
    serpMatch: true,
    action: 'pending',
    createdAt: '2023-05-16T16:00:00Z',
    updatedAt: '2023-05-16T16:00:00Z'
  }
];

export const sampleSerpResults: SerpResult[] = [
  {
    id: 1,
    threadId: 1,
    query: 'best seo tool for keyword research',
    position: 3,
    isRanked: true,
    checkedAt: '2023-05-15T12:32:00Z'
  },
  {
    id: 2,
    threadId: 2,
    query: 'jasper ai vs copy.ai blogging',
    position: 1,
    isRanked: true,
    checkedAt: '2023-05-16T15:50:00Z'
  }
];

// API handler definitions for MSW
export const handlers = [
  // Threads endpoints
  http.get('/api/threads', ({ request }) => {
    // Support query parameters like in our API
    const url = new URL(request.url);
    const subreddit = url.searchParams.get('subreddit');
    
    let filteredThreads = [...sampleThreads];
    if (subreddit) {
      filteredThreads = filteredThreads.filter(thread => thread.subreddit === subreddit);
    }
    
    return HttpResponse.json({
      threads: filteredThreads,
      total: filteredThreads.length,
      limit: 10,
      offset: 0
    });
  }),

  http.get('/api/threads/:id', ({ params }) => {
    const id = params.id;
    const thread = sampleThreads.find(t => t.id === parseInt(id as string));
    
    if (!thread) {
      return HttpResponse.json(
        { message: 'Thread not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(thread);
  }),

  // Affiliate Programs endpoints
  http.get('/api/affiliate-programs', () => {
    return HttpResponse.json(sampleAffiliatePrograms);
  }),

  // Comment Templates endpoints
  http.get('/api/comment-templates', ({ request }) => {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    
    let filteredTemplates = [...sampleCommentTemplates];
    if (type) {
      filteredTemplates = filteredTemplates.filter(template => template.type === type);
    }
    
    return HttpResponse.json(filteredTemplates);
  }),

  // Crawl history endpoints
  http.get('/api/crawl-history', () => {
    return HttpResponse.json(sampleCrawlHistory);
  }),

  // Generate comment endpoint
  http.post('/api/generate-comment', async ({ request }) => {
    const { threadId, affiliateProgramId, templateId } = await request.json();
    
    // Get the relevant objects
    const thread = sampleThreads.find(t => t.id === threadId);
    const program = sampleAffiliatePrograms.find(p => p.id === affiliateProgramId);
    const template = sampleCommentTemplates.find(t => t.id === templateId);
    
    if (!thread || !program || !template) {
      return HttpResponse.json(
        { message: `${!thread ? 'Thread' : !program ? 'Affiliate program' : 'Template'} not found` },
        { status: 404 }
      );
    }

    let comment = template.template;
    comment = comment.replace(/\{\{program\}\}/g, program.name);
    comment = comment.replace(/\{\{link\}\}/g, program.link);
    comment = comment.replace(/\{\{promo_code\}\}/g, program.promoCode || '');
    comment = comment.replace(/\{\{benefit\}\}/g, 'It has specialized templates for blog posts and articles');
    
    return HttpResponse.json({ comment });
  }),

  // Run crawler endpoint
  http.post('/api/run-crawler', async ({ request }) => {
    const { subreddits } = await request.json();
    
    const newCrawl: CrawlHistory = {
      id: 3,
      startedAt: new Date().toISOString(),
      completedAt: null,
      threadCount: 0,
      subreddits,
      status: 'running'
    };
    
    return HttpResponse.json(newCrawl);
  }),

  // Opportunities endpoints
  http.get('/api/opportunities', ({ request }) => {
    const url = new URL(request.url);
    const threadId = url.searchParams.get('threadId');
    const intent = url.searchParams.get('intent');
    const scoreMin = url.searchParams.get('scoreMin');
    const scoreMax = url.searchParams.get('scoreMax');
    const serpMatch = url.searchParams.get('serpMatch');
    const action = url.searchParams.get('action');
    
    let filteredOpportunities = [...sampleOpportunities];
    
    if (threadId) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.threadId === parseInt(threadId));
    }
    
    if (intent) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.intent === intent);
    }
    
    if (scoreMin) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.score >= parseInt(scoreMin));
    }
    
    if (scoreMax) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.score <= parseInt(scoreMax));
    }
    
    if (serpMatch !== null) {
      const serpMatchBool = serpMatch === 'true';
      filteredOpportunities = filteredOpportunities.filter(opp => opp.serpMatch === serpMatchBool);
    }
    
    if (action) {
      filteredOpportunities = filteredOpportunities.filter(opp => opp.action === action);
    }
    
    return HttpResponse.json({
      opportunities: filteredOpportunities,
      total: filteredOpportunities.length,
      limit: 10,
      offset: 0
    });
  }),
  
  http.get('/api/opportunities/:id', ({ params }) => {
    const id = params.id;
    const opportunity = sampleOpportunities.find(o => o.id === parseInt(id as string));
    
    if (!opportunity) {
      return HttpResponse.json(
        { message: 'Opportunity not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(opportunity);
  }),
  
  http.get('/api/threads/:threadId/opportunities', ({ params }) => {
    const threadId = params.threadId;
    const opportunities = sampleOpportunities.filter(o => o.threadId === parseInt(threadId as string));
    
    return HttpResponse.json({
      opportunities,
      total: opportunities.length,
      limit: 10,
      offset: 0
    });
  }),
  
  http.post('/api/opportunities', async ({ request }) => {
    const body = await request.json();
    
    const newOpportunity: Opportunity = {
      id: sampleOpportunities.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body
    };
    
    return HttpResponse.json(newOpportunity);
  }),
  
  http.patch('/api/opportunities/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const body = await request.json();
    
    const opportunity = sampleOpportunities.find(o => o.id === id);
    
    if (!opportunity) {
      return HttpResponse.json(
        { message: 'Opportunity not found' },
        { status: 404 }
      );
    }
    
    const updatedOpportunity: Opportunity = {
      ...opportunity,
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(updatedOpportunity);
  }),
  
  http.delete('/api/opportunities/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const opportunityExists = sampleOpportunities.some(o => o.id === id);
    
    if (!opportunityExists) {
      return HttpResponse.json(
        { message: 'Opportunity not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({ success: true });
  }),
  
  // SERP Results endpoints
  http.get('/api/serp-results', () => {
    return HttpResponse.json(sampleSerpResults);
  }),
  
  http.get('/api/serp-results/:id', ({ params }) => {
    const id = params.id;
    const serpResult = sampleSerpResults.find(s => s.id === parseInt(id as string));
    
    if (!serpResult) {
      return HttpResponse.json(
        { message: 'SERP result not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(serpResult);
  }),
  
  http.get('/api/threads/:threadId/serp-results', ({ params }) => {
    const threadId = params.threadId;
    const serpResults = sampleSerpResults.filter(s => s.threadId === parseInt(threadId as string));
    
    return HttpResponse.json(serpResults);
  }),
  
  http.post('/api/serp-results', async ({ request }) => {
    const body = await request.json();
    
    const newSerpResult: SerpResult = {
      id: sampleSerpResults.length + 1,
      checkedAt: new Date().toISOString(),
      ...body
    };
    
    return HttpResponse.json(newSerpResult);
  }),
  
  http.patch('/api/serp-results/:id', async ({ params, request }) => {
    const id = parseInt(params.id as string);
    const body = await request.json();
    
    const serpResult = sampleSerpResults.find(s => s.id === id);
    
    if (!serpResult) {
      return HttpResponse.json(
        { message: 'SERP result not found' },
        { status: 404 }
      );
    }
    
    const updatedSerpResult: SerpResult = {
      ...serpResult,
      ...body
    };
    
    return HttpResponse.json(updatedSerpResult);
  }),
  
  http.delete('/api/serp-results/:id', ({ params }) => {
    const id = parseInt(params.id as string);
    const serpResultExists = sampleSerpResults.some(s => s.id === id);
    
    if (!serpResultExists) {
      return HttpResponse.json(
        { message: 'SERP result not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({ success: true });
  }),
  
  // Refresh opportunities endpoint
  http.post('/api/refresh-opportunities', () => {
    return HttpResponse.json({ count: 5 });
  })
];