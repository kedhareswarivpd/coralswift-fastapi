// Internal role values match backend/app/models/enums.py::UserRole exactly —
// keep these two files in sync if roles ever change.

export const EMPLOYEE_ROLES = [
  { label: 'Developer', value: 'developer' },
  { label: 'Sales', value: 'sales' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Project Manager', value: 'project_manager' },
  { label: 'QA', value: 'qa' },
  { label: 'Support', value: 'support' },
  { label: 'Finance', value: 'finance' },
  { label: 'HR', value: 'hr' },
];

export const ADMIN_ROLES = [
  { label: 'Super Admin', value: 'super_admin' },
  { label: 'Admin', value: 'admin' },
];

// Portals that grant an internal role and therefore require an authenticated
// Admin/HR to provision (see AdminPanel's Add User form) rather than public
// self-registration. Each entry's `roles` list drives which dropdown renders.
export const PORTAL_ROLE_OPTIONS = [
  { value: 'employee', label: 'Employee Portal', roleLabel: 'Employee Role', roles: EMPLOYEE_ROLES },
  { value: 'admin', label: 'Admin Portal', roleLabel: 'Admin Role', roles: ADMIN_ROLES },
];
