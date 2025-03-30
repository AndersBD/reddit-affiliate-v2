import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders, resetHandlers } from '../../../tests/utils';
import { Route } from 'wouter';
import OpportunitiesPage from './Opportunities';
import { http } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../../../tests/mocks/handlers';

// Create a test server
const server = setupServer(...handlers);

// Setup before/after hooks
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  resetHandlers();
});
afterAll(() => server.close());

// Mock components used in Opportunities.tsx
vi.mock('../components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-trigger">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-description">{children}</div>,
}));

describe('OpportunitiesPage Component', () => {
  it('should render the opportunities heading', async () => {
    // Render the component with providers
    renderWithProviders(
      <Route path="/">
        <OpportunitiesPage />
      </Route>
    );
    
    // Basic test - just check that the component renders with the title
    const heading = await screen.findByRole('heading', { name: /opportunities/i });
    expect(heading).toBeDefined();
  });
});