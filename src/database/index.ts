import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Create a connection pool (Optimized for high concurrency)
// A pool allows re-using connections instead of opening a new handshake for every user.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Limit connections to prevent crashing the DB
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, { schema });