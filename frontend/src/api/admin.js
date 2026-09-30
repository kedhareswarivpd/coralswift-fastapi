import { apiRequest, toQueryString, API_URL } from './client.js';

// ── Dashboard ──────────────────────────────────────────────────────────────
export const fetchDashboardOverview      = ()         => apiRequest('/dashboard/overview', {});
export const fetchProjectStatusBreakdown = ()         => apiRequest('/dashboard/projects/status-breakdown', {});

// ── Users ──────────────────────────────────────────────────────────────────
export const fetchUsers  = (p = {}) => apiRequest(`/users${toQueryString(p)}`, {});
export const createUser  = (body)   => apiRequest('/users', { method: 'POST', body });
export const updateUser  = (id, b)  => apiRequest(`/users/${id}`, { method: 'PUT', body: b });
export const deactivateUser = (id)  => apiRequest(`/users/${id}/deactivate`, { method: 'PATCH' });
export const deleteUser  = (id)     => apiRequest(`/users/${id}`, { method: 'DELETE' });

// ── Employees ──────────────────────────────────────────────────────────────
export const fetchEmployees = (p = {}) => apiRequest(`/employees${toQueryString(p)}`, {});

// ── Leave & timesheet approval (HR / PM) ─────────────────────────────────────
export const fetchLeaves       = (p = {}) => apiRequest(`/employees/leaves${toQueryString(p)}`, {});
export const reviewLeave       = (id, status) => apiRequest(`/employees/leaves/${id}/approve`, { method: 'PATCH', body: { status } });
export const fetchAllTimesheets = (p = {}) => apiRequest(`/employees/timesheets${toQueryString(p)}`, {});
export const reviewTimesheet   = (id, status) => apiRequest(`/employees/timesheets/${id}/approve`, { method: 'PATCH', body: { status } });

// ── Recruitment (HR) ──────────────────────────────────────────────────────────
export const fetchApplications = (p = {}) => apiRequest(`/careers/admin/applications${toQueryString(p)}`, {});
export const updateApplicationStatus = (id, status) => apiRequest(`/careers/admin/applications/${id}/status`, { method: 'PATCH', body: { status } });

// ── Tickets (Support) ─────────────────────────────────────────────────────────
export const fetchTickets   = (p = {}) => apiRequest(`/tickets${toQueryString(p)}`, {});
export const updateTicket   = (id, b)  => apiRequest(`/tickets/${id}`, { method: 'PATCH', body: b });
export const replyToTicket  = (id, b)  => apiRequest(`/tickets/${id}/replies`, { method: 'POST', body: b });

// ── Finance (Invoices & Payments) ──────────────────────────────────────────────
export const fetchInvoices  = (p = {}) => apiRequest(`/finance/invoices${toQueryString(p)}`, {});
export const createInvoice  = (body)   => apiRequest('/finance/invoices', { method: 'POST', body });
export const updateInvoice  = (id, b)  => apiRequest(`/finance/invoices/${id}`, { method: 'PUT', body: b });
export const recordPayment  = (invoiceId, body) => apiRequest(`/finance/invoices/${invoiceId}/payments`, { method: 'POST', body });

// ── Testimonials (Marketing moderation) ────────────────────────────────────────
export const fetchTestimonials = (p = {}) => apiRequest(`/testimonials${toQueryString(p)}`, {});
export const createTestimonial = (body)  => apiRequest('/testimonials', { method: 'POST', body });
export const updateTestimonial = (id, b)  => apiRequest(`/testimonials/${id}`, { method: 'PUT', body: b });
export const deleteTestimonial = (id)     => apiRequest(`/testimonials/${id}`, { method: 'DELETE' });

// ── Tasks (QA / PM) ────────────────────────────────────────────────────────────
export const fetchTasks       = (p = {}) => apiRequest(`/tasks${toQueryString(p)}`, {});
export const createTask       = (body)   => apiRequest('/tasks', { method: 'POST', body });
export const updateTask       = (id, body) => apiRequest(`/tasks/${id}`, { method: 'PATCH', body });
export const deleteTask       = (id)     => apiRequest(`/tasks/${id}`, { method: 'DELETE' });
export const updateTaskStatus = (id, status) => apiRequest(`/tasks/${id}/status`, { method: 'PATCH', body: { status } });
export const fetchTaskActivities = (id)  => apiRequest(`/tasks/${id}/activities`, {});

// ── Project team assignment (PM) ────────────────────────────────────────────────
export const assignProjectTeam = (id, employeeIds) => apiRequest(`/projects/${id}/team`, { method: 'PATCH', body: { employee_ids: employeeIds } });
export const submitProjectForClientReview = (id) => apiRequest(`/projects/${id}/submit-for-client-review`, { method: 'POST' });

// ── Departments (Super Admin) ──────────────────────────────────────────────────
export const fetchDepartments = (p = {}) => apiRequest(`/departments${toQueryString(p)}`, {});
export const createDepartment = (body)   => apiRequest('/departments', { method: 'POST', body });
export const deleteDepartment = (id)     => apiRequest(`/departments/${id}`, { method: 'DELETE' });

// ── GDPR — act on behalf of another user (Super Admin) ──────────────────────────
export const exportUserData   = (userId) => apiRequest(`/users/${userId}/export`, {});
export const anonymizeUser    = (userId) => apiRequest(`/users/${userId}/anonymize`, { method: 'POST' });

// ── Clients ────────────────────────────────────────────────────────────────
export const fetchClients = (p = {}) => apiRequest(`/clients${toQueryString(p)}`, {});

