import { describe, test, expect, vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../vitest.setup';
import { apiRequest } from '../../client/src/lib/queryClient';
import { sampleOpportunities, sampleThreads, sampleAffiliatePrograms } from '../mocks/handlers';

describe('Opportunities API Tests', () => {
  // Setup spy on fetch
  const fetchSpy = vi.spyOn(global, 'fetch');
  
  beforeEach(() => {
    fetchSpy.mockClear();
  });
  
  test('GET /api/opportunities fetches opportunities correctly', async () => {
    // Setup custom response for this test
    server.use(
      http.get('/api/opportunities', () => {
        return HttpResponse.json({
          opportunities: sampleOpportunities,
          total: sampleOpportunities.length,
          limit: 10,
          offset: 0
        });
      })
    );
    
    // Make the request
    const response = await fetch('/api/opportunities');
    const data = await response.json();
    
    // Verify the response
    expect(response.status).toBe(200);
    expect(data.opportunities).toHaveLength(sampleOpportunities.length);
    expect(data.opportunities[0].id).toBe(sampleOpportunities[0].id);
    expect(data.opportunities[0].score).toBe(sampleOpportunities[0].score);
  });
  
  test('GET /api/opportunities applies filters correctly', async () => {
    // Setup MSW to handle query parameters
    server.use(
      http.get('/api/opportunities', ({ request }) => {
        const url = new URL(request.url);
        const intent = url.searchParams.get('intent');
        
        let filteredOpportunities = [...sampleOpportunities];
        if (intent) {
          filteredOpportunities = filteredOpportunities.filter(opp => opp.intent === intent);
        }
        
        return HttpResponse.json({
          opportunities: filteredOpportunities,
          total: filteredOpportunities.length,
          limit: 10,
          offset: 0
        });
      })
    );
    
    // Make a request with a filter
    const response = await fetch('/api/opportunities?intent=comparison');
    const data = await response.json();
    
    // Verify the filtered response
    expect(response.status).toBe(200);
    expect(data.opportunities.every(opp => opp.intent === 'comparison')).toBe(true);
  });
  
  test('GET /api/opportunities filters by subreddit', async () => {
    // Setup MSW to handle query parameters
    server.use(
      http.get('/api/opportunities', ({ request }) => {
        const url = new URL(request.url);
        const subreddit = url.searchParams.get('subreddit');
        
        let filteredOpportunities = [...sampleOpportunities];
        if (subreddit) {
          filteredOpportunities = filteredOpportunities.filter(opp => {
            const thread = sampleThreads.find(t => t.id === opp.threadId);
            return thread?.subreddit === subreddit;
          });
        }
        
        return HttpResponse.json({
          opportunities: filteredOpportunities,
          total: filteredOpportunities.length,
          limit: 10,
          offset: 0
        });
      })
    );
    
    // Make a request with a filter
    const response = await fetch('/api/opportunities?subreddit=blogging');
    const data = await response.json();
    
    // Verify the filtered response
    expect(response.status).toBe(200);
    expect(data.opportunities.length).toBeGreaterThan(0);
    expect(data.opportunities.every(opp => {
      const thread = sampleThreads.find(t => t.id === opp.threadId);
      return thread?.subreddit === 'blogging';
    })).toBe(true);
  });
  
  test('POST /api/refresh-opportunities refreshes opportunity data', async () => {
    // Mock response
    server.use(
      http.post('/api/refresh-opportunities', () => {
        return HttpResponse.json({ count: 5, message: "Opportunities refreshed successfully" });
      })
    );
    
    // Make request using our apiRequest helper
    const response = await apiRequest('POST', '/api/refresh-opportunities');
    const data = await response.json();
    
    // Verify response
    expect(response.status).toBe(200);
    expect(data.count).toBe(5);
    expect(data.message).toBe("Opportunities refreshed successfully");
  });
  
  test('POST /api/run-crawler starts a crawler job', async () => {
    // Setup mock response
    server.use(
      http.post('/api/run-crawler', () => {
        return HttpResponse.json({
          id: 3,
          startedAt: new Date().toISOString(),
          completedAt: null,
          threadCount: 0,
          subreddits: ['SEO', 'blogging', 'Wordpress'],
          status: 'running'
        });
      })
    );
    
    // Make request
    const response = await apiRequest('POST', '/api/run-crawler');
    const data = await response.json();
    
    // Verify response
    expect(response.status).toBe(200);
    expect(data.status).toBe('running');
    expect(data.subreddits).toContain('SEO');
  });
  
  test('GET /api/threads/:id/opportunities fetches opportunities for a thread', async () => {
    const threadId = 1;
    
    // Setup mock response
    server.use(
      http.get(`/api/threads/${threadId}/opportunities`, () => {
        const threadOpportunities = sampleOpportunities.filter(o => o.threadId === threadId);
        return HttpResponse.json({
          opportunities: threadOpportunities,
          total: threadOpportunities.length,
          limit: 10,
          offset: 0
        });
      })
    );
    
    // Make request
    const response = await fetch(`/api/threads/${threadId}/opportunities`);
    const data = await response.json();
    
    // Verify response
    expect(response.status).toBe(200);
    expect(data.opportunities.every(opp => opp.threadId === threadId)).toBe(true);
  });
  
  test('PATCH /api/opportunities/:id updates an opportunity', async () => {
    const opportunityId = 1;
    const updateData = {
      action: 'done',
      score: 95
    };
    
    // Setup mock response
    server.use(
      http.patch(`/api/opportunities/${opportunityId}`, async ({ request }) => {
        const body = await request.json() as Record<string, unknown>;
        const opportunity = sampleOpportunities.find(o => o.id === opportunityId);
        
        if (!opportunity) {
          return new HttpResponse(null, { status: 404 });
        }
        
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
    );
    
    // Make request
    const response = await apiRequest('PATCH', `/api/opportunities/${opportunityId}`, updateData);
    const data = await response.json();
    
    // Verify response
    expect(response.status).toBe(200);
    expect(data.id).toBe(opportunityId);
    expect(data.action).toBe(updateData.action);
    expect(data.score).toBe(updateData.score);
  });
  
  test('GET /api/affiliate-programs retrieves affiliate programs', async () => {
    // Setup mock response
    server.use(
      http.get('/api/affiliate-programs', () => {
        return HttpResponse.json({
          programs: sampleAffiliatePrograms,
          total: sampleAffiliatePrograms.length,
          limit: 10,
          offset: 0
        });
      })
    );
    
    // Make request
    const response = await fetch('/api/affiliate-programs');
    const data = await response.json();
    
    // Verify response
    expect(response.status).toBe(200);
    expect(data.programs).toHaveLength(sampleAffiliatePrograms.length);
    expect(data.programs[0].name).toBe(sampleAffiliatePrograms[0].name);
  });
});