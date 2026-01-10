import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // 1. Get the header
  const authHeader = req.headers.authorization;

  // 2. Check if it exists and starts with "Bearer "
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: No token provided', 401));
  }

  // 3. Extract the actual token string
  // Format: "Bearer eyJhbG..." -> split on space -> take the second part
  const token = authHeader.split(' ')[1];

  // 4. Verify
  const decoded = verifyToken(token);

  if (!decoded) {
    return next(new AppError('Unauthorized: Invalid or expired token', 401));
  }

  // 5. Attach to request
  req.user = decoded;

  // 6. Pass to next controller
  next();
};