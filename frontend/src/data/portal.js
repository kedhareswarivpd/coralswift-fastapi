// Every path that renders the employee portal. All render the same component;
// the portal derives the active role from the authenticated profile.
export const employeePortalPaths = ['employee', 'sales', 'marketing', 'developer', 'project-manager', 'qa', 'support', 'finance', 'hr'];

// Every route that renders a full-screen portal (no public header/footer).
// Auth pages (/login, /register, /forgot-password, /reset-password) are NOT
// portals — they render inside the standard Layout with the public navbar
// and footer, consistent across the whole auth flow.
export const portalPaths = ['client', 'partner', ...employeePortalPaths, 'admin', 'super-admin', 'super-admin/login'];

export const partnerPortalTabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'files', label: 'Files', icon: 'folder_open' },
  { id: 'tickets', label: 'Support', icon: 'support' },
];

export const clientPortalTabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'proposals', label: 'Proposals', icon: 'description' },
  { id: 'invoices', label: 'Invoices', icon: 'receipt' },
  { id: 'payments', label: 'Payments', icon: 'payments' },
  { id: 'files', label: 'Files', icon: 'folder_open' },
  { id: 'meetings', label: 'Meetings', icon: 'video_call' },
  { id: 'reports', label: 'Reports', icon: 'bar_chart' },
  { id: 'tickets', label: 'Support', icon: 'support' },
];

export const employeePortalTabs = [
  { id: 'overview', label: 'Overview', icon: 'dashboard' },
  { id: 'attendance', label: 'Attendance', icon: 'clock_loader_60' },
  { id: 'leaves', label: 'Leaves', icon: 'beach_access' },
  { id: 'timesheets', label: 'Timesheets', icon: 'assignment' },
  { id: 'payslips', label: 'Payslips', icon: 'payments' },
  { id: 'tasks', label: 'Tasks', icon: 'task_alt' },
  { id: 'projects', label: 'Projects', icon: 'folder_open' },
  { id: 'performance', label: 'Performance', icon: 'trending_up' },
  { id: 'training', label: 'Training', icon: 'school' },
  { id: 'documents', label: 'Documents', icon: 'description' },
];

// Extra tabs spliced into employeePortalTabs (right after Overview) for roles
// with a dedicated workspace beyond the generic HR/attendance set — see
// docs/ROLE_WORKFLOW.md §2 for the full per-role navigation spec.
export const rolePortalTabs = {
  developer: [
    { id: 'my-tasks', label: 'My Tasks', icon: 'view_kanban' },
  ],
  sales: [
    { id: 'crm-dashboard', label: 'Dashboard', icon: 'analytics' },
    { id: 'contact-submissions', label: 'Contact Submissions', icon: 'mail' },
    { id: 'leads', label: 'Leads', icon: 'person_search' },
    { id: 'clients', label: 'Clients', icon: 'business' },
    { id: 'proposals', label: 'Proposals', icon: 'request_quote' },
    { id: 'contracts', label: 'Contracts', icon: 'gavel' },
    { id: 'meetings', label: 'Meetings', icon: 'video_call' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
  ],
  marketing: [
    { id: 'marketing-leads', label: 'Leads Handoff', icon: 'campaign' },
    { id: 'testimonials', label: 'Testimonials', icon: 'rate_review' },
  ],
  project_manager: [
    { id: 'team-projects', label: 'Team Projects', icon: 'space_dashboard' },
    { id: 'task-board', label: 'Task Board', icon: 'view_kanban' },
    { id: 'approvals', label: 'Approvals', icon: 'fact_check' },
  ],
  qa: [
    { id: 'test-queue', label: 'Test Queue', icon: 'bug_report' },
  ],
  support: [
    { id: 'ticket-queue', label: 'Ticket Queue', icon: 'confirmation_number' },
  ],
  finance: [
    { id: 'invoices', label: 'Invoices', icon: 'receipt_long' },
  ],
  hr: [
    { id: 'leave-approvals', label: 'Leave Approvals', icon: 'event_available' },
    { id: 'recruitment', label: 'Recruitment', icon: 'group_add' },
  ],
};

export function employeeTabsForRole(role) {
  const extra = rolePortalTabs[role] || [];
  if (!extra.length) return employeePortalTabs;
  const [overview, ...rest] = employeePortalTabs;
  return [overview, ...extra, ...rest];
}

export const adminPanelTabs = [
  { id: 'overview',       label: 'Dashboard',    icon: 'dashboard' },
  { id: 'content',        label: 'Content',       icon: 'article' },
  { id: 'contacts',       label: 'Contact Submissions', icon: 'mail' },
  { id: 'projects',       label: 'Projects',      icon: 'folder' },
  { id: 'users',          label: 'Users',         icon: 'people' },
  { id: 'employees',      label: 'Employees',     icon: 'badge' },
  { id: 'clients',        label: 'Clients',       icon: 'business' },
  { id: 'roles',          label: 'Roles',         icon: 'verified_user' },
  { id: 'permissions',    label: 'Permissions',   icon: 'admin_panel_settings' },
  { id: 'media',          label: 'Media',         icon: 'perm_media' },
  { id: 'notifications',  label: 'Notifications', icon: 'notifications' },
  { id: 'reports',        label: 'Reports',       icon: 'assessment' },
  { id: 'training',       label: 'Training',      icon: 'school' },
  { id: 'careers',        label: 'Careers',       icon: 'work' },
  { id: 'comments',       label: 'Comments',      icon: 'rate_review' },
  { id: 'newsletter',     label: 'Newsletter',    icon: 'mail' },
  { id: 'analytics',      label: 'Analytics',     icon: 'insights' },
  { id: 'settings',       label: 'Settings',      icon: 'settings' },
  { id: 'logs',           label: 'Audit Logs',    icon: 'history' },
];
