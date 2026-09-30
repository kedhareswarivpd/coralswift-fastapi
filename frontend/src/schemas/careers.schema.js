import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

export const applyFormSchema = z.object({
 full_name: z.string().trim().min(1, 'Full name is required'),
 email: z.string().trim().min(1, 'Enter a valid email address').email('Enter a valid email address'),
 phone: z.string().trim().optional(),
 linkedin_url: z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\/.+/.test(v), 'Enter a valid URL'),
 cover_letter: z.string().trim().optional(),
});

// `resume` is a File, validated separately (zod's z.instanceof(File) would
// tie this schema to a browser-only global for no real benefit here).
export function validateApplyForm(data, resume) {
 const errors = parseWithSchema(applyFormSchema, data).errors;
 if (!resume) errors.resume = 'Please attach your resume';
 return errors;
}
