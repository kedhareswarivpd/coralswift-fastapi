import { z } from 'zod';
import { parseWithSchema, emailSchema } from './auth.schema.js';

// Matches backend UserCreate (backend/app/schemas/user.py): name, email and
// password are required; the backend accepts any non-empty password string
// (no complexity policy for admin-minted accounts), but the AddUserForm UI
// already advertises "min. 8 characters" so we enforce that here too.
export const addUserSchema = z.object({
 name: z.string().trim().min(1, 'Full name is required.').max(200),
 email: emailSchema,
 password: z.string().min(8, 'Password must be at least 8 characters.'),
 phone: z.string().trim().optional(),
});

export function validateAddUser(form) {
 return parseWithSchema(addUserSchema, form).errors;
}

// Matches backend UserUpdate: all fields optional there, but the edit form
// treats name/email as required inputs (marked `required` in the JSX).
export const updateUserSchema = z.object({
 name: z.string().trim().min(1, 'Full name is required.').max(200),
 email: emailSchema,
 phone: z.string().trim().optional().nullable(),
 role: z.string().trim().min(1, 'Role is required.'),
 is_active: z.boolean().optional(),
});

export function validateUpdateUser(form) {
 return parseWithSchema(updateUserSchema, form).errors;
}
