import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import { AppError } from './utils/AppError';
import { ZodError } from 'zod';
import { startGrpcServer } from './grpc/server';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/v1/auth', authRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      status: 'fail',
      errors: err.issues.map(e => ({ field: e.path[0], message: e.message })),
    });
  }

  // Handle Operational Errors (AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // Handle Unknown Errors
  console.error('🔥 Unexpected Error:', err);
  return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

// Start Server
if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`🚀 REST API running on port ${env.PORT}`);
    startGrpcServer();
  });
}

export { app };