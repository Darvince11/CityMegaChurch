import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import * as schema from './schema';

export type Database = NodePgDatabase<typeof schema>;

/**
 * Create a Drizzle database handle backed by a pg Pool.
 * Requires `DATABASE_URL` unless one is provided explicitly.
 */
export interface DatabaseHandle {
  db: Database;
  pool: Pool;
}

export function createDbHandle(connectionString?: string, options: Pick<PoolConfig, 'max' | 'ssl'> = {}): DatabaseHandle {
  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  const pool = new Pool({ connectionString: url, ...options });
  return { db: drizzle(pool, { schema }), pool };
}

export function createDb(connectionString?: string): Database {
  return createDbHandle(connectionString).db;
}
