import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Matches backend TestimonialCreate in backend/app/schemas/cms.py —
// author_name and content are the only required fields there (rating
// defaults to 5 server-side, everything else is optional).
export const newTestimonialSchema = z.object({
 author_name: z.string().trim().min(1, 'Author name is required.').max(200),
 author_title: z.string().trim().optional(),
 company_name: z.string().trim().optional(),
 content: z
  .string()
  .trim()
  .min(10, 'Content must be at least 10 characters.'),
 rating: z.number().min(1).max(5).optional(),
});

export function validateNewTestimonial(form) {
 return parseWithSchema(newTestimonialSchema, form).errors;
}
