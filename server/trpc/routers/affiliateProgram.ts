import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { storage } from "../../storage";

export const affiliateProgramRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const programs = await storage.getAffiliatePrograms();
    return programs;
  }),
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const program = await storage.getAffiliateProgramById(input.id);
      if (!program) {
        throw new Error("Affiliate program not found");
      }
      return program;
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string(),
      link: z.string(),
      promoCode: z.string().optional(),
      keywords: z.array(z.string()),
      commissionRate: z.string().optional(),
      active: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      return await storage.createAffiliateProgram(input);
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        link: z.string().optional(),
        promoCode: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        commissionRate: z.string().optional(),
        active: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      return await storage.updateAffiliateProgram(input.id, input.data);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await storage.deleteAffiliateProgram(input.id);
    }),
});