import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

const NAME_REGEX = /^[A-Za-z][A-Za-z\s'.-]*$/;
const PHONE_REGEX = /^\+[1-9][0-9]{6,14}$/;

export const contactSchema = z.object({
 name: z
  .string()
  .trim()
  .min(1, 'Full name is required.')
  .regex(NAME_REGEX, 'Name can only contain letters, spaces, hyphens, and apostrophes.'),
 email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address (e.g. jane@company.com).'),
 phone: z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || PHONE_REGEX.test(v), 'Enter a valid phone number with country code (e.g. +15550000000).'),
 company: z.string().trim().optional(),
 department: z.string().trim().min(1),
 subject: z.string().trim().optional(),
 message: z.string().trim().min(1, 'Message is required.'),
});

export function validateContactForm(data) {
 return parseWithSchema(contactSchema, data).errors;
}
