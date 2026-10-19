import { z } from 'zod';

/**
 * Canonical DTOs shared by the API (validation) and the web (types).
 * The API imports these directly; the web may import types via `import type`.
 */

// ---------------------------------------------------------------- auth
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email('Invalid email address')
  .max(254, 'Email is too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long');

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, 'Full name is required')
  .max(120, 'Full name is too long')
  .refine((value) => !/[\u0000-\u001F\u007F<>]/.test(value), 'Full name contains unsupported characters')
  .transform((value) => value.normalize('NFKC').replace(/\s+/g, ' '));

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{9,15}$/, 'Invalid phone number — use digits, optional leading +')
  .optional()
  .or(z.literal(''));

export const RegisterRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  phone: phoneSchema,
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required').max(128),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required').max(128),
  newPassword: passwordSchema,
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: 'Your new password must be different from your current password.',
  path: ['newPassword'],
});
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  phone: z.string().nullable(),
  status: z.enum(['active', 'inactive']),
  twoFactorEnabled: z.boolean(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  churchPosition: z.string().nullable(),
});
export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthResponseSchema = z.object({
  user: AuthUserSchema,
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// ------------------------------------------------------------ envelope
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.array(z.object({ field: z.string(), message: z.string() })).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
