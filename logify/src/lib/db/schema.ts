import { pgTable, text, varchar, timestamp, uuid, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';

export const users = pgTable("users", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").unique().notNull(),
  password: text("password"),
  role: text("role").notNull().default('user'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const team_members = pgTable("team_members", {
  id: serial("id").primaryKey().$defaultFn(() => 5),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }),
  department: varchar("department", { length: 100 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  avatar: varchar("avatar", { length: 255 }),
  status: varchar("status", { length: 10 }).notNull().default('offline'),
  admin_id: text("admin_id").references(() => users.id),
  user_id: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey().notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: timestamp("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
  adminId: text("admin_id")
});