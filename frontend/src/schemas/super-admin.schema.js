import { z } from 'zod';
import { parseWithSchema } from './auth.schema.js';

// Matches backend DepartmentCreate (backend/app/schemas/department.py):
// only `name` is required there; description is optional.
export const createDepartmentSchema = z.object({
 name: z.string().trim().min(1, 'Department name is required.'),
 description: z.string().trim().optional(),
});

export function validateCreateDepartment(form) {
 return parseWithSchema(createDepartmentSchema, form).errors;
}

// Matches backend RoleCreate (backend/app/schemas/role.py): name and slug
// are required; description is optional.
export const createRoleSchema = z.object({
 name: z.string().trim().min(1, 'Role name is required.'),
 slug: z.string().trim().min(1, 'Slug is required.'),
 description: z.string().trim().optional(),
});

export function validateCreateRole(form) {
 return parseWithSchema(createRoleSchema, form).errors;
}

// Matches backend PermissionCreate: name, module and action are required;
// description is optional (the RolesPermissions form doesn't collect it).
export const createPermissionSchema = z.object({
 name: z.string().trim().min(1, 'Name is required.'),
 module: z.string().trim().min(1, 'Module is required.'),
 action: z.string().trim().min(1, 'Action is required.'),
});

export function validateCreatePermission(form) {
 return parseWithSchema(createPermissionSchema, form).errors;
}
