import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Matches backend CourseCreate (backend/app/schemas/training.py, via
// CourseBase): title is required (1-255 chars); category, duration_hours,
// description are all optional. is_published defaults to false server-side
// but the form always sends an explicit boolean.
export const newCourseSchema = z.object({
 title: z.string().trim().min(1, 'Title is required.').max(255),
 category: z.string().trim().optional(),
 duration_hours: z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Enter a valid non-negative number of hours.'),
 description: z.string().trim().optional(),
});

export function validateNewCourse(form) {
 return parseWithSchema(newCourseSchema, form).errors;
}

// Matches backend CareerCreate (backend/app/schemas/career.py): only
// `title` is required there — department, location, description are
// optional and employment_type defaults to full_time.
export const newCareerSchema = z.object({
 title: z.string().trim().min(1, 'Job title is required.'),
 department: z.string().trim().optional(),
 location: z.string().trim().optional(),
 employment_type: z.enum(['full_time', 'part_time', 'contract', 'internship']),
 description: z.string().trim().optional(),
});

export function validateNewCareer(form) {
 return parseWithSchema(newCareerSchema, form).errors;
}
