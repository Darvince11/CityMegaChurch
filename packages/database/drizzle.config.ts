import { config } from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs with cwd = packages/database; load env from repo root/apps/api.
const rootEnv = path.resolve(process.cwd(), '../../.env');
const apiEnv = path.resolve(process.cwd(), '../../apps/api/.env');
config({ path: rootEnv });
config({ path: apiEnv });

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://church:church@localhost:5432/church_platform';
const migrationUrl = new URL(databaseUrl);
// Supabase pooler certificates can be reported as self-signed by node-postgres
// inside Vercel's build image. Scope this compatibility mode to Supabase migrations.
const isSupabaseHost =
  migrationUrl.hostname.endsWith('.supabase.co') || migrationUrl.hostname.endsWith('.supabase.com');
if (isSupabaseHost) migrationUrl.searchParams.set('sslmode', 'no-verify');

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: migrationUrl.toString(),
    // Supabase pooler connections are encrypted. The hosted pooler certificate
    // chain is not available to Drizzle Kit inside Vercel's build sandbox.
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
  verbose: true,
  strict: true,
});