// ── Projects ───────────────────────────────────────────────────────────────
export const fetchAdminProjects = (p = {}) => apiRequest(`/projects${toQueryString(p)}`, {});
export const createProject      = (body)   => apiRequest('/projects', { method: 'POST', body });
export const updateProject      = (id, b)  => apiRequest(`/projects/${id}`, { method: 'PUT', body: b });
export const deleteProject      = (id)     => apiRequest(`/projects/${id}`, { method: 'DELETE' });

// ── Roles & Permissions ────────────────────────────────────────────────────
export const fetchRoles       = (p = {}) => apiRequest(`/access-control/roles${toQueryString(p)}`, {});
export const createRole       = (body)   => apiRequest('/access-control/roles', { method: 'POST', body });
export const deleteRole       = (id)     => apiRequest(`/access-control/roles/${id}`, { method: 'DELETE' });
export const fetchPermissions = (p = {}) => apiRequest(`/access-control/permissions${toQueryString(p)}`, {});
export const createPermission = (body)   => apiRequest('/access-control/permissions', { method: 'POST', body });
export const deletePermission = (id)     => apiRequest(`/access-control/permissions/${id}`, { method: 'DELETE' });

// ── Analytics ──────────────────────────────────────────────────────────────
export const fetchAnalyticsSummary = () => apiRequest('/analytics/summary', {});
export const trackPageView = (data) => apiRequest('/analytics/track', { method: 'POST', body: data });

// ── Media ──────────────────────────────────────────────────────────────────
export const fetchMedia       = (p = {}) => apiRequest(`/media${toQueryString(p)}`, {});
export const deleteMedia      = (id)     => apiRequest(`/media/${id}`, { method: 'DELETE' });

/** Multipart file upload — uses apiRequest so cookies/CSRF are handled the same as every other request. */
export function uploadMedia(files, folder = 'misc') {
  const formData = new FormData();
  Array.from(files).forEach((file) => formData.append('files', file));
  formData.append('folder', folder);
  return apiRequest('/media/upload', { method: 'POST', body: formData });
}

// ── Notifications ──────────────────────────────────────────────────────────
export const fetchNotifications = ()     => apiRequest('/notifications', {});
export const markNotificationRead = (id) => apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
export const markAllNotificationsRead = () => apiRequest('/notifications/read-all', { method: 'PATCH' });
export const createNotification = (body) => apiRequest('/notifications', { method: 'POST', body });

// ── Blog comment moderation ─────────────────────────────────────────────────
export const fetchComments  = (p = {}) => apiRequest(`/comments${toQueryString(p)}`, {});
export const moderateComment = (id, status) => apiRequest(`/comments/${id}`, { method: 'PATCH', body: { status } });
export const deleteComment  = (id)     => apiRequest(`/comments/${id}`, { method: 'DELETE' });

// ── Newsletter subscribers (admin view) ─────────────────────────────────────
export const fetchNewsletterSubscribers = (p = {}) => apiRequest(`/newsletter${toQueryString(p)}`, {});

// ── Training courses (admin/hr create — no update/delete endpoint exists) ──
export const fetchCourses = (p = {}) => apiRequest(`/trainings/courses${toQueryString({ limit: 100, ...p })}`, {});
export const createCourse = (body)   => apiRequest('/trainings/courses', { method: 'POST', body });

// ── Reports ────────────────────────────────────────────────────────────────
export const fetchReports  = (p = {}) => apiRequest(`/reports${toQueryString(p)}`, {});
export const generateReport = (body)  => apiRequest('/reports/generate', { method: 'POST', body });
export const deleteReport  = (id)     => apiRequest(`/reports/${id}`, { method: 'DELETE' });

// ── Contact Submissions ──────────────────────────────────────────────────────
export const fetchContactSubmissions = (p = {}) => apiRequest(`/contact${toQueryString(p)}`, {});
export const updateContactStatus = (id, status) => apiRequest(`/contact/${id}`, { method: 'PATCH', body: { status } });

// ── Audit Logs ─────────────────────────────────────────────────────────────
export const fetchAuditLogs = (p = {}) => apiRequest(`/audit-logs${toQueryString(p)}`, {});

// ── SEO Metadata ───────────────────────────────────────────────────────────
export const fetchSeoEntries = (p = {}) => apiRequest(`/seo${toQueryString({ limit: 100, ...p })}`, {});
export const createSeoEntry  = (body)   => apiRequest('/seo', { method: 'POST', body });
export const updateSeoEntry  = (id, b)  => apiRequest(`/seo/${id}`, { method: 'PUT', body: b });
export const deleteSeoEntry  = (id)     => apiRequest(`/seo/${id}`, { method: 'DELETE' });

// ── Settings (key-based, not id-based — GET list, PUT upserts by key) ──────
export const fetchSettings = (p = {}) => apiRequest(`/settings${toQueryString(p)}`, {});
export const upsertSetting = (key, body) => apiRequest(`/settings/${encodeURIComponent(key)}`, { method: 'PUT', body });
export const deleteSetting = (key)     => apiRequest(`/settings/${encodeURIComponent(key)}`, { method: 'DELETE' });

// ── Backups (Super Admin only server-side) ──────────────────────────────────
export const fetchBackups   = ()         => apiRequest('/backups', {});
export const triggerBackup  = ()         => apiRequest('/backups/trigger', { method: 'POST' });
export const deleteBackup   = (filename) => apiRequest(`/backups/${encodeURIComponent(filename)}`, { method: 'DELETE' });
export const backupDownloadUrl = (filename)   => `${API_URL}/backups/${encodeURIComponent(filename)}/download`;
