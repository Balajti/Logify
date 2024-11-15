import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './src/drizzle',
  driver: 'pglite',
  dialect: 'postgresql',
  dbCredentials: {
    connectionString: process.env.POSTGRES_URL || '',
  },
} as Config;