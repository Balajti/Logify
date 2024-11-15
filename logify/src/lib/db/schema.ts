import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";
 
export const testTable = pgTable("test_table", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});