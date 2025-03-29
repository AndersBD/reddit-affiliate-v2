import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { storage } from "../../storage";

export const commentTemplateRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ type: z.string().optional() }).optional())
    .query(async ({ input }) => {
      if (input?.type) {
        return await storage.getCommentTemplatesByType(input.type);
      }
      return await storage.getCommentTemplates();
    }),
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const template = await storage.getCommentTemplateById(input.id);
      if (!template) {
        throw new Error("Comment template not found");
      }
      return template;
    }),
  
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      template: z.string(),
      type: z.string(),
      affiliateProgramId: z.number().nullable(),
    }))
    .mutation(async ({ input }) => {
      return await storage.createCommentTemplate(input);
    }),
  
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        template: z.string().optional(),
        type: z.string().optional(),
        affiliateProgramId: z.number().nullable().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      return await storage.updateCommentTemplate(input.id, input.data);
    }),
  
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await storage.deleteCommentTemplate(input.id);
    }),
});