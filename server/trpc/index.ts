import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createContext } from './context';
import { appRouter } from './routers/_app';

export { appRouter } from './routers/_app';
export type { AppRouter } from './routers/_app';

// Export tRPC express middleware
export const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});