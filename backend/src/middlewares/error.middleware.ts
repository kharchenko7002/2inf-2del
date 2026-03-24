// c:\projects\kostian_task\backend\src\middlewares\error.middleware.ts

import { Request, Response, NextFunction } from 'express';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Unhandled error:', err);

  if (res.headersSent) {
    next(err);
    return;
  }

  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    errors: null,
  });
}
