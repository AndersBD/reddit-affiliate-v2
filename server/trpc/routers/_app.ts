import { createTRPCRouter } from "../trpc";
import { threadRouter } from "./thread";
import { affiliateProgramRouter } from "./affiliateProgram";
import { commentTemplateRouter } from "./commentTemplate";
import { crawlHistoryRouter } from "./crawlHistory";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  thread: threadRouter,
  affiliateProgram: affiliateProgramRouter,
  commentTemplate: commentTemplateRouter,
  crawlHistory: crawlHistoryRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;