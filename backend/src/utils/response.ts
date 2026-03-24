// c:\projects\kostian_task\backend\src\utils\response.ts

import { Response } from 'express';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  errors?: unknown
): void {
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors || null,
  });
}

export function sendCreated<T>(res: Response, data: T, message: string = 'Created'): void {
  sendSuccess(res, data, message, 201);
}
