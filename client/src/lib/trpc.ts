import { createTRPCProxyClient, createTRPCReact, httpBatchLink } from '@trpc/react-query';
import superjson from 'superjson';
import type { RedditThread, AffiliateProgram, CommentTemplate, CrawlHistory } from './types';

// Define a simpler type for the client that works with tRPC
export type AppRouter = any; // We use 'any' for simplicity

// Create a tRPC react client
export const trpc = createTRPCReact<AppRouter>();

// Export a client for direct usage when needed
export const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
      transformer: superjson,
    }),
  ],
});

// Define types for the expected responses 
export interface ThreadsResponse {
  threads: RedditThread[];
  count: number;
}

export interface ThreadResponse {
  thread: RedditThread;
}

export interface AffiliateProgramsResponse {
  programs: AffiliateProgram[];
}

export interface CommentTemplatesResponse {
  templates: CommentTemplate[];
}

export interface CrawlHistoryResponse {
  history: CrawlHistory[];
}