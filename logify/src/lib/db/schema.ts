import { pgTable, text, varchar, timestamp, uuid } from "drizzle-orm/pg-core";
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
  adminId: text("admin_id")
});

export const team_members = pgTable("team_members", {
  id: text("id").primaryKey().notNull().$defaultFn(() => createId()),
  name: text("name").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull(),
  email: text("email").unique().notNull(),
  phone: text("phone"),
  avatar: text("avatar"),
  status: text("status").notNull().default('active'),
  adminId: text("admin_id"),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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