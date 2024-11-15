import { sql } from '@vercel/postgres';
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { testTable } from './schema';

export const db = drizzle(sql);

export async function testConnection() {
    try {
      const result = await db.select().from(testTable).execute();
      console.log('Database connection successful');
      return result;
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
}

