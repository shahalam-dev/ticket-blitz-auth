import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables so we can read DATABASE_URL
config();

export default defineConfig({
  // Point to where we defined our schema earlier
  schema: './src/database/schema.ts',
  
  // Output directory for migrations
  out: './drizzle',
  
  // REQUIRED for Drizzle Kit v0.21+
  dialect: 'postgresql',
  
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  
  // Optional: clearer formatting for generated SQL
  verbose: true,
  strict: true,
});