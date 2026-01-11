// import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '../database';
import { users, refreshTokens } from '../database/schema';
import { AppError } from '../utils/AppError';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';

// Define the input type
interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface LoginInput {
  email: string;
  password: string;
}

export const registerUser = async ({ email, password, name }: RegisterInput) => {
  // 1. Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new AppError('Email already in use', 409); // 409 Conflict
  }

  // 2. Hash the password
  // Salt rounds = 12 is a good balance between security and speed
  // const passwordHash = await bcrypt.hash(password, 12);
  const passwordHash = await hashPassword(password);

  // 3. Create User in DB
  // returning() gives us back the created user object (excluding the hash if we select specific fields)
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name,
      role: 'user',
      authProvider: 'local',
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    });

  return newUser;
};

export const loginUser = async ({ email, password }: LoginInput) => {
  // 1. Find User
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  // 2. Verify Password
  // const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  const isValidPassword = await verifyPassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid email or password', 401);
  }

  // 3. Check if active (Bot Protection)
  if (!user.isActive) {
    throw new AppError('Account is disabled', 403);
  }

  // 4. Generate Tokens
  const payload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // 5. Store Refresh Token in DB
  // We calculate the absolute expiry date (7 days from now)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: expiresAt,
  });

  // 6. Return everything
  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    accessToken,
    refreshToken,
  };
};

export const getUserById = async (userId: string) => {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user;
};