import { rest } from 'msw';
import type { RedditThread, AffiliateProgram, CommentTemplate, CrawlHistory } from '../../client/src/lib/types';

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

// API handler definitions for MSW
export const handlers = [
  // Threads endpoints
  rest.get('/api/threads', (req, res, ctx) => {
    // Support query parameters like in our API
    const subreddit = req.url.searchParams.get('subreddit');
    
    let filteredThreads = [...sampleThreads];
    if (subreddit) {
      filteredThreads = filteredThreads.filter(thread => thread.subreddit === subreddit);
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        threads: filteredThreads,
        total: filteredThreads.length,
        limit: 10,
        offset: 0
      })
    );
  }),

  rest.get('/api/threads/:id', (req, res, ctx) => {
    const { id } = req.params;
    const thread = sampleThreads.find(t => t.id === parseInt(id as string));
    
    if (!thread) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Thread not found' })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json(thread)
    );
  }),

  // Affiliate Programs endpoints
  rest.get('/api/affiliate-programs', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(sampleAffiliatePrograms)
    );
  }),

  // Comment Templates endpoints
  rest.get('/api/comment-templates', (req, res, ctx) => {
    const type = req.url.searchParams.get('type');
    
    let filteredTemplates = [...sampleCommentTemplates];
    if (type) {
      filteredTemplates = filteredTemplates.filter(template => template.type === type);
    }
    
    return res(
      ctx.status(200),
      ctx.json(filteredTemplates)
    );
  }),

  // Crawl history endpoints
  rest.get('/api/crawl-history', (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json(sampleCrawlHistory)
    );
  }),

  // Generate comment endpoint
  rest.post('/api/generate-comment', async (req, res, ctx) => {
    const { threadId, affiliateProgramId, templateId } = await req.json();
    
    // Get the relevant objects
    const thread = sampleThreads.find(t => t.id === threadId);
    const program = sampleAffiliatePrograms.find(p => p.id === affiliateProgramId);
    const template = sampleCommentTemplates.find(t => t.id === templateId);
    
    if (!thread || !program || !template) {
      return res(
        ctx.status(404),
        ctx.json({ 
          message: `${!thread ? 'Thread' : !program ? 'Affiliate program' : 'Template'} not found` 
        })
      );
    }

    let comment = template.template;
    comment = comment.replaceAll('{{program}}', program.name);
    comment = comment.replaceAll('{{link}}', program.link);
    comment = comment.replaceAll('{{promo_code}}', program.promoCode || '');
    comment = comment.replaceAll('{{benefit}}', 'It has specialized templates for blog posts and articles');
    
    return res(
      ctx.status(200),
      ctx.json({ comment })
    );
  }),

  // Run crawler endpoint
  rest.post('/api/run-crawler', async (req, res, ctx) => {
    const { subreddits } = await req.json();
    
    const newCrawl: CrawlHistory = {
      id: 3,
      startedAt: new Date().toISOString(),
      completedAt: null,
      threadCount: 0,
      subreddits,
      status: 'running'
    };
    
    return res(
      ctx.status(200),
      ctx.json(newCrawl)
    );
  })
];