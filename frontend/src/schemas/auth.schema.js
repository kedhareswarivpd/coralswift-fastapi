import { z } from 'zod';

// Shared building blocks — reused across every auth schema so the rules
// live in exactly one place.
export const emailSchema = z
 .string()
 .trim()
 .min(1, 'Email is required.')
 .email('Enter a valid email address.');

// Matches the policy already advertised in the Register/ResetPassword
// placeholders ("Min. 8 chars, 1 upper, 1 lower, 1 number, 1 symbol").
export const newPasswordSchema = z
 .string()
 .min(8, 'Password must be at least 8 characters.')
 .max(128, 'Password must be under 128 characters.')
 .regex(/[a-z]/, 'Password must include a lowercase letter.')
 .regex(/[A-Z]/, 'Password must include an uppercase letter.')
 .regex(/[0-9]/, 'Password must include a number.')
 .regex(/[^A-Za-z0-9]/, 'Password must include a symbol.');

// Login only needs "non-empty" — an existing account's password may
// predate the current complexity policy, so we must not reject it here.
export const existingPasswordSchema = z.string().min(1, 'Password is required.');

export const loginSchema = z.object({
 email: emailSchema,
 password: existingPasswordSchema,
});

export const registerSchema = z
 .object({
  name: z.string().trim().min(1, 'Full name is required.').max(200),
  email: emailSchema,
  password: newPasswordSchema,
  confirm: z.string().min(1, 'Please confirm your password.'),
 })
 .refine((data) => data.password === data.confirm, {
  message: 'Passwords do not match.',
  path: ['confirm'],
 });

export const forgotPasswordSchema = z.object({
 email: emailSchema,
});

export const resetPasswordSchema = z
 .object({
  password: newPasswordSchema,
  confirm: z.string().min(1, 'Please confirm your password.'),
 })
 .refine((data) => data.password === data.confirm, {
  message: 'Passwords do not match.',
  path: ['confirm'],
 });

/**
 * Runs a schema and returns { success, errors } where `errors` is a flat
 * { fieldName: message } map (first issue per field) — the shape every
 * form in this app already renders. On success, `errors` is `{}`.
 */
export function parseWithSchema(schema, data) {
 const result = schema.safeParse(data);
 if (result.success) return { success: true, errors: {} };

 const errors = {};
 for (const issue of result.error.issues) {
  const key = issue.path[0] ?? '_form';
  if (!errors[key]) errors[key] = issue.message;
 }
 return { success: false, errors };
}
