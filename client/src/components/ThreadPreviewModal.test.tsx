import { describe, test, expect, vi, beforeEach } from 'vitest';
import ThreadPreviewModal from './ThreadPreviewModal';
import { render, screen, fireEvent, waitFor } from '../../tests/utils';
import { server } from '../../vitest.setup';
import { http, HttpResponse } from 'msw';
import { sampleThreads, sampleAffiliatePrograms, sampleCommentTemplates } from '../../tests/mocks/handlers';
import * as toastModule from '@/hooks/use-toast';

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn()
  }
});

describe('ThreadPreviewModal', () => {
  const mockThread = sampleThreads[0];
  const mockOnClose = vi.fn();
  
  // Setup MSW handlers for API responses
  beforeEach(() => {
    server.use(
      http.get('/api/affiliate-programs', () => {
        return HttpResponse.json(sampleAffiliatePrograms);
      }),
      
      http.get('/api/comment-templates', () => {
        return HttpResponse.json(sampleCommentTemplates);
      }),
      
      http.post('/api/generate-comment', () => {
        return HttpResponse.json({
          comment: "This is a generated affiliate comment for the selected program and template."
        });
      })
    );
    
    mockOnClose.mockClear();
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());
    vi.spyOn(toastModule, 'useToast').mockImplementation(() => ({
      toast: vi.fn()
    }));
  });
  
  test('renders modal with thread details when open', async () => {
    render(
      <ThreadPreviewModal 
        isOpen={true}
        onClose={mockOnClose}
        thread={mockThread}
      />
    );
    
    // Check if the modal title shows the thread title
    expect(screen.getByText(mockThread.title)).toBeInTheDocument();
    
    // Check if thread content is shown
    expect(screen.getByText(mockThread.body)).toBeInTheDocument();
    
    // Check if affiliate section is shown
    expect(screen.getByText('Affiliate Opportunities')).toBeInTheDocument();
    expect(screen.getByText(`${mockThread.affiliateMatch}% Match`)).toBeInTheDocument();
    
    // Check if generate comment form is displayed
    expect(screen.getByText('Generate Affiliate Comment')).toBeInTheDocument();
    expect(screen.getByLabelText('Affiliate Program')).toBeInTheDocument();
    expect(screen.getByLabelText('Comment Template')).toBeInTheDocument();
  });
  
  test('loads affiliate programs and templates', async () => {
    render(
      <ThreadPreviewModal 
        isOpen={true}
        onClose={mockOnClose}
        thread={mockThread}
      />
    );
    
    // Open the affiliate program dropdown
    fireEvent.click(screen.getByLabelText('Affiliate Program'));
    
    // Check if affiliate programs are loaded
    await waitFor(() => {
      sampleAffiliatePrograms.forEach(program => {
        expect(screen.getByText(program.name)).toBeInTheDocument();
      });
    });
    
    // Close the dropdown
    fireEvent.click(document.body);
    
    // Open the template dropdown
    fireEvent.click(screen.getByLabelText('Comment Template'));
    
    // Check if templates are loaded
    await waitFor(() => {
      sampleCommentTemplates.forEach(template => {
        expect(screen.getByText(template.name)).toBeInTheDocument();
      });
    });
  });
  
  test('generates a comment when form is submitted', async () => {
    render(
      <ThreadPreviewModal 
        isOpen={true}
        onClose={mockOnClose}
        thread={mockThread}
      />
    );
    
    // Select an affiliate program
    fireEvent.click(screen.getByLabelText('Affiliate Program'));
    await waitFor(() => {
      expect(screen.getByText(sampleAffiliatePrograms[0].name)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(sampleAffiliatePrograms[0].name));
    
    // Select a template
    fireEvent.click(screen.getByLabelText('Comment Template'));
    await waitFor(() => {
      expect(screen.getByText(sampleCommentTemplates[0].name)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(sampleCommentTemplates[0].name));
    
    // Click generate button
    fireEvent.click(screen.getByText('Generate'));
    
    // Check if comment is generated
    await waitFor(() => {
      expect(screen.getByText('This is a generated affiliate comment for the selected program and template.')).toBeInTheDocument();
    });
    
    // Check if Copy to Clipboard button appears
    expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
  });
  
  test('copies generated comment to clipboard', async () => {
    render(
      <ThreadPreviewModal 
        isOpen={true}
        onClose={mockOnClose}
        thread={mockThread}
      />
    );
    
    // Select program and template
    fireEvent.click(screen.getByLabelText('Affiliate Program'));
    await waitFor(() => {
      expect(screen.getByText(sampleAffiliatePrograms[0].name)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(sampleAffiliatePrograms[0].name));
    
    fireEvent.click(screen.getByLabelText('Comment Template'));
    await waitFor(() => {
      expect(screen.getByText(sampleCommentTemplates[0].name)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText(sampleCommentTemplates[0].name));
    
    // Generate comment
    fireEvent.click(screen.getByText('Generate'));
    
    // Wait for comment to be generated
    await waitFor(() => {
      expect(screen.getByText('This is a generated affiliate comment for the selected program and template.')).toBeInTheDocument();
    });
    
    // Click copy to clipboard
    fireEvent.click(screen.getByText('Copy to Clipboard'));
    
    // Verify clipboard API was called
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'This is a generated affiliate comment for the selected program and template.'
    );
  });
  
  test('calls onClose when modal is closed', async () => {
    render(
      <ThreadPreviewModal 
        isOpen={true}
        onClose={mockOnClose}
        thread={mockThread}
      />
    );
    
    // Find close button/X and click it
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    // Verify onClose was called
    expect(mockOnClose).toHaveBeenCalled();
  });
});