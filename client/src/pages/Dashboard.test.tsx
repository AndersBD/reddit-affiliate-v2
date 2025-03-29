import { describe, test, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { render, screen, fireEvent, waitFor } from '../../tests/utils';
import { server } from '../../vitest.setup';
import { http, HttpResponse } from 'msw';
import { sampleThreads } from '../../tests/mocks/handlers';

describe('Dashboard', () => {
  // Setup MSW handlers for API responses
  beforeEach(() => {
    server.use(
      http.get('/api/threads', ({ request }) => {
        const url = new URL(request.url);
        const limit = Number(url.searchParams.get('limit') || 10);
        const offset = Number(url.searchParams.get('offset') || 0);
        const subreddit = url.searchParams.get('subreddit');
        const intentType = url.searchParams.get('intentType');
        const serpRank = url.searchParams.get('serpRank');
        
        // Filter threads based on query parameters
        let filteredThreads = [...sampleThreads];
        
        if (subreddit) {
          filteredThreads = filteredThreads.filter(thread => 
            thread.subreddit === subreddit);
        }
        
        if (intentType) {
          filteredThreads = filteredThreads.filter(thread => 
            thread.intentType === intentType);
        }
        
        if (serpRank) {
          filteredThreads = filteredThreads.filter(thread => 
            thread.serpRank === serpRank);
        }
        
        // Handle pagination
        const paginatedThreads = filteredThreads.slice(offset, offset + limit);
        
        return HttpResponse.json({
          threads: paginatedThreads,
          total: filteredThreads.length,
          limit,
          offset
        });
      })
    );
  });
  
  test('renders dashboard with filters and opportunity list', async () => {
    render(<Dashboard />);
    
    // Verify page title is rendered
    expect(screen.getByText('Affiliate Opportunities')).toBeInTheDocument();
    
    // Verify filter buttons are rendered
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Top Scoring')).toBeInTheDocument();
    expect(screen.getByText('Google Ranked')).toBeInTheDocument();
    
    // Verify filter panel is rendered
    expect(screen.getByLabelText('Subreddit')).toBeInTheDocument();
    expect(screen.getByLabelText('Intent')).toBeInTheDocument();
    expect(screen.getByLabelText('SERP Rank')).toBeInTheDocument();
    expect(screen.getByLabelText('Affiliate Program')).toBeInTheDocument();
    
    // Wait for the opportunity list to load
    await waitFor(() => {
      expect(screen.getByText('Latest Opportunities')).toBeInTheDocument();
    });
    
    // Verify threads are loaded
    await waitFor(() => {
      expect(screen.getByText(sampleThreads[0].title)).toBeInTheDocument();
    });
  });
  
  test('applies filters when filter panel is submitted', async () => {
    render(<Dashboard />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Latest Opportunities')).toBeInTheDocument();
    });
    
    // Click the apply filters button without changing anything
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Verify the threads are still displayed
    await waitFor(() => {
      expect(screen.getByText(sampleThreads[0].title)).toBeInTheDocument();
    });
  });
  
  test('opens thread preview modal when a thread is clicked', async () => {
    render(<Dashboard />);
    
    // Wait for threads to load
    await waitFor(() => {
      expect(screen.getByText(sampleThreads[0].title)).toBeInTheDocument();
    });
    
    // Click on a thread
    fireEvent.click(screen.getByText(sampleThreads[0].title));
    
    // Verify modal opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Thread Details')).toBeInTheDocument();
    });
    
    // Check thread content is displayed in modal
    expect(screen.getByText(sampleThreads[0].title)).toBeInTheDocument();
    expect(screen.getByText(sampleThreads[0].content)).toBeInTheDocument();
    
    // Close the modal
    fireEvent.click(screen.getByText('Close'));
    
    // Verify modal closes
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  
  test('applies quick filter buttons', async () => {
    render(<Dashboard />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Latest Opportunities')).toBeInTheDocument();
    });
    
    // Click the Google Ranked button
    fireEvent.click(screen.getByText('Google Ranked'));
    
    // Verify the API is called with the right params
    await waitFor(() => {
      // This will pass if the MSW handler correctly filters the threads
      expect(screen.getByText(`${sampleThreads.filter(t => t.serpRank === 'Top 10').length} found`)).toBeInTheDocument();
    });
    
    // Click the Top Scoring button
    fireEvent.click(screen.getByText('Top Scoring'));
    
    // Wait for the sorting to apply
    await waitFor(() => {
      // This check ensures the action changed the state
      expect(screen.getByText(`${sampleThreads.length} found`)).toBeInTheDocument();
    });
  });
});