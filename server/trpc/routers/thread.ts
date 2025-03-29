import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { storage } from "../../storage";
import { ThreadFilterOptions } from "../../storage";

export const threadRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(
      z.object({
        subreddit: z.string().optional(),
        intentType: z.string().optional(),
        serpRank: z.string().optional(),
        affiliateProgram: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
        sortBy: z.string().optional(),
        sortDirection: z.enum(["asc", "desc"]).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      // Convert input to ThreadFilterOptions
      const filterOptions: ThreadFilterOptions = input || {};
      const threads = await storage.getThreads(filterOptions);
      
      return {
        threads,
        count: threads.length,
      };
    }),
    
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const thread = await storage.getThreadById(input.id);
      if (!thread) {
        throw new Error("Thread not found");
      }
      return thread;
    }),
  
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      subreddit: z.string(),
      permalink: z.string(),
      upvotes: z.number(),
      commentCount: z.number(),
      author: z.string(),
      flair: z.string().optional(),
      score: z.number(),
      intentType: z.string().optional(),
      serpRank: z.number().optional(),
      hasSerp: z.boolean(),
      matchedKeywords: z.array(z.string()),
      affiliateMatch: z.number(),
    }))
    .mutation(async ({ input }) => {
      return await storage.createThread(input);
    }),
    
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        title: z.string().optional(),
        body: z.string().optional(),
        subreddit: z.string().optional(),
        permalink: z.string().optional(),
        upvotes: z.number().optional(),
        commentCount: z.number().optional(),
        author: z.string().optional(),
        flair: z.string().optional(),
        score: z.number().optional(),
        intentType: z.string().optional(),
        serpRank: z.number().optional(),
        hasSerp: z.boolean().optional(),
        matchedKeywords: z.array(z.string()).optional(),
        affiliateMatch: z.number().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      return await storage.updateThread(input.id, input.data);
    }),
    
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await storage.deleteThread(input.id);
    }),
});