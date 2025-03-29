import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { storage } from "../../storage";

export const crawlHistoryRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return await storage.getCrawlHistory();
  }),
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const history = await storage.getCrawlHistoryById(input.id);
      if (!history) {
        throw new Error("Crawl history not found");
      }
      return history;
    }),
  
  create: protectedProcedure
    .input(z.object({
      startedAt: z.string(),
      completedAt: z.string().nullable(),
      threadCount: z.number(),
      subreddits: z.array(z.string()),
      status: z.enum(['running', 'completed', 'failed']),
      error: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await storage.createCrawlHistory(input);
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        completedAt: z.string().nullable().optional(),
        threadCount: z.number().optional(),
        status: z.enum(['running', 'completed', 'failed']).optional(),
        error: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      return await storage.updateCrawlHistory(input.id, input.data);
    }),
  
  runCrawler: protectedProcedure
    .input(z.object({
      subreddits: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      return await storage.runCrawler(input.subreddits);
    }),
});