import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { errorResponse } from '../models/types';
import pool from '../config/database';

export class AppError extends Error {
  public statusCode: number;
  public errorCode?: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`[AppError] ${req.method} ${req.path} → ${err.statusCode}: ${err.message}`);
    const response = errorResponse(err.message);
    if (err.errorCode) {
      (response as any).errorCode = err.errorCode;
    }
    res.status(err.statusCode).json(response);
    return;
  }

  // Handle MySQL duplicate entry
  if ((err as any).code === 'ER_DUP_ENTRY') {
    res.status(409).json(errorResponse('A record with this information already exists.'));
    return;
  }

  // Handle unexpected errors
  logger.error(`[UnhandledError] ${req.method} ${req.path}`, {
    error: err.message,
    stack: err.stack,
  });

  // Log to database asynchronously
  const userId = (req as any).user?.userId || null;
  pool.query(
    'INSERT INTO error_logs (error_type, message, stack_trace, user_id, endpoint, method, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [err.name || 'Error', err.message, err.stack || null, userId, req.originalUrl, req.method, 'open']
  ).catch(dbErr => logger.error('Failed to write error log to DB:', dbErr));

  res.status(500).json(
    errorResponse('An unexpected server error occurred. Please try again later.')
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(errorResponse(`Route not found: ${req.method} ${req.path}`));
}
