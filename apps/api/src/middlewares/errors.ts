import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  // Log error stack for debugging
  console.error(`[Error Handler] ${req.method} ${req.url} - Status ${statusCode}:`, err);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : message,
    error: err.name || 'Error'
  });
}
