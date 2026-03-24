// c:\projects\kostian_task\backend\src\services\user.service.ts

import * as userRepo from '../repositories/user.repository';
import { hashPassword } from '../utils/hash';
import { UserPublic, User } from '../types';

export async function getProfile(userId: number): Promise<UserPublic> {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error('User not found');
  const { password: _pw, ...userPublic } = user;
  return userPublic as UserPublic;
}

export async function updateProfile(
  userId: number,
  fields: { name?: string; email?: string; password?: string }
): Promise<UserPublic> {
  const updateData: Partial<User> = {};

  if (fields.name) updateData.name = fields.name;
  if (fields.email) {
    const existing = await userRepo.findUserByEmail(fields.email);
    if (existing && existing.id !== userId) {
      throw new Error('Email already in use');
    }
    updateData.email = fields.email;
  }
  if (fields.password) {
    updateData.password = await hashPassword(fields.password);
  }

  await userRepo.updateUserById(userId, updateData);
  const updated = await userRepo.findUserById(userId);
  if (!updated) throw new Error('User not found after update');
  const { password: _pw, ...userPublic } = updated;
  return userPublic as UserPublic;
}

export async function updateTheme(
  userId: number,
  theme: 'white' | 'dark' | 'blue'
): Promise<UserPublic> {
  await userRepo.updateUserById(userId, { theme });
  const updated = await userRepo.findUserById(userId);
  if (!updated) throw new Error('User not found');
  const { password: _pw, ...userPublic } = updated;
  return userPublic as UserPublic;
}
