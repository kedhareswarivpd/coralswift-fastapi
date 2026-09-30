import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Matches backend RoleCreate (backend/app/schemas/role.py): name and slug
// are required there; description is optional.
export const addRoleSchema = z.object({
 name: z.string().trim().min(1, 'Role name is required.'),
 slug: z.string().trim().min(1, 'Slug is required.'),
 description: z.string().trim().optional(),
});

export function validateAddRole(form) {
 return parseWithSchema(addRoleSchema, form).errors;
}

// Matches backend PermissionCreate: name, module and action are required;
// description is optional (the AddPermissionForm UI doesn't even collect it).
export const addPermissionSchema = z.object({
 name: z.string().trim().min(1, 'Name is required.'),
 module: z.string().trim().min(1, 'Module is required.'),
 action: z.string().trim().min(1, 'Action is required.'),
 description: z.string().trim().optional(),
});

export function validateAddPermission(form) {
 return parseWithSchema(addPermissionSchema, form).errors;
}

// Matches backend NotificationCreate (backend/app/schemas/ops.py): only
// `title` is required there — message/link/roles are all optional and
// `type` defaults to "info". The form additionally requires the caller to
// target either a user or a set of roles, which is enforced separately
// (createNotification always sends roles here, defaulting to "everyone").
export const sendNotificationSchema = z.object({
 title: z.string().trim().min(1, 'Title is required.'),
 message: z.string().trim().optional(),
 type: z.enum(['info', 'success', 'warning', 'error']),
 link: z.string().trim().optional(),
 roles: z.string().trim().optional(),
});

export function validateSendNotification(form) {
 return parseWithSchema(sendNotificationSchema, form).errors;
}

// Matches backend ReportGenerate (backend/app/schemas/report.py): title,
// report_type and period are all required (min_length=1); summary is optional.
export const generateReportSchema = z.object({
 title: z.string().trim().min(1, 'Title is required.'),
 report_type: z.string().trim().min(1, 'Report type is required.'),
 period: z.string().trim().min(1, 'Period is required.'),
 summary: z.string().trim().optional(),
});

export function validateGenerateReport(form) {
 return parseWithSchema(generateReportSchema, form).errors;
}

// Matches backend SettingUpsert (backend/app/schemas/ops.py): `value` is
// `Any` (so effectively unconstrained) and `group` defaults to "general".
// The one rule the backend enforces structurally — `key` must be present,
// since upsert_setting takes it as a required path param — is what we
// validate here for the "new setting" form (the edit form already has a
// key from the row being edited, so it doesn't need this).
export const settingKeySchema = z.object({
 key: z.string().trim().min(1, 'Key is required.'),
 value: z.string().trim().optional(),
 group: z.string().trim().optional(),
});

export function validateNewSetting(form) {
 return parseWithSchema(settingKeySchema, form).errors;
}

// Media upload: MediaUpload has no client-selectable fields beyond the
// files themselves — the backend (backend/app/routers/media.py) doesn't
// enforce a size/type allowlist, so the only real client-side rule is
// "at least one file was chosen".
export function validateMediaUpload(files) {
 if (!files || files.length === 0) return { files: 'Please choose at least one file to upload.' };
 return {};
}
