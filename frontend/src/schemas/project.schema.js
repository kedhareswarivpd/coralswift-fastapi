import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Matches backend ProjectStatus enum options as surfaced in AdminPanel.jsx's
// PROJECT_STATUS_OPTIONS.
export const PROJECT_STATUS_VALUES = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];

// Non-negative budget submitted as a string from a number input. Matches
// ProjectCreate/ProjectUpdate.budget (float | None) in
// backend/app/schemas/project.py — optional, but must be a real
// non-negative number when provided.
const optionalBudgetSchema = z
 .string()
 .trim()
 .optional()
 .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Enter a valid non-negative budget.');

// Matches backend ProjectCreate: only `title` is required there.
export const addProjectSchema = z.object({
 title: z.string().trim().min(1, 'Project title is required.').max(300),
 industry: z.string().trim().optional(),
 status: z.enum(PROJECT_STATUS_VALUES),
 budget: optionalBudgetSchema,
});

export function validateAddProject(form) {
 return parseWithSchema(addProjectSchema, form).errors;
}

// Matches backend ProjectUpdate, plus the progress_percent field the edit
// form exposes (0-100, per the UI's min/max on the number input).
export const updateProjectSchema = z.object({
 title: z.string().trim().min(1, 'Project title is required.').max(300),
 industry: z.string().trim().optional().nullable(),
 status: z.enum(PROJECT_STATUS_VALUES),
 progress_percent: z
  .number({ invalid_type_error: 'Progress must be a number.' })
  .min(0, 'Progress must be at least 0%.')
  .max(100, 'Progress cannot exceed 100%.'),
 budget: optionalBudgetSchema,
});

export function validateUpdateProject(form) {
 return parseWithSchema(updateProjectSchema, form).errors;
}
