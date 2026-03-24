// c:\projects\kostian_task\backend\src\validators\user.validator.ts

import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  email: z.string().email('Invalid email').max(150).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128).optional(),
});

export const updateThemeSchema = z.object({
  theme: z.enum(['white', 'dark', 'blue'], {
    errorMap: () => ({ message: 'Theme must be white, dark, or blue' }),
  }),
});

export const updateUserAdminSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(150).optional(),
  role: z.enum(['user', 'admin']).optional(),
  theme: z.enum(['white', 'dark', 'blue']).optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin'], {
    errorMap: () => ({ message: 'Role must be user or admin' }),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateThemeInput = z.infer<typeof updateThemeSchema>;
export type UpdateUserAdminInput = z.infer<typeof updateUserAdminSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
