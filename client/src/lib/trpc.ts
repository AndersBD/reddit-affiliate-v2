import { createTRPCReact } from '@trpc/react-query';
import type { RedditThread, AffiliateProgram, CommentTemplate, CrawlHistory } from './types';

// Define a simpler type for the client that works with tRPC
export type AppRouter = any; // We use 'any' for simplicity

// Create a tRPC react client
export const trpc = createTRPCReact<AppRouter>();

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