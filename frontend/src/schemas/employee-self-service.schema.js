import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Matches backend LeaveApply (backend/app/schemas/employee.py): type,
// start_date and end_date are required; reason is optional there, but the
// Leaves tab UI has always required a reason of at least 10 characters
// (see the placeholder/help text), so that stricter rule is preserved here.
export const LEAVE_TYPE_VALUES = ['earned', 'sick', 'casual', 'unpaid', 'maternity', 'paternity'];

export const newLeaveRequestSchema = z
 .object({
  type: z.enum(LEAVE_TYPE_VALUES, { message: 'Leave type is required.' }),
  from: z.string().trim().min(1, 'Start date is required.'),
  to: z.string().trim().min(1, 'End date is required.'),
  reason: z.string().trim().min(10, 'Reason must be at least 10 characters.'),
 })
 .refine((data) => {
  if (!data.from) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(data.from) >= today;
 }, { message: 'Start date cannot be in the past.', path: ['from'] })
 .refine((data) => {
  if (!data.from || !data.to) return true;
  return new Date(data.to) >= new Date(data.from);
 }, { message: 'End date cannot be before start date.', path: ['to'] });

export function validateNewLeaveRequest(form) {
 return parseWithSchema(newLeaveRequestSchema, form).errors;
}

// Matches backend TimesheetCreate (backend/app/schemas/employee.py): date
// and hours are required (project_id/task_id/description optional, and the
// Timesheets tab only collects a free-text project name, not a project_id).
// hours must be a positive number; the form's UI caps entries at 24h/day
// (see the number input's max attribute), preserved here.
export const newTimesheetSchema = z
 .object({
  date: z.string().trim().min(1, 'Date is required.'),
  project: z.string().trim().optional(),
  hours: z
   .string()
   .trim()
   .min(1, 'Hours are required.')
   .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Hours must be a positive number.')
   .refine((v) => Number(v) <= 24, 'Cannot log more than 24 hours per entry.'),
  description: z.string().trim().optional(),
 })
 .refine((data) => {
  if (!data.date) return true;
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return new Date(data.date) <= today;
 }, { message: 'Date cannot be in the future.', path: ['date'] });

export function validateNewTimesheet(form) {
 return parseWithSchema(newTimesheetSchema, form).errors;
}
