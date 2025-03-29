import { describe, test, expect, vi } from 'vitest';
import OpportunityCard from './OpportunityCard';
import { render, screen, fireEvent } from '../../tests/utils';
import { RedditThread } from '@/lib/types';

describe('OpportunityCard', () => {
  // Sample thread data for tests
  const mockThread: RedditThread = {
    id: 1,
    title: "Which CRM software is best for a small business?",
    body: "I run a small marketing agency with 5 employees and looking for CRM software that's easy to use but powerful. Has anyone tried Pipedrive, HubSpot, or Salesforce?",
    subreddit: "smallbusiness",
    upvotes: 45,
    commentCount: 23,
    url: "https://reddit.com/r/smallbusiness/posts/123456",
    intentType: "QUESTION",
    hasSerp: true,
    serpRank: "3",
    matchedKeywords: ["CRM", "HubSpot", "Salesforce"],
    affiliateMatch: 85,
    score: 78,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString()
  };

  test('renders thread information correctly', () => {
    const mockOnClick = vi.fn();
    render(<OpportunityCard thread={mockThread} onClick={mockOnClick} />);
    
    // Check if title is rendered
    expect(screen.getByText(mockThread.title)).toBeInTheDocument();
    
    // Check if subreddit is rendered
    expect(screen.getByText(/r\/smallbusiness/)).toBeInTheDocument();
    
    // Check if upvotes are rendered
    expect(screen.getByText(/45 upvotes/)).toBeInTheDocument();
    
    // Check if time ago is rendered (2d ago)
    expect(screen.getByText(/2d ago/)).toBeInTheDocument();
    
    // Check if intent type badge is rendered
    expect(screen.getByText('QUESTION')).toBeInTheDocument();
    
    // Check if SERP rank badge is rendered
    expect(screen.getByText('SERP #3')).toBeInTheDocument();
    
    // Check if affiliate match percentage is rendered
    expect(screen.getByText('85% Match')).toBeInTheDocument();
    
    // Check if keywords are rendered
    expect(screen.getByText('CRM')).toBeInTheDocument();
    expect(screen.getByText('HubSpot')).toBeInTheDocument();
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
    
    // Check if truncated body is rendered
    expect(screen.getByText(/I run a small marketing agency/)).toBeInTheDocument();
  });
  
  test('truncates body text correctly', () => {
    const longBodyThread = {
      ...mockThread,
      body: "A".repeat(200) // Create a body longer than 150 chars
    };
    
    const mockOnClick = vi.fn();
    render(<OpportunityCard thread={longBodyThread} onClick={mockOnClick} />);
    
    // Check if body is truncated and ends with ellipsis
    const bodyText = screen.getByText(/A+\.\.\./);
    expect(bodyText).toBeInTheDocument();
    expect(bodyText.textContent?.length).toBeLessThanOrEqual(153); // 150 chars + "..."
  });
  
  test('shows +more badge when there are more than 3 keywords', () => {
    const manyKeywordsThread = {
      ...mockThread,
      matchedKeywords: ["CRM", "HubSpot", "Salesforce", "Marketing", "Software"]
    };
    
    const mockOnClick = vi.fn();
    render(<OpportunityCard thread={manyKeywordsThread} onClick={mockOnClick} />);
    
    // Check if +more badge is rendered
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    
    // Only the first 3 keywords should be shown
    expect(screen.getByText('CRM')).toBeInTheDocument();
    expect(screen.getByText('HubSpot')).toBeInTheDocument();
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
    expect(screen.queryByText('Marketing')).not.toBeInTheDocument();
  });
  
  test('calls onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<OpportunityCard thread={mockThread} onClick={mockOnClick} />);
    
    // Click the card
    fireEvent.click(screen.getByText(mockThread.title));
    
    // Check if onClick was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  test('calls onClick when Generate Comment button is clicked', () => {
    const mockOnClick = vi.fn();
    render(<OpportunityCard thread={mockThread} onClick={mockOnClick} />);
    
    // Click the Generate Comment button
    fireEvent.click(screen.getByText('Generate Comment'));
    
    // Check if onClick was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
  
  test('handles different time formats correctly', () => {
    const minutesAgoThread = {
      ...mockThread,
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    };
    
    const { rerender } = render(
      <OpportunityCard thread={minutesAgoThread} onClick={vi.fn()} />
    );
    
    // Check minutes ago format
    expect(screen.getByText(/10m ago/)).toBeInTheDocument();
    
    // Test hours ago
    const hoursAgoThread = {
      ...mockThread,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    };
    
    rerender(<OpportunityCard thread={hoursAgoThread} onClick={vi.fn()} />);
    expect(screen.getByText(/5h ago/)).toBeInTheDocument();
    
    // Test weeks ago
    const weeksAgoThread = {
      ...mockThread,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    };
    
    rerender(<OpportunityCard thread={weeksAgoThread} onClick={vi.fn()} />);
    expect(screen.getByText(/2w ago/)).toBeInTheDocument();
    
    // Test months ago
    const monthsAgoThread = {
      ...mockThread,
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    };
    
    rerender(<OpportunityCard thread={monthsAgoThread} onClick={vi.fn()} />);
    expect(screen.getByText(/2mo ago/)).toBeInTheDocument();
  });
});