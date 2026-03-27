// c:\projects\kostian_task\backend\src\controllers\auth.controller.ts

import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  resendVerificationCodeSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';
import { sendSuccess, sendError, sendCreated } from '../utils/response';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const { name, email, password } = parsed.data;
    const { user, message } = await authService.register(name, email, password);

    sendCreated(res, { user, message }, message);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    if (message === 'Email already in use') {
      sendError(res, message, 409);
    } else {
      sendError(res, message, 500);
    }
  }
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const parsed = verifyEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const { email, code } = parsed.data;
    const user = await authService.verifyEmail(email, code);

    sendSuccess(res, { user }, 'Email verified successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Email verification failed';
    if (
      message === 'Invalid or expired verification code' ||
      message === 'Invalid verification code' ||
      message === 'Verification code has already been used'
    ) {
      sendError(res, message, 400);
    } else if (message === 'User not found') {
      sendError(res, message, 404);
    } else {
      sendError(res, message, 500);
    }
  }
}

export async function resendVerificationCode(req: Request, res: Response): Promise<void> {
  const parsed = resendVerificationCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const { email } = parsed.data;
    const { message } = await authService.resendVerificationCode(email);

    sendSuccess(res, { message }, message);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to resend verification code';
    if (message === 'Email already verified') {
      sendError(res, message, 400);
    } else if (message === 'User not found') {
      sendError(res, message, 404);
    } else {
      sendError(res, message, 500);
    }
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const { email, password } = parsed.data;
    const { user, tokens } = await authService.login(email, password);

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, user, 'Logged in successfully');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    if (message === 'Email not verified') {
      sendError(res, message, 403);
    } else if (message === 'Invalid credentials') {
      sendError(res, message, 401);
    } else {
      sendError(res, message, 500);
    }
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    await authService.logout(refreshToken).catch(() => {});
  }

  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);

  sendSuccess(res, null, 'Logged out successfully');
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    sendError(res, 'Refresh token missing', 401);
    return;
  }

  try {
    const tokens = await authService.refreshTokens(refreshToken);

    res.cookie('accessToken', tokens.accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendSuccess(res, null, 'Tokens refreshed');
  } catch (err) {
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    const message = err instanceof Error ? err.message : 'Token refresh failed';
    sendError(res, message, 401);
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.userId);
    sendSuccess(res, user, 'User retrieved');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get user';
    sendError(res, message, 404);
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const { email } = parsed.data;
    await authService.forgotPassword(email);
  } catch {
    // Swallow errors – always return the same response
  }

  sendSuccess(res, null, 'If an account with that email exists, a reset link has been sent.');
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const { token, newPassword } = parsed.data;
    await authService.resetPassword(token, newPassword);
    sendSuccess(res, null, 'Password has been reset successfully.');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Password reset failed';
    if (message === 'Invalid reset token') {
      sendError(res, message, 400);
    } else {
      sendError(res, message, 500);
    }
  }
}
