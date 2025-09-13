import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  role: text("role").notNull().default("basic"), // basic, premium, validator
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  bdagBalance: decimal("bdag_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  portfolioValue: decimal("portfolio_value", { precision: 18, scale: 2 }).notNull().default("0"),
  globalRank: integer("global_rank"),
  weeklyXp: integer("weekly_xp").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictionMarkets = pgTable("prediction_markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPool: decimal("total_pool", { precision: 18, scale: 8 }).notNull().default("0"),
  participantCount: integer("participant_count").notNull().default(0),
  yesPercentage: decimal("yes_percentage", { precision: 5, scale: 2 }).notNull().default("50"),
  noPercentage: decimal("no_percentage", { precision: 5, scale: 2 }).notNull().default("50"),
  status: text("status").notNull().default("active"), // active, ended, resolved
  result: boolean("result"), // true for yes, false for no, null if unresolved
  createdAt: timestamp("created_at").defaultNow(),
});

export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  marketId: varchar("market_id").notNull().references(() => predictionMarkets.id),
  prediction: boolean("prediction").notNull(), // true for yes, false for no
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  potentialWin: decimal("potential_win", { precision: 18, scale: 8 }).notNull(),
  status: text("status").notNull().default("active"), // active, won, lost
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // testing, community, development
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  xpReward: integer("xp_reward").notNull(),
  bdagReward: decimal("bdag_reward", { precision: 18, scale: 8 }).notNull(),
  requirements: jsonb("requirements"), // array of requirements
  isDaily: boolean("is_daily").notNull().default(false),
  isWeekly: boolean("is_weekly").notNull().default(false),
  maxCompletions: integer("max_completions"), // null for unlimited
  currentCompletions: integer("current_completions").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userTasks = pgTable("user_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  taskId: varchar("task_id").notNull().references(() => tasks.id),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  progress: integer("progress").notNull().default(0),
  maxProgress: integer("max_progress").notNull().default(1),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  requirement: jsonb("requirement"), // achievement criteria
  xpReward: integer("xp_reward").notNull().default(0),
  bdagReward: decimal("bdag_reward", { precision: 18, scale: 8 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  progress: integer("progress").notNull().default(0),
  maxProgress: integer("max_progress").notNull().default(1),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // task_completion, prediction_win, daily_bonus, achievement
  source: text("source").notNull(), // task_id, market_id, achievement_id, etc.
  xpAmount: integer("xp_amount").notNull().default(0),
  bdagAmount: decimal("bdag_amount", { precision: 18, scale: 8 }).notNull().default("0"),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export const insertPredictionMarketSchema = createInsertSchema(predictionMarkets).omit({
  id: true,
  createdAt: true,
  totalPool: true,
  participantCount: true,
  yesPercentage: true,
  noPercentage: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  currentCompletions: true,
});

export const insertUserTaskSchema = createInsertSchema(userTasks).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PredictionMarket = typeof predictionMarkets.$inferSelect;
export type InsertPredictionMarket = z.infer<typeof insertPredictionMarketSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UserTask = typeof userTasks.$inferSelect;
export type InsertUserTask = z.infer<typeof insertUserTaskSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
