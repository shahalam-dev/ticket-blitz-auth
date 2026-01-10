import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/auth.service';

// Zod Schema for Validation
const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 chars"),
  name: z.string().min(2, "Name is too short"),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Validate Input
    const validatedData = registerSchema.parse(req.body);

    // 2. Call Service
    const user = await authService.registerUser(validatedData);

    // 3. Send Response
    res.status(201).json({
      status: 'success',
      data: { user },
    });
  } catch (error) {
    // Pass errors to the global error handler (we'll setup in app.ts)
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const result = await authService.loginUser(validatedData);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
};