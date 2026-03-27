// c:\projects\kostian_task\backend\src\services\auth.service.ts

import crypto from 'crypto';
import * as userRepo from '../repositories/user.repository';
import * as tokenRepo from '../repositories/token.repository';
import * as emailVerifRepo from '../repositories/email-verification.repository';
import { hashPassword, comparePassword } from '../utils/hash';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from './mailer.service';
import { AuthTokens, TokenPayload, UserPublic } from '../types';

function generateVerificationCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
}

function getCodeExpiryTime(): Date {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 10);
  return now;
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ user: UserPublic; message: string }> {
  const existing = await userRepo.findUserByEmail(email);
  if (existing) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await hashPassword(password);
  const userId = await userRepo.createUser(name, email, hashedPassword);
  const user = await userRepo.findUserById(userId);

  if (!user) {
    throw new Error('Failed to create user');
  }

  // Generate and send verification code
  const code = generateVerificationCode();
  const expiresAt = getCodeExpiryTime();
  await emailVerifRepo.createVerificationCode(userId, code, expiresAt);
  await sendVerificationEmail(email, code);

  const { password: _pw, ...userPublic } = user;

  return {
    user: userPublic as UserPublic,
    message: 'Registration successful. Please check your email for the verification code.',
  };
}

export async function verifyEmail(email: string, code: string): Promise<UserPublic> {
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  const verCode = await emailVerifRepo.findVerificationCodeByEmail(email);
  if (!verCode) {
    throw new Error('Invalid or expired verification code');
  }

  if (verCode.code !== code) {
    throw new Error('Invalid verification code');
  }

  if (verCode.used) {
    throw new Error('Verification code has already been used');
  }

  // Mark code as used and update user as verified
  await emailVerifRepo.markCodeAsUsed(verCode.id);
  await userRepo.updateUserById(user.id, { is_verified: true });

  const updatedUser = await userRepo.findUserById(user.id);
  if (!updatedUser) {
    throw new Error('Failed to verify email');
  }

  const { password: _pw, ...userPublic } = updatedUser;
  return userPublic as UserPublic;
}

export async function resendVerificationCode(email: string): Promise<{ message: string }> {
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.is_verified) {
    throw new Error('Email already verified');
  }

  // Invalidate old codes
  await emailVerifRepo.invalidateUserCodes(user.id);

  // Generate and send new code
  const code = generateVerificationCode();
  const expiresAt = getCodeExpiryTime();
  await emailVerifRepo.createVerificationCode(user.id, code, expiresAt);
  await sendVerificationEmail(email, code);

  return {
    message: 'Verification code sent to your email',
  };
}

export async function login(
  email: string,
  password: string
): Promise<{ user: UserPublic; tokens: AuthTokens }> {
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.is_verified) {
    throw new Error('Email not verified');
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const payload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const expiresAt = getRefreshTokenExpiry();

  await tokenRepo.saveRefreshToken(user.id, refreshToken, expiresAt);

  const { password: _pw, ...userPublic } = user;

  return {
    user: userPublic as UserPublic,
    tokens: { accessToken, refreshToken },
  };
}

export async function logout(refreshToken: string): Promise<void> {
  await tokenRepo.deleteRefreshToken(refreshToken);
}

export async function refreshTokens(
  oldRefreshToken: string
): Promise<AuthTokens> {
  const stored = await tokenRepo.findRefreshToken(oldRefreshToken);
  if (!stored) {
    throw new Error('Invalid or expired refresh token');
  }

  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    await tokenRepo.deleteRefreshToken(oldRefreshToken);
    throw new Error('Invalid refresh token');
  }

  await tokenRepo.deleteRefreshToken(oldRefreshToken);

  const user = await userRepo.findUserById(payload.userId);
  if (!user) {
    throw new Error('User not found');
  }

  const newPayload: TokenPayload = { userId: user.id, email: user.email, role: user.role };
  const accessToken = signAccessToken(newPayload);
  const refreshToken = signRefreshToken(newPayload);
  const expiresAt = getRefreshTokenExpiry();

  await tokenRepo.saveRefreshToken(user.id, refreshToken, expiresAt);

  return { accessToken, refreshToken };
}

export async function getMe(userId: number): Promise<UserPublic> {
  const user = await userRepo.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const { password: _pw, ...userPublic } = user;
  return userPublic as UserPublic;
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await userRepo.findUserByEmail(email);
  if (!user) {
    // Return silently – do not leak whether the email exists
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await userRepo.updateUserById(user.id, {
    reset_token: token,
    reset_token_expires: expires,
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${token}`;

  await sendPasswordResetEmail(email, resetLink);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const user = await userRepo.findUserByResetToken(token);
  if (!user) {
    throw new Error('Invalid reset token');
  }

  const hashedPassword = await hashPassword(newPassword);

  await userRepo.updateUserById(user.id, {
    password: hashedPassword,
    reset_token: null,
    reset_token_expires: null,
  });
}
