import { describe, test, expect, vi } from 'vitest';
import OpportunityList from './OpportunityList';
import { render, screen, fireEvent } from '../../tests/utils';
import { sampleThreads } from '../../tests/mocks/handlers';
import { RedditThread } from '@/lib/types';

describe('OpportunityList', () => {
  // Sample data for tests
  const mockData = {
    threads: sampleThreads.slice(0, 5),
    total: 20,
    limit: 10,
    offset: 0
  };

  test('renders loading state correctly', () => {
    render(
      <OpportunityList 
        isLoading={true}
        error={null}
        data={null}
        onThreadClick={vi.fn()}
        onPageChange={vi.fn()}
        currentOffset={0}
        pageSize={10}
      />
    );
    
    // Check if loading skeletons are displayed
    expect(screen.getAllByRole('status').length).toBeGreaterThan(0);
  });
  
  test('renders error state correctly', () => {
    const errorMessage = 'Failed to load data';
    render(
      <OpportunityList 
        isLoading={false}
        error={new Error(errorMessage)}
        data={null}
        onThreadClick={vi.fn()}
        onPageChange={vi.fn()}
        currentOffset={0}
        pageSize={10}
      />
    );
    
    // Check if error message is displayed
    expect(screen.getByText('Error loading opportunities')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  
  test('renders thread list correctly', () => {
    render(
      <OpportunityList 
        isLoading={false}
        error={null}
        data={mockData}
        onThreadClick={vi.fn()}
        onPageChange={vi.fn()}
        currentOffset={0}
        pageSize={10}
      />
    );
    
    // Check for header info
    expect(screen.getByText('Latest Opportunities')).toBeInTheDocument();
    expect(screen.getByText('20 found')).toBeInTheDocument();
    
    // Check if all threads are displayed
    mockData.threads.forEach(thread => {
      expect(screen.getByText(thread.title)).toBeInTheDocument();
    });
  });
  
  test('displays empty state when no threads', () => {
    render(
      <OpportunityList 
        isLoading={false}
        error={null}
        data={{ threads: [], total: 0 }}
        onThreadClick={vi.fn()}
        onPageChange={vi.fn()}
        currentOffset={0}
        pageSize={10}
      />
    );
    
    expect(screen.getByText('No opportunities found matching your criteria.')).toBeInTheDocument();
  });
  
  test('handles thread click', () => {
    const mockClick = vi.fn();
    render(
      <OpportunityList 
        isLoading={false}
        error={null}
        data={mockData}
        onThreadClick={mockClick}
        onPageChange={vi.fn()}
        currentOffset={0}
        pageSize={10}
      />
    );
    
    // Click the first thread card
    fireEvent.click(screen.getByText(mockData.threads[0].title));
    
    // Check if click handler was called with the right thread
    expect(mockClick).toHaveBeenCalledWith(mockData.threads[0]);
  });
  
  test('pagination navigates correctly', () => {
    const mockPageChange = vi.fn();
    render(
      <OpportunityList 
        isLoading={false}
        error={null}
        data={mockData}
        onThreadClick={vi.fn()}
        onPageChange={mockPageChange}
        currentOffset={0}
        pageSize={10}
      />
    );
    
    // Click next page
    fireEvent.click(screen.getByLabelText('Go to next page'));
    expect(mockPageChange).toHaveBeenCalledWith(2);
    
    // Reset mock
    mockPageChange.mockReset();
    
    // Click page 2
    fireEvent.click(screen.getByText('2'));
    expect(mockPageChange).toHaveBeenCalledWith(2);
  });
  
  test('pagination shows correct page info', () => {
    render(
      <OpportunityList 
        isLoading={false}
        error={null}
        data={mockData}
        onThreadClick={vi.fn()}
        onPageChange={vi.fn()}
        currentOffset={0}
        pageSize={10}
      />
    );
    
    // Check pagination text
    expect(screen.getByText(/Showing 1 to 10 of 20 results/)).toBeInTheDocument();
  });
});