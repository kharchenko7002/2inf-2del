// c:\projects\kostian_task\backend\src\controllers\admin.controller.ts

import { Request, Response } from 'express';
import * as faqService from '../services/faq.service';
import * as userRepo from '../repositories/user.repository';
import { hashPassword } from '../utils/hash';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { updateUserAdminSchema, updateRoleSchema } from '../validators/user.validator';
import { z } from 'zod';

// --- FAQ Admin ---

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

export async function createFAQ(req: Request, res: Response): Promise<void> {
  const parsed = faqSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }
  try {
    const faq = await faqService.createFAQ(parsed.data.question, parsed.data.answer);
    sendCreated(res, faq, 'FAQ created');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create FAQ';
    sendError(res, message, 500);
  }
}

export async function updateFAQ(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    sendError(res, 'Invalid ID', 400);
    return;
  }

  const parsed = faqSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const faq = await faqService.updateFAQ(id, parsed.data);
    sendSuccess(res, faq, 'FAQ updated');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update FAQ';
    if (message === 'FAQ not found') {
      sendError(res, message, 404);
    } else {
      sendError(res, message, 500);
    }
  }
}

export async function deleteFAQ(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    sendError(res, 'Invalid ID', 400);
    return;
  }

  try {
    await faqService.deleteFAQ(id);
    sendSuccess(res, null, 'FAQ deleted');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete FAQ';
    if (message === 'FAQ not found') {
      sendError(res, message, 404);
    } else {
      sendError(res, message, 500);
    }
  }
}

// --- User Admin ---

export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await userRepo.getAllUsers();
    sendSuccess(res, users, 'Users retrieved');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get users';
    sendError(res, message, 500);
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    sendError(res, 'Invalid ID', 400);
    return;
  }
  try {
    const user = await userRepo.findUserById(id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    const { password: _pw, ...userPublic } = user;
    sendSuccess(res, userPublic, 'User retrieved');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get user';
    sendError(res, message, 500);
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    sendError(res, 'Invalid ID', 400);
    return;
  }

  const parsed = updateUserAdminSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const user = await userRepo.findUserById(id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    const updateData: Record<string, string> = {};
    if (parsed.data.name) updateData.name = parsed.data.name;
    if (parsed.data.email) updateData.email = parsed.data.email;
    if (parsed.data.role) updateData.role = parsed.data.role;
    if (parsed.data.theme) updateData.theme = parsed.data.theme;

    await userRepo.updateUserById(id, updateData as Parameters<typeof userRepo.updateUserById>[1]);

    const updated = await userRepo.findUserById(id);
    if (!updated) {
      sendError(res, 'User not found after update', 404);
      return;
    }
    const { password: _pw, ...userPublic } = updated;
    sendSuccess(res, userPublic, 'User updated');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update user';
    sendError(res, message, 500);
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    sendError(res, 'Invalid ID', 400);
    return;
  }

  if (req.user?.userId === id) {
    sendError(res, 'Cannot delete your own account', 400);
    return;
  }

  try {
    const user = await userRepo.findUserById(id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    await userRepo.deleteUserById(id);
    sendSuccess(res, null, 'User deleted');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete user';
    sendError(res, message, 500);
  }
}

export async function updateUserRole(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    sendError(res, 'Invalid ID', 400);
    return;
  }

  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    sendError(res, 'Validation error', 400, parsed.error.errors);
    return;
  }

  try {
    const user = await userRepo.findUserById(id);
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }

    await userRepo.updateUserById(id, { role: parsed.data.role });
    const updated = await userRepo.findUserById(id);
    if (!updated) {
      sendError(res, 'User not found after update', 404);
      return;
    }
    const { password: _pw, ...userPublic } = updated;
    sendSuccess(res, userPublic, 'User role updated');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update user role';
    sendError(res, message, 500);
  }
}
