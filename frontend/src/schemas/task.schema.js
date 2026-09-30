import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Matches backend TaskPriority enum values as used by TaskCreate.
export const TASK_PRIORITY_VALUES = ['low', 'medium', 'high', 'urgent'];

// Matches backend TaskCreate in backend/app/schemas/task.py — project_id
// and title are the only required fields there; priority defaults to
// "medium" server-side, assigned_to/due_date are optional.
export const newTaskSchema = z.object({
 title: z.string().trim().min(1, 'Task title is required.').max(300),
 priority: z.enum(TASK_PRIORITY_VALUES),
 assigned_to: z.string().trim().optional(),
 due_date: z.string().trim().optional(),
});

export function validateNewTask(form) {
 return parseWithSchema(newTaskSchema, form).errors;
}
