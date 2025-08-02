import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).default("0.00").notNull(),
  isAdmin: varchar("is_admin").default("false").notNull(),
  isBanned: varchar("is_banned").default("false").notNull(),
  lastActive: timestamp("last_active").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Game sessions table to track game state
export const gameSessions = pgTable("game_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  gameType: varchar("game_type", { length: 20 }).notNull(), // 'slots', 'dice', 'launch'
  betAmount: decimal("bet_amount", { precision: 10, scale: 2 }).notNull(),
  result: jsonb("result").notNull(), // Store game-specific result data
  winAmount: decimal("win_amount", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
}).extend({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z_]+$/, "Username can only contain letters and underscores")
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).pick({
  userId: true,
  gameType: true,
  betAmount: true,
  result: true,
  winAmount: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  username: varchar("username").notNull(),
  message: varchar("message", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  userId: true,
  username: true,
  message: true,
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// Withdrawal requests table
export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  username: varchar("username").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  address: varchar("address").notNull(),
  cryptocurrency: varchar("cryptocurrency").default("LTC").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, approved, rejected
  adminNotes: varchar("admin_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Site settings table
export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default("global"),
  slotsHouseEdge: decimal("slots_house_edge", { precision: 6, scale: 4 }).default("0.0500").notNull(), // 5%

  crashHouseEdge: decimal("crash_house_edge", { precision: 6, scale: 4 }).default("0.0100").notNull(), // 1% Launch game
  minesHouseEdge: decimal("mines_house_edge", { precision: 6, scale: 4 }).default("0.0300").notNull(), // 3%
  blackjackHouseEdge: decimal("blackjack_house_edge", { precision: 6, scale: 4 }).default("0.0050").notNull(), // 0.5%
  totalDeposits: decimal("total_deposits", { precision: 15, scale: 2 }).default("0.00").notNull(),
  totalWithdrawals: decimal("total_withdrawals", { precision: 15, scale: 2 }).default("0.00").notNull(),
  // Launch rigging settings
  crashRigMode: varchar("crash_rig_mode").default("off").notNull(), // "off", "percentage", "rounds"
  crashUnder101Percent: decimal("crash_under_101_percent", { precision: 5, scale: 2 }).default("0.00").notNull(), // % of rounds under 1.01x
  crashUnder11Percent: decimal("crash_under_11_percent", { precision: 5, scale: 2 }).default("0.00").notNull(), // % of rounds under 1.1x
  crashUnder15Percent: decimal("crash_under_15_percent", { precision: 5, scale: 2 }).default("0.00").notNull(), // % of rounds under 1.5x
  crashUnder2Percent: decimal("crash_under_2_percent", { precision: 5, scale: 2 }).default("0.00").notNull(), // % of rounds under 2.0x
  crashOver10Percent: decimal("crash_over_10_percent", { precision: 5, scale: 2 }).default("0.00").notNull(), // % of rounds over 10.0x
  crashOver50Percent: decimal("crash_over_50_percent", { precision: 5, scale: 2 }).default("0.00").notNull(), // % of rounds over 50.0x
  riggedRoundsRemaining: integer("rigged_rounds_remaining").default(0).notNull(), // remaining rounds to rig
  riggedMaxMultiplier: decimal("rigged_max_multiplier", { precision: 6, scale: 2 }).default("2.00").notNull(), // max multiplier for rigged rounds
  riggedMode: varchar("rigged_mode").default("under2x").notNull(), // "under2x", "1.5x", "1.1x", "randomized"
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests).pick({
  userId: true,
  username: true,
  amount: true,
  address: true,
  cryptocurrency: true,
});

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

// Transactions table to track deposits and withdrawals
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'deposit' or 'withdrawal'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("LTC").notNull(),
  status: varchar("status").default("completed").notNull(), // completed, pending, failed
  txHash: varchar("tx_hash"), // transaction hash for blockchain transactions
  address: varchar("address"), // crypto address used
  description: varchar("description"), // description of the transaction
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  amount: true,
  currency: true,
  status: true,
  txHash: true,
  address: true,
  description: true,
});

export type Transaction = typeof transactions.$inferSelect;

// Tips table for user tipping system
export const tips = pgTable("tips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  message: varchar("message", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Multiplayer crash game rounds
export const crashRounds = pgTable("crash_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundNumber: varchar("round_number").notNull(),
  crashPoint: decimal("crash_point", { precision: 6, scale: 2 }).notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  status: varchar("status").default("betting").notNull(), // 'betting', 'starting', 'active', 'crashed'
});

// Crash game bets for multiplayer rounds
export const crashBets = pgTable("crash_bets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundId: varchar("round_id").notNull().references(() => crashRounds.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  username: varchar("username").notNull(),
  betAmount: decimal("bet_amount", { precision: 10, scale: 2 }).notNull(),
  cashOutAt: decimal("cash_out_at", { precision: 6, scale: 2 }),
  winAmount: decimal("win_amount", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: varchar("message", { length: 500 }).notNull(),
  type: varchar("type").default("info").notNull(), // 'success', 'error', 'warning', 'info'
  read: varchar("read").default("false").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for new tables
export const insertTipSchema = createInsertSchema(tips).pick({
  fromUserId: true,
  toUserId: true,
  amount: true,
  message: true,
});

export const insertCrashRoundSchema = createInsertSchema(crashRounds).pick({
  roundNumber: true,
  crashPoint: true,
  status: true,
});

export const insertCrashBetSchema = createInsertSchema(crashBets).pick({
  roundId: true,
  userId: true,
  username: true,
  betAmount: true,
  cashOutAt: true,
  winAmount: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  title: true,
  message: true,
  type: true,
});

// Types for new tables
export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;
export type CrashRound = typeof crashRounds.$inferSelect;
export type InsertCrashRound = z.infer<typeof insertCrashRoundSchema>;
export type CrashBet = typeof crashBets.$inferSelect;
export type InsertCrashBet = z.infer<typeof insertCrashBetSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Auth-specific types for compatibility
export type UpsertUser = typeof users.$inferInsert;
