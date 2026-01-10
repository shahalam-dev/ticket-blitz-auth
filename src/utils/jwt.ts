import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// 1. Define the payload structure (what's inside the token)
export interface TokenPayload {
  userId: string;
  role: string;
}

// 2. Generate Access Token (Short Lived - 15m)
export const signAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' });
};

// 3. Generate Refresh Token (Long Lived - 7d)
export const signRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
};

// 4. Verify Token (We'll use this later in middleware)
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};