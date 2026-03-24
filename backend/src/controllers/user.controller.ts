// c:\projects\kostian_task\backend\src\controllers\user.controller.ts

import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { updateProfileSchema, updateThemeSchema } from '../validators/user.validator';
import { sendSuccess, sendError } from '../utils/response';

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const user = await userService.getProfile(req.user!.userId);
    sendSuccess(res, user, 'Profile retrieved');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get profile';
    sendError(res, message, 404);
  }
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const user = await userService.updateProfile(req.user!.userId, parsed.data);
    sendSuccess(res, user, 'Profile updated');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update profile';
    if (message === 'Email already in use') {
      sendError(res, message, 409);
    } else {
      sendError(res, message, 500);
    }
  }
}

export async function updateTheme(req: Request, res: Response): Promise<void> {
  const parsed = updateThemeSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const user = await userService.updateTheme(req.user!.userId, parsed.data.theme);
    sendSuccess(res, user, 'Theme updated');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update theme';
    sendError(res, message, 500);
  }
}
