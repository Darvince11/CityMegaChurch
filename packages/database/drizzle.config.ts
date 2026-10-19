import { config } from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs with cwd = packages/database; load env from repo root/apps/api.
const rootEnv = path.resolve(process.cwd(), '../../.env');
const apiEnv = path.resolve(process.cwd(), '../../apps/api/.env');
config({ path: rootEnv });
config({ path: apiEnv });

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://church:church@localhost:5432/church_platform',
    // Supabase pooler connections are encrypted. The hosted pooler certificate
    // chain is not available to Drizzle Kit inside Vercel's build sandbox.
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
  verbose: true,
  strict: true,
});
