import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Reddit thread table
export const redditThreads = pgTable("reddit_threads", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  subreddit: text("subreddit").notNull(),
  permalink: text("permalink").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  commentCount: integer("comment_count").notNull().default(0),
  author: text("author").notNull(),
  flair: text("flair"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  crawledAt: timestamp("crawled_at").notNull().defaultNow(),
  score: integer("score").notNull().default(0),
  intentType: text("intent_type"),
  serpRank: integer("serp_rank"),
  hasSerp: boolean("has_serp").notNull().default(false),
  matchedKeywords: json("matched_keywords").$type<string[]>().notNull().default([]),
  affiliateMatch: integer("affiliate_match").notNull().default(0),
});

export const insertRedditThreadSchema = createInsertSchema(redditThreads).omit({
  id: true,
  createdAt: true,
  crawledAt: true,
});

export type InsertRedditThread = z.infer<typeof insertRedditThreadSchema>;
export type RedditThread = typeof redditThreads.$inferSelect;

// Affiliate programs table
export const affiliatePrograms = pgTable("affiliate_programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  link: text("link").notNull(),
  promoCode: text("promo_code"),
  keywords: json("keywords").$type<string[]>().notNull().default([]),
  commissionRate: text("commission_rate"),
  active: boolean("active").notNull().default(true),
});

export const insertAffiliateProgramSchema = createInsertSchema(affiliatePrograms).omit({
  id: true,
});

export type InsertAffiliateProgram = z.infer<typeof insertAffiliateProgramSchema>;
export type AffiliateProgram = typeof affiliatePrograms.$inferSelect;

// Comment templates table
export const commentTemplates = pgTable("comment_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  template: text("template").notNull(),
  type: text("type").notNull(), // e.g., "DISCOVERY", "COMPARISON", "QUESTION", "REVIEW"
  affiliateProgramId: integer("affiliate_program_id"),
});

export const insertCommentTemplateSchema = createInsertSchema(commentTemplates).omit({
  id: true,
});

export type InsertCommentTemplate = z.infer<typeof insertCommentTemplateSchema>;
export type CommentTemplate = typeof commentTemplates.$inferSelect;

// Crawl history table
export const crawlHistory = pgTable("crawl_history", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  threadCount: integer("thread_count").notNull().default(0),
  subreddits: json("subreddits").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("running"), // "running", "completed", "failed"
  error: text("error"),
});

export const insertCrawlHistorySchema = createInsertSchema(crawlHistory).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export type InsertCrawlHistory = z.infer<typeof insertCrawlHistorySchema>;
export type CrawlHistory = typeof crawlHistory.$inferSelect;
