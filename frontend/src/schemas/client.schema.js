import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Matches backend TicketCreate (backend/app/schemas/client.py): subject and
// description are both required strings. The Client/Partner Portal "New
// Ticket" forms share this exact shape (subject input + description
// textarea), so both portals reuse this one schema.
export const newTicketSchema = z.object({
 subject: z.string().trim().min(1, 'Subject is required.').max(200, 'Subject must be under 200 characters.'),
 description: z.string().trim().min(1, 'Please describe your issue.').max(5000, 'Description must be under 5000 characters.'),
});

export function validateNewTicket(form) {
 return parseWithSchema(newTicketSchema, form).errors;
}
