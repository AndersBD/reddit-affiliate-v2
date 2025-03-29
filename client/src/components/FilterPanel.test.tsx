import { describe, test, expect, vi } from 'vitest';
import FilterPanel from './FilterPanel';
import { render, screen, fireEvent, waitFor } from '../../tests/utils';
import { server } from '../../vitest.setup';
import { http, HttpResponse } from 'msw';
import { ThreadFilterOptions } from '@/lib/types';
import { sampleThreads, sampleAffiliatePrograms } from '../../tests/mocks/handlers';

describe('FilterPanel', () => {
  // Mock initial filters
  const initialFilters: ThreadFilterOptions = {
    subreddit: undefined,
    intentType: undefined,
    serpRank: undefined,
    affiliateProgram: undefined,
    limit: 10,
    offset: 0
  };

  // Setup MSW handlers to mock API responses
  beforeEach(() => {
    // Add specific handlers for this test
    server.use(
      http.get('/api/threads', () => {
        return HttpResponse.json({
          threads: sampleThreads,
          total: sampleThreads.length,
          limit: 10,
          offset: 0
        });
      }),
      
      http.get('/api/affiliate-programs', () => {
        return HttpResponse.json(sampleAffiliatePrograms);
      })
    );
  });

  test('renders filter dropdowns with default values', async () => {
    const mockOnFilterChange = vi.fn();
    render(<FilterPanel filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Check if all major filter sections are rendered
    expect(screen.getByLabelText(/Subreddit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Intent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/SERP Rank/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Affiliate Program/i)).toBeInTheDocument();
    
    // Check buttons
    expect(screen.getByText('Reset Filters')).toBeInTheDocument();
    expect(screen.getByText('Apply Filters')).toBeInTheDocument();
  });
  
  test('applies filters when form is submitted', async () => {
    const mockOnFilterChange = vi.fn();
    render(<FilterPanel filters={initialFilters} onFilterChange={mockOnFilterChange} />);
    
    // Click Apply Filters button (without changing anything)
    fireEvent.click(screen.getByText('Apply Filters'));
    
    // Check if onFilterChange was called with the right parameters
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        subreddit: undefined,
        intentType: undefined,
        serpRank: undefined,
        affiliateProgram: undefined
      });
    });
  });
  
  test('resets filters when Reset button is clicked', async () => {
    // Start with some filters applied
    const appliedFilters: ThreadFilterOptions = {
      subreddit: 'SEO',
      intentType: 'recommendation',
      serpRank: '1',
      affiliateProgram: 'Jasper AI',
      limit: 10,
      offset: 0
    };
    
    const mockOnFilterChange = vi.fn();
    render(<FilterPanel filters={appliedFilters} onFilterChange={mockOnFilterChange} />);
    
    // Click Reset Filters button
    fireEvent.click(screen.getByText('Reset Filters'));
    
    // Check if onFilterChange was called with all filters cleared
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        subreddit: undefined,
        intentType: undefined,
        serpRank: undefined,
        affiliateProgram: undefined
      });
    });
  });
  
  test('updates filters when props change', async () => {
    const mockOnFilterChange = vi.fn();
    const { rerender } = render(
      <FilterPanel filters={initialFilters} onFilterChange={mockOnFilterChange} />
    );
    
    // Update with new filters
    const newFilters: ThreadFilterOptions = {
      subreddit: 'SEO',
      intentType: 'recommendation',
      limit: 10,
      offset: 0
    };
    
    // Re-render with new props
    rerender(<FilterPanel filters={newFilters} onFilterChange={mockOnFilterChange} />);
    
    // Verify filters are updated in the component state
    fireEvent.click(screen.getByText('Apply Filters'));
    
    await waitFor(() => {
      expect(mockOnFilterChange).toHaveBeenCalledWith({
        subreddit: 'SEO',
        intentType: 'recommendation',
        serpRank: undefined,
        affiliateProgram: undefined
      });
    });
  });
});