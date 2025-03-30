import React from 'react';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../client/src/lib/queryClient';

// Create a custom render function that includes providers
export function renderWithProviders(
  ui: React.ReactElement,
  { route = '/' } = {}
) {
  // Set the route
  window.history.pushState({}, '', route);
  
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

// Reset handlers for tests
export function resetHandlers() {
  queryClient.clear();
}

// Export everything from testing-library
export * from '@testing-library/react';