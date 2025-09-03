import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

export function makePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL missing');
  const pool = new Pool({ connectionString, max: 5, idleTimeoutMillis: 10000 });
  return pool;
}

export function makeDb(pool = makePool()) {
  return drizzle(pool);
}