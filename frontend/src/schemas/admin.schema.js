import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NUMERIC_REGEX = /^-?\d+(\.\d+)?$/;

/**
 * Builds a light client-side validation pass for ContentManager's generic
 * CMS resource forms (18 resource types, driven entirely by the `fields`
 * metadata already declared per resource — see ContentManager.jsx's
 * RESOURCES array). There is no per-field "required" flag in that metadata
 * today, so this only enforces the two rules that hold universally across
 * every resource: the primary name/title field must be non-empty, and a
 * `slug` field (when present) must be a valid URL slug. Everything else is
 * intentionally left to server-side validation, which remains authoritative
 * — most CMS fields (icon, cover image, descriptions, etc.) are genuinely
 * optional and forcing them required here would reject legitimate partial
 * saves the API already accepts.
 */
export function validateResourceForm(fields, form) {
 const shape = {};
 fields.forEach((f) => {
  if (f.kind === 'text' && (f.name === 'name' || f.name === 'title')) {
   shape[f.name] = z.string().trim().min(1, `${f.label} is required.`);
  } else if (f.kind === 'text' && f.name === 'slug') {
   shape[f.name] = z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .regex(SLUG_REGEX, 'Slug must contain only lowercase letters, numbers, and hyphens.');
  } else if (f.kind === 'number') {
   shape[f.name] = z
    .string()
    .optional()
    .refine((v) => !v || NUMERIC_REGEX.test(v), `${f.label} must be a number.`);
  } else {
   shape[f.name] = z.any().optional();
  }
 });

 return parseWithSchema(z.object(shape), form).errors;
}
