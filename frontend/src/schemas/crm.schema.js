import { z } from 'zod';
import { parseWithSchema, emailSchema } from './auth.schema.js';

// Non-negative currency amount submitted as a string from a number input.
// Matches LeadCreate.estimated_value (float | None) in backend/app/schemas/crm.py —
// optional, but must be a real non-negative number when provided.
const optionalAmountSchema = z
 .string()
 .trim()
 .optional()
 .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Enter a valid non-negative amount.');

// ConvertToLeadModal only lets the admin edit estimated_value and notes —
// the rest of the LeadCreate payload (contact_name, email, phone, company)
// is read-only, pre-filled from the contact submission.
export const convertToLeadSchema = z.object({
 estimatedValue: optionalAmountSchema,
 notes: z.string().trim().optional(),
});

export function validateConvertToLead(data) {
 return parseWithSchema(convertToLeadSchema, data).errors;
}

// Optional phone, submitted as a free-text string — LeadCreate.phone has no
// backend format constraint, this is a UX-only sanity check matching the
// pattern Leads' new-lead form already enforced before this schema existed.
const optionalPhoneSchema = z
 .string()
 .trim()
 .optional()
 .refine((v) => !v || /^[+]?[\d\s\-()]{7,20}$/.test(v), 'Enter a valid phone number.');

// Matches LeadCreate in backend/app/schemas/crm.py: contact_name and email
// are the only required fields, everything else (company, phone, source,
// estimated_value) is optional.
export const newLeadSchema = z.object({
 company: z.string().trim().optional(),
 contact_name: z.string().trim().min(2, 'Contact name must be at least 2 characters.'),
 email: emailSchema,
 phone: optionalPhoneSchema,
 source: z.string().optional(),
 estimated_value: optionalAmountSchema,
});

export function validateNewLead(data) {
 return parseWithSchema(newLeadSchema, data).errors;
}

// Required, positive currency amount submitted as a string — matches
// ProposalCreate.price (float, required) in backend/app/schemas/crm.py.
const requiredAmountSchema = z
 .string()
 .trim()
 .min(1, 'Price is required.')
 .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Price must be a positive number.');

// Matches ProposalCreate: lead_id, scope_summary and price are required.
// The 10-character minimum on scope_summary is a UX-only rule (the backend
// just requires a non-empty string) preserved from Proposals' prior
// hand-rolled validate().
export const newProposalSchema = z.object({
 lead_id: z.string().trim().min(1, 'Please select a lead.'),
 scope_summary: z.string().trim().min(10, 'Scope summary must be at least 10 characters.'),
 price: requiredAmountSchema,
});

export function validateNewProposal(data) {
 return parseWithSchema(newProposalSchema, data).errors;
}

// Matches MeetingCreate in backend/app/schemas/ops.py: title and
// scheduled_at are the only required fields.
export const newMeetingSchema = z.object({
 title: z.string().trim().min(1, 'Title is required.'),
 scheduled_at: z.string().trim().min(1, 'Date and time are required.'),
});

export function validateNewMeeting(data) {
 return parseWithSchema(newMeetingSchema, data).errors;
}
