import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Currency options as surfaced by the New Invoice form's <select> — not a
// backend-enforced enum (InvoiceCreate.currency is a free string defaulting
// to "INR"), just the choices the UI offers.
export const INVOICE_CURRENCY_VALUES = ['USD', 'EUR', 'GBP', 'INR'];

// Positive amount submitted as a string from a number input. Matches
// InvoiceCreate.amount (float, required) in backend/app/schemas/finance.py.
const positiveAmountSchema = z
 .string()
 .trim()
 .min(1, 'Amount is required.')
 .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Enter a valid amount greater than 0.');

// Non-negative tax submitted as a string from a number input. Matches
// InvoiceCreate.tax (float, defaults to 0) — optional here since the form
// leaves it blank by default.
const nonNegativeTaxSchema = z
 .string()
 .trim()
 .optional()
 .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Enter a valid non-negative tax amount.');

// Matches backend InvoiceCreate: client_id, amount, issue_date and due_date
// are required; tax/currency default server-side but the form always
// submits them. invoice_number/project_id/notes aren't exposed by this form.
export const newInvoiceSchema = z
 .object({
  client_id: z.string().trim().min(1, 'Select a client.'),
  amount: positiveAmountSchema,
  tax: nonNegativeTaxSchema,
  currency: z.enum(INVOICE_CURRENCY_VALUES),
  issue_date: z.string().trim().min(1, 'Issue date is required.'),
  due_date: z.string().trim().min(1, 'Due date is required.'),
 })
 .refine((data) => !data.issue_date || !data.due_date || data.due_date >= data.issue_date, {
  message: 'Due date must be on or after the issue date.',
  path: ['due_date'],
 });

export function validateNewInvoice(form) {
 return parseWithSchema(newInvoiceSchema, form).errors;
}
