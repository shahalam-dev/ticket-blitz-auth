import { pgTable, text, timestamp, uuid, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// 1. Define Enums for Fixed Values (Type Safety)
// This restricts the DB to only accept these specific strings.
export const roleEnum = pgEnum('role', ['user', 'admin', 'superadmin']);
export const providerEnum = pgEnum('auth_provider', ['local', 'google']);

// 2. The Users Table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(), // Auto-generate UUID
  
  email: text('email').notNull().unique(),
  
  // Nullable because OAuth users (Google) won't have a password hash
  passwordHash: text('password_hash'), 
  
  name: text('name').notNull(),
  
  role: roleEnum('role').default('user').notNull(),
  
  authProvider: providerEnum('auth_provider').default('local').notNull(),
  
  // Useful to soft-ban a bot during the flash sale without deleting data
  isActive: boolean('is_active').default(true).notNull(),

  // Standard Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Refresh Tokens (Vital for Secure Auth)
// We store these in DB so we can revoke them if a user gets hacked.
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' }) // If user is deleted, delete token
    .notNull(),
    
  token: text('token').notNull(), // The actual JWT string
  
  expiresAt: timestamp('expires_at').notNull(),
  revoked: boolean('revoked').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});