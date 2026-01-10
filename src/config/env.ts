import { z } from 'zod';
import { config } from 'dotenv';

config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(10),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// This will throw a detailed error if any variable is missing
// The app will crash *immediately* (Fail Fast), which is good.
export const env = envSchema.parse(process.env);