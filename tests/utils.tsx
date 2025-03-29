import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender } from '@testing-library/react';
import { ReactElement } from 'react';
import { trpc } from '../client/src/lib/trpc';
import { createMemoryHistory } from 'history';
import { Router } from 'wouter';

// Create a custom render function that includes providers
export function render(
  ui: ReactElement,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <trpc.Provider client={{} as any} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <Router history={history}>{children}</Router>
        </QueryClientProvider>
      </trpc.Provider>
    );
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper, ...renderOptions }),
    history,
    queryClient,
  };
}

// Re-export everything from testing-library
export * from '@testing-library/react';