import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { getEnv } from './env.js';
import * as schema from '../db/schema.js';

let db: ReturnType<typeof drizzle>;

export function getDb() {
  if (!db) {
    const env = getEnv();
    const client = postgres(env.DATABASE_URL);
    db = drizzle(client, { schema });
  }
  return db;
}

export async function closeDb() {
  if (db) {
    await getDb().$client.end();
  }
}
