import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Badge from '../components/ui/Badge.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { SkeletonTable } from '../components/ui/Skeleton.jsx';
import { PortalTable } from '../components/ui/ResponsiveTable.jsx';
import Modal from '../components/ui/Modal.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import useAsyncAction from '../hooks/useAsyncAction.js';
import { useAuth } from '../context/AuthContext.jsx';
import { adminPanelTabs } from '../data/portal.js';
import { PORTAL_ROLE_OPTIONS } from '../data/roles.js';
import {
 fetchUsers, createUser, updateUser, deactivateUser,
 fetchAdminProjects, createProject, updateProject, deleteProject,
 fetchRoles, createRole, deleteRole, fetchPermissions, createPermission, deletePermission,
 fetchMedia, deleteMedia, uploadMedia,
 fetchNotifications, markNotificationRead, markAllNotificationsRead,
 fetchReports, generateReport, deleteReport,
 fetchAuditLogs,
 fetchEmployees, fetchClients,
 fetchDashboardOverview, fetchProjectStatusBreakdown as fetchProjectStatusBreakdownApi,
 fetchContactSubmissions, updateContactStatus,
 fetchAnalyticsSummary,
 fetchSettings, upsertSetting, deleteSetting,
 createNotification,
 fetchComments, moderateComment, deleteComment,
 fetchNewsletterSubscribers,
 fetchApplications, updateApplicationStatus,
} from '../api/admin.js';
import { careersApi } from '../api/cms.js';
import { createLead } from '../api/crm.js';
import { validateConvertToLead } from '../schemas/crm.schema.js';
import { validateAddUser, validateUpdateUser } from '../schemas/employee.schema.js';
import { validateAddProject, validateUpdateProject } from '../schemas/project.schema.js';
import {
 validateAddRole, validateAddPermission, validateMediaUpload,
 validateSendNotification, validateGenerateReport, validateNewSetting,
} from '../schemas/admin-misc.schema.js';
import { validateNewCareer } from '../schemas/admin-content.schema.js';

import { useRoleGuard } from '../hooks/useRoleGuard.js';
import ContentManager from '../components/admin/ContentManager.jsx';
import { FORM_INPUT_CLASS } from '../components/ui/formClasses.js';

// ── Toast notification system ────────────────────────────────────────────────
function Toast({ toasts }) {
 return (
  <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
   {toasts.map((t) => (
    <div
     key={t.id}
     className={`pointer-events-auto flex animate-fade-in items-center gap-3 rounded-xl px-4 py-3 text-body-sm font-medium shadow-lg
      ${t.type === 'success' ? 'bg-status-success-bg text-status-success-text' : 'bg-status-error-bg text-status-error-text'}`}
    >
     <Icon name={t.type === 'success' ? 'check_circle' : 'error'} className="flex-shrink-0 text-lg" />
     {t.message}
    </div>
   ))}
  </div>
 );
}

function useToast() {
 const [toasts, setToasts] = useState([]);
 const add = (message, type = 'success') => {
  const id = Date.now();
  setToasts((prev) => [...prev, { id, message, type }]);
  setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
 };
 return { toasts, toast: add };
}

// ── Convert-to-Lead modal ────────────────────────────────────────────────────
function ConvertToLeadModal({ submission, onClose, onSuccess }) {
 const [estimatedValue, setEstimatedValue] = useState(submission.estimated_value ?? '');
 const [notes, setNotes] = useState(submission.message || '');
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending } = useAsyncAction();

 const handleConvert = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateConvertToLead({ estimatedValue, notes });
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await run(async () => {
    await createLead({
     contact_name: submission.name,
     email: submission.email,
     phone: submission.phone || null,
     company: submission.company || null,
     source: 'contact_form',
     contact_submission_id: submission.id,
     service_id: submission.service_id || null,
     industry_id: submission.industry_id || null,
     estimated_value: estimatedValue ? Number(estimatedValue) : null,
     notes: notes || null,
    });
    onSuccess();
   });
  } catch (err) {
   setError(err.message || 'Could not convert to lead.');
  }
 };

 return (
  <Modal open onClose={onClose} title="Convert to Lead" size="sm">
   <p className="-mt-3 mb-5 text-body-sm text-ink-muted dark:text-dark-ink-muted">Create a CRM lead from this contact submission</p>

   {/* Pre-filled read-only summary */}
   <div className="mb-5 space-y-1 rounded-lg bg-surface-container p-4 dark:bg-dark-surface-container">
    <p className="text-body-sm font-semibold text-brand-dark dark:text-dark-brand">{submission.name}</p>
    <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{submission.email}</p>
    {submission.phone && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{submission.phone}</p>}
    {submission.company && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{submission.company}</p>}
    {submission.subject && <p className="text-body-sm italic text-ink-muted dark:text-dark-ink-muted">{submission.subject}</p>}
    {submission.service_id && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Service: {submission.service_id}</p>}
    {submission.industry_id && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Industry: {submission.industry_id}</p>}
    {submission.expected_budget && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Expected budget: ${Number(submission.expected_budget).toLocaleString()}</p>}
    {submission.requirements && <p className="text-body-sm italic text-ink-muted dark:text-dark-ink-muted">Requirements: {submission.requirements}</p>}
   </div>

   <form onSubmit={handleConvert} className="space-y-4">
    <div>
     <label className="mb-1 block text-body-sm font-medium text-ink dark:text-dark-ink">Estimated Value (USD)</label>
     <input
      type="number" min="0" step="0.01" placeholder="e.g. 5000"
      value={estimatedValue} onChange={(e) => setEstimatedValue(e.target.value)}
      className={FORM_INPUT_CLASS + ' w-full'}
     />
     {fieldErrors.estimatedValue && (
      <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.estimatedValue}</p>
     )}
    </div>
    <div>
     <label className="mb-1 block text-body-sm font-medium text-ink dark:text-dark-ink">Notes</label>
     <textarea
      rows={3} placeholder="Internal notes about this lead..."
      value={notes} onChange={(e) => setNotes(e.target.value)}
      className={FORM_INPUT_CLASS + ' w-full resize-none'}
     />
     {fieldErrors.notes && (
      <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.notes}</p>
     )}
    </div>
    {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
    <div className="flex gap-3 pt-1">
     <Button type="submit" variant="primary" size="md" disabled={isPending} className="flex-1">
      {isPending ? 'Converting...' : 'Convert to Lead'}
     </Button>
     <Button type="button" variant="outline" size="md" onClick={onClose}>Cancel</Button>
    </div>
   </form>
  </Modal>
 );
}

function Dashboard({ kpis: propKpis, statusBreakdown: propBreakdown, setActiveTab }) {
 const kpis = propKpis || { total_employees: 0, total_clients: 0, total_projects: 0, active_projects: 0, open_tasks: 0, total_revenue: 0, open_tickets: 0, new_applications: 0, unresolved_contacts: 0, published_blogs: 0 };
 const statusBreakdown = propBreakdown || [];
 const [recentLogs, setRecentLogs] = useState([]);
 useEffect(() => {
  fetchAuditLogs({ limit: 5 }).then((res) => setRecentLogs(res?.data || res || [])).catch(() => {});
 }, []);

 const statCards = [
  { label: 'Employees', value: kpis.total_employees, icon: 'badge', color: 'text-status-info-text' },
  { label: 'Clients', value: kpis.total_clients, icon: 'business', color: 'text-status-success-text' },
  { label: 'Projects', value: kpis.total_projects, icon: 'folder', color: 'text-brand' },
  { label: 'Revenue', value: `$${(kpis.total_revenue / 1000000).toFixed(1)}M`, icon: 'payments', color: 'text-status-warning-text' },
  { label: 'Active Projects', value: kpis.active_projects, icon: 'rocket_launch', color: 'text-brand' },
  { label: 'Open Tasks', value: kpis.open_tasks, icon: 'assignment', color: 'text-warning' },
  { label: 'Open Tickets', value: kpis.open_tickets, icon: 'support', color: 'text-status-error-text' },
  { label: 'New Applications', value: kpis.new_applications, icon: 'person_add', color: 'text-brand' },
 ];

 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
    {statCards.map((s) => (
     <div key={s.label} className="flex flex-col rounded-xl border border-outline-variant bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale dark:bg-brand/10">
       <Icon name={s.icon} className={`text-2xl ${s.color}`} />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-dark-brand">{s.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{s.label}</p>
     </div>
    ))}
   </div>

   <div className="grid gap-6 lg:grid-cols-2">
    <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface">
     <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Project Status Breakdown</h3>
     <div className="space-y-4">
      {statusBreakdown.map((item) => (
       <div key={item.status}>
        <div className="mb-1 flex justify-between text-body-sm">
         <span className="capitalize text-brand-dark dark:text-dark-brand">{item.status.replace('_', ' ')}</span>
         <span className="text-ink-muted dark:text-dark-ink-muted">{item.count}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
         <div className={`h-full rounded-full transition-all ${
          item.status === 'completed' ? 'bg-status-success-text' :
          item.status === 'in_progress' ? 'bg-status-info-text' :
          item.status === 'on_hold' ? 'bg-status-warning-text' : 'bg-status-neutral-bg'
         }`} style={{ width: `${(item.count / kpis.total_projects) * 100}%` }} />
        </div>
       </div>
      ))}
     </div>
    </div>

    <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface">
     <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Quick Actions</h3>
     <div className="space-y-3">
      {[
       { icon: 'add_circle', label: 'Create User', desc: 'Add a new employee, client, or partner account', tab: 'users' },
       { icon: 'post_add', label: 'New Blog Post', desc: 'Draft and publish a blog article', tab: 'content' },
       { icon: 'upload_file', label: 'Upload Resource', desc: 'Add a whitepaper or downloadable asset', tab: 'media' },
       { icon: 'campaign', label: 'Send Notification', desc: 'Broadcast a message to all users', tab: 'notifications' },
      ].map((action) => (
       <div key={action.label} onClick={() => setActiveTab(action.tab)} className="flex cursor-pointer items-center gap-4 rounded-lg bg-surface-container p-3 transition-colors hover:bg-accent-cyan-pale dark:bg-dark-surface-container dark:hover:bg-brand/10">
        <Icon name={action.icon} className="text-2xl text-brand" />
        <div>
         <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{action.label}</p>
         <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{action.desc}</p>
        </div>
       </div>
      ))}
     </div>
    </div>
   </div>

   <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface">
    <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Recent Activity</h3>
    {recentLogs.length === 0 ? (
     <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">No recent activity.</p>
    ) : (
     <div className="space-y-3">
      {recentLogs.map((log, i) => (
       <div key={log.id || i} className="flex items-start gap-3">
        <Icon name="circle" className="mt-1 shrink-0 text-xs text-brand" />
        <div>
         <p className="text-body-sm text-brand-dark dark:text-dark-brand">{log.action || log.event || 'Activity'}</p>
         <p className="text-body-xs text-ink-muted dark:text-dark-ink-muted">{log.details || log.description || ''}{log.created_at ? ` · ${new Date(log.created_at).toLocaleString()}` : ''}</p>
        </div>
       </div>
      ))}
     </div>
    )}
   </div>
  </div>
 );
}

function ContentManagement() {
 return <ContentManager />;
}

function AddUserForm({ currentRole, onCreated, onCancel }) {
 // Admin Portal is only offered to a Super Admin — matches the backend guard in
 // routers/users.py::create_user (only super_admin may mint admin/super_admin).
 const availablePortals = PORTAL_ROLE_OPTIONS.filter((p) => p.value !== 'admin' || currentRole === 'super_admin');
 const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', portal: '', role: '' });
 const [roleError, setRoleError] = useState('');
 const [submitError, setSubmitError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending: submitting } = useAsyncAction();
 const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

 const selectedPortal = availablePortals.find((p) => p.value === form.portal);

 const handlePortalChange = (e) => {
  const portal = e.target.value;
  // Switching portals clears any previously selected role so a stale value
  // from the other portal's role list can never be carried into the payload.
  setForm((prev) => ({ ...prev, portal, role: '' }));
  setRoleError('');
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.portal || !form.role) {
   setRoleError('Please select a role.');
   return;
  }
  setSubmitError('');
  const clientErrors = validateAddUser(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setSubmitError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await run(async () => {
    await createUser({ name: form.name, email: form.email, password: form.password, phone: form.phone || null, role: form.role });
    onCreated();
   });
  } catch (err) {
   setSubmitError(err.message || 'Could not create the account.');
  }
 };

 return (
  <form onSubmit={handleSubmit} className="space-y-4">
   <div className="grid gap-4 sm:grid-cols-2">
    <div>
     <input required type="text" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.name && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.name}</p>}
    </div>
    <div>
     <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.email && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.email}</p>}
    </div>
    <div>
     <input required type="password" minLength={8} placeholder="Temporary password (min. 8 characters)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.password && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.password}</p>}
    </div>
    <div>
     <input type="text" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.phone && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.phone}</p>}
    </div>
   </div>

   <label className="flex flex-col gap-1.5">
    <span className="font-label-caps text-label-caps uppercase text-ink-muted">Portal</span>
    <select required value={form.portal} onChange={handlePortalChange} className={inputClass}>
     <option value="" disabled>Select a portal</option>
     {availablePortals.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
    </select>
   </label>

   {selectedPortal && (
    <label className="flex flex-col gap-1.5">
     <span className="font-label-caps text-label-caps uppercase text-ink-muted">{selectedPortal.roleLabel}</span>
     <select value={form.role} onChange={(e) => { setForm({ ...form, role: e.target.value }); setRoleError(''); }} className={inputClass}>
      <option value="" disabled>Select a role</option>
      {selectedPortal.roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
     </select>
     {roleError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{roleError}</p>}
    </label>
   )}

   {submitError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{submitError}</p>}

   <div className="flex gap-2">
    <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Account'}</Button>
    <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
   </div>
  </form>
 );
}

function UserManagement({ currentRole }) {
 const [users, setUsers] = useState([]);
 const [loadingUsers, setLoadingUsers] = useState(true);
 const [showAddForm, setShowAddForm] = useState(false);
 const [editingUser, setEditingUser] = useState(null);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 const loadUsers = useCallback(() => {
  setLoadingUsers(true);
  fetchUsers({ page, limit: 20 })
   .then((res) => { setUsers(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoadingUsers(false));
 }, [page]);

 useEffect(() => {
  loadUsers();
 }, [loadUsers]);

 const handleEdit = (user) => {
  setEditingUser(user);
  setShowAddForm(false);
  setUserError('');
  setUserFieldErrors({});
 };

 const handleUpdate = async (e) => {
  e.preventDefault();
  if (!editingUser) return;
  setUserError('');
  const clientErrors = validateUpdateUser(editingUser);
  if (Object.keys(clientErrors).length > 0) {
   setUserFieldErrors(clientErrors);
   setUserError('Please fix the errors below.');
   return;
  }
  setUserFieldErrors({});
  try {
   await runUpdateUser(async () => {
    await updateUser(editingUser.id, {
     name: editingUser.name,
     email: editingUser.email,
     phone: editingUser.phone || null,
     role: editingUser.role,
     is_active: editingUser.is_active,
    });
    setEditingUser(null);
    loadUsers();
   });
  } catch (err) {
   setUserError(err.message || 'Could not update user.');
  }
 };

 const { run: runUpdateUser, isPending: submittingUser } = useAsyncAction();
 const [userError, setUserError] = useState('');
 const [userFieldErrors, setUserFieldErrors] = useState({});
 const [successMsg, setSuccessMsg] = useState('');
 const { run: runDeactivate, isPending: deactivating } = useAsyncAction();

 const userColumns = [
  { key: 'name', label: 'Name', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
  { key: 'email', label: 'Email', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted' },
  { key: 'role', label: 'Role', className: 'text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted', render: (v) => v?.replace('_', ' ') },
  { key: 'is_active', label: 'Status', render: (v) => <StatusBadge variant={v ? 'success' : 'neutral'}>{v ? 'active' : 'inactive'}</StatusBadge> },
  {
   key: 'actions', label: 'Actions',
   render: (_v, u) => (
    <div className="flex gap-2">
     <button onClick={() => handleEdit(u)} aria-label={`Edit ${u.name}`} className="text-ink-muted transition-colors hover:text-brand" title="Edit">
      <Icon name="edit" className="text-lg" />
     </button>
     <button
      disabled={deactivating}
      onClick={() => { if (window.confirm(`Deactivate user "${u.name}"?`)) { runDeactivate(async () => { await deactivateUser(u.id); loadUsers(); }); } }}
      aria-label={`Deactivate ${u.name}`} className="text-ink-muted transition-colors hover:text-status-warning-text disabled:opacity-50" title="Deactivate"
     >
      <Icon name="block" className="text-lg" />
     </button>
    </div>
   ),
  },
 ];

 const roleCounts = {};
 users.forEach((u) => {
  const r = u.role || 'unknown';
  roleCounts[r] = (roleCounts[r] || 0) + 1;
 });
 const roleList = Object.keys(roleCounts).sort((a, b) => roleCounts[b] - roleCounts[a]);
 const roleRows = roleList.map((role) => ({
  id: role,
  role,
  count: roleCounts[role],
  permissions: role === 'super_admin' ? 'Full access' : role.replace('_', ' ') + ' portal access',
 }));
 const roleSummaryColumns = [
  { key: 'role', label: 'Role', className: 'text-body-md capitalize text-brand-dark dark:text-dark-brand', render: (v) => v.replace('_', ' ') },
  { key: 'count', label: 'Users', className: 'text-body-md text-ink-muted dark:text-dark-ink-muted' },
  { key: 'permissions', label: 'Permissions', className: 'text-body-md capitalize text-ink-muted dark:text-dark-ink-muted' },
 ];

 return (
  <div className="space-y-stack-lg">
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">All Users</h3>
     <Button variant="primary" size="md" icon={<Icon name="person_add" />} onClick={() => { setShowAddForm((v) => !v); setEditingUser(null); }}>
      {showAddForm ? 'Close' : 'Add User'}
     </Button>
    </div>
    {(showAddForm || editingUser) && (
     <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
      {editingUser ? (
       <form onSubmit={handleUpdate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
         <div>
          <input required type="text" placeholder="Full name" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
          {userFieldErrors.name && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{userFieldErrors.name}</p>}
         </div>
         <div>
          <input required type="email" placeholder="Email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
          {userFieldErrors.email && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{userFieldErrors.email}</p>}
         </div>
         <div>
          <input type="text" placeholder="Phone (optional)" value={editingUser.phone || ''} onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
          {userFieldErrors.phone && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{userFieldErrors.phone}</p>}
         </div>
         <div>
          <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'}>
           {PORTAL_ROLE_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {userFieldErrors.role && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{userFieldErrors.role}</p>}
         </div>
        </div>
        <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
         <input type="checkbox" checked={editingUser.is_active} onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })} />
         Active
        </label>
        {userError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{userError}</p>}
        <div className="flex gap-2">
         <Button type="submit" variant="primary" size="md" disabled={submittingUser}>{submittingUser ? 'Updating...' : 'Update User'}</Button>
         <Button type="button" variant="outline" size="md" onClick={() => { setEditingUser(null); setUserError(''); setUserFieldErrors({}); }}>Cancel</Button>
        </div>
       </form>
      ) : (
       <AddUserForm
        currentRole={currentRole}
        onCreated={() => { setShowAddForm(false); loadUsers(); setSuccessMsg('User created successfully!'); setTimeout(() => setSuccessMsg(''), 3000); }}
        onCancel={() => setShowAddForm(false)}
       />
      )}
     </div>
    )}
    {successMsg && (
     <div className="mx-stack-lg mt-4 flex items-center gap-2 rounded-lg bg-status-success-bg p-stack-md text-body-sm text-status-success-text dark:bg-status-success-bg/20">
      <Icon name="check_circle" className="text-lg" />{successMsg}
     </div>
    )}
    {loadingUsers ? (
     <div className="p-stack-lg"><SkeletonTable rows={6} columns={5} /></div>
    ) : (
     <>
      <PortalTable columns={userColumns} rows={users} emptyMessage="No users found." />
      <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
       <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
     </>
    )}
   </div>

   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">User Roles</h3>
    </div>
    <PortalTable columns={roleSummaryColumns} rows={roleRows} emptyMessage="No roles found." />
   </div>
  </div>
 );
}

function EmployeeManagement() {
 const [employees, setEmployees] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 useEffect(() => {
  setLoading(true);
  fetchEmployees({ page, limit: 20 })
   .then((res) => { setEmployees(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 return (
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
    <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Employees ({employees.length})</h3>
   </div>
   {loading ? <div className="p-stack-lg"><SkeletonTable rows={6} columns={7} /></div> : (
    <>
     <PortalTable
      emptyMessage="No employees found."
      rows={employees}
      columns={[
       { key: 'name', label: 'Name', className: 'text-body-md font-semibold text-brand-dark dark:text-dark-brand', render: (v) => v || '—' },
       { key: 'employee_code', label: 'Code', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
       { key: 'email', label: 'Email', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
       { key: 'designation', label: 'Designation', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
       { key: 'department_name', label: 'Department', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
       { key: 'employment_type', label: 'Employment', className: 'text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted', render: (v) => (v || '—').replace('_', ' ') },
       { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'active' ? 'success' : 'neutral'}>{v}</StatusBadge> },
      ]}
     />
     <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
     </div>
    </>
   )}
  </div>
 );
}

function ClientManagement() {
 const [clients, setClients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 useEffect(() => {
  setLoading(true);
  fetchClients({ page, limit: 20 })
   .then((res) => { setClients(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 return (
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
    <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Clients</h3>
   </div>
   {loading ? <div className="p-stack-lg"><SkeletonTable rows={6} columns={4} /></div> : (
    <>
     <PortalTable
      emptyMessage="No clients found."
      rows={clients}
      columns={[
       { key: 'company_name', label: 'Company', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
       { key: 'industry', label: 'Industry', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
       { key: 'country', label: 'Country', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
       { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={v === 'active' ? 'success' : 'neutral'}>{v || 'active'}</StatusBadge> },
      ]}
     />
     <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
     </div>
    </>
   )}
  </div>
 );
}

const PROJECT_STATUS_OPTIONS = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];
const PROJECT_STATUS_VARIANT = {
 planning: 'neutral', in_progress: 'info', on_hold: 'warning', completed: 'success', cancelled: 'error',
};

function AddProjectForm({ onCreated, onCancel, pmOptions }) {
 const [form, setForm] = useState({ title: '', industry: '', status: 'planning', budget: '', project_manager_id: '', is_published: false, is_featured: false });
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending: submitting } = useAsyncAction();
 const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateAddProject(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await run(async () => {
    await createProject({
     title: form.title,
     industry: form.industry || null,
     status: form.status,
     budget: form.budget ? Number(form.budget) : null,
     project_manager_id: form.project_manager_id || null,
     is_published: form.is_published,
     is_featured: form.is_featured,
    });
    onCreated();
   });
  } catch (err) {
   setError(err.message || 'Could not create the project.');
  }
 };

 return (
  <form onSubmit={handleSubmit} className="space-y-4">
   <div className="grid gap-4 sm:grid-cols-2">
    <div>
     <input required type="text" placeholder="Project title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.title && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.title}</p>}
    </div>
    <div>
     <input type="text" placeholder="Industry (optional)" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.industry && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.industry}</p>}
    </div>
    <div>
     <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass + ' w-full'}>
      {PROJECT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
     </select>
     {fieldErrors.status && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.status}</p>}
    </div>
    <div>
     <input type="number" min="0" placeholder="Budget (optional)" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.budget && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.budget}</p>}
    </div>
    <div>
     <select value={form.project_manager_id} onChange={(e) => setForm({ ...form, project_manager_id: e.target.value })} className={inputClass + ' w-full'}>
      <option value="">Unassigned Project Manager</option>
      {pmOptions?.map((pm) => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
     </select>
    </div>
   </div>
   <div className="flex items-center gap-6">
    <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
     <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />Published
    </label>
    <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
     <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} />Featured
    </label>
   </div>
   {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
   <div className="flex gap-2">
    <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Project'}</Button>
    <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
   </div>
  </form>
 );
}

function ProjectsManagement() {
 const [projects, setProjects] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showAddForm, setShowAddForm] = useState(false);
 const [editingProject, setEditingProject] = useState(null);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [pmOptions, setPmOptions] = useState([]);

 const loadProjects = useCallback(() => {
  setLoading(true);
  fetchAdminProjects({ page, limit: 20 })
   .then((res) => { setProjects(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => {
  loadProjects();
 }, [loadProjects]);

 useEffect(() => {
  fetchUsers({ role: 'project_manager', limit: 100 }).then((res) => setPmOptions(res?.data || [])).catch(() => {});
 }, []);

 const pmName = (id) => pmOptions.find((pm) => pm.id === id)?.name || 'Unassigned';

 const handleEdit = (project) => {
  setEditingProject(project);
  setShowAddForm(false);
  setProjectError('');
  setProjectFieldErrors({});
 };

 const handleUpdate = async (e) => {
  e.preventDefault();
  if (!editingProject) return;
  setProjectError('');
  const clientErrors = validateUpdateProject(editingProject);
  if (Object.keys(clientErrors).length > 0) {
   setProjectFieldErrors(clientErrors);
   setProjectError('Please fix the errors below.');
   return;
  }
  setProjectFieldErrors({});
  try {
   await runUpdateProject(async () => {
    await updateProject(editingProject.id, {
     title: editingProject.title,
     industry: editingProject.industry || null,
     status: editingProject.status,
     budget: editingProject.budget ? Number(editingProject.budget) : null,
     project_manager_id: editingProject.project_manager_id || null,
     is_published: editingProject.is_published,
     is_featured: editingProject.is_featured,
     progress_percent: editingProject.progress_percent,
    });
    setEditingProject(null);
    loadProjects();
   });
  } catch (err) {
   setProjectError(err.message || 'Could not update project.');
  }
 };

 const { run: runUpdateProject, isPending: submittingProject } = useAsyncAction();
 const [projectError, setProjectError] = useState('');
 const [projectFieldErrors, setProjectFieldErrors] = useState({});
 const { run: runTogglePublish, isPending: togglingPublish } = useAsyncAction();
 const { run: runRemove, isPending: removing } = useAsyncAction();

 const togglePublish = (project) => runTogglePublish(async () => {
  try {
   await updateProject(project.id, { is_published: !project.is_published });
   loadProjects();
  } catch { /* surfaced via the row staying unchanged */ }
 });

 const remove = (project) => {
  if (!window.confirm(`Delete project "${project.title}"?`)) return;
  runRemove(async () => {
   try {
    await deleteProject(project.id);
    loadProjects();
   } catch { /* surfaced via the row staying in the list */ }
  });
 };

 const projectColumns = [
  { key: 'title', label: 'Title', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
  { key: 'industry', label: 'Industry', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
  { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={PROJECT_STATUS_VARIANT[v] || 'neutral'}>{v?.replace('_', ' ')}</StatusBadge> },
  { key: 'progress_percent', label: 'Progress', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => `${v ?? 0}%` },
  { key: 'project_manager_id', label: 'Project Manager', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => pmName(v) },
  {
   key: 'is_published', label: 'Published',
   render: (v, p) => (
    <button onClick={() => togglePublish(p)} disabled={togglingPublish} className="cursor-pointer disabled:opacity-50">
     <StatusBadge variant={v ? 'success' : 'neutral'}>{v ? 'published' : 'draft'}</StatusBadge>
    </button>
   ),
  },
  {
   key: 'actions', label: 'Actions', className: 'text-right', headerClassName: 'text-right',
   render: (_v, p) => (
    <div className="flex justify-end gap-2">
     <button onClick={() => handleEdit(p)} aria-label={`Edit ${p.title}`} className="text-ink-muted transition-colors hover:text-brand" title="Edit">
      <Icon name="edit" className="text-lg" />
     </button>
     <button onClick={() => remove(p)} disabled={removing} aria-label={`Delete ${p.title}`} className="text-ink-muted transition-colors hover:text-status-error-text disabled:opacity-50" title="Delete">
      <Icon name="delete" className="text-lg" />
     </button>
    </div>
   ),
  },
 ];

 return (
  <div className="space-y-stack-lg">
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">All Projects</h3>
     <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => { setShowAddForm((v) => !v); setEditingProject(null); }}>
      {showAddForm ? 'Close' : 'New Project'}
     </Button>
    </div>
    {(showAddForm || editingProject) && (
     <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
      {editingProject ? (
       <form onSubmit={handleUpdate} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
         <div>
          <input required type="text" placeholder="Project title" value={editingProject.title} onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
          {projectFieldErrors.title && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{projectFieldErrors.title}</p>}
         </div>
         <div>
          <input type="text" placeholder="Industry (optional)" value={editingProject.industry || ''} onChange={(e) => setEditingProject({ ...editingProject, industry: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
          {projectFieldErrors.industry && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{projectFieldErrors.industry}</p>}
         </div>
         <div>
          <select value={editingProject.status} onChange={(e) => setEditingProject({ ...editingProject, status: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'}>
           {PROJECT_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          {projectFieldErrors.status && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{projectFieldErrors.status}</p>}
         </div>
         <div>
          <input type="number" min="0" max="100" placeholder="Progress %" value={editingProject.progress_percent ?? 0} onChange={(e) => setEditingProject({ ...editingProject, progress_percent: Number(e.target.value) })} className={FORM_INPUT_CLASS + ' w-full'} />
          {projectFieldErrors.progress_percent && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{projectFieldErrors.progress_percent}</p>}
         </div>
         <div>
          <input type="number" min="0" placeholder="Budget (optional)" value={editingProject.budget || ''} onChange={(e) => setEditingProject({ ...editingProject, budget: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
          {projectFieldErrors.budget && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{projectFieldErrors.budget}</p>}
         </div>
         <div>
          <select value={editingProject.project_manager_id || ''} onChange={(e) => setEditingProject({ ...editingProject, project_manager_id: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'}>
           <option value="">Unassigned Project Manager</option>
           {pmOptions.map((pm) => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
          </select>
         </div>
        </div>
        <div className="flex items-center gap-6">
         <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
          <input type="checkbox" checked={editingProject.is_published} onChange={(e) => setEditingProject({ ...editingProject, is_published: e.target.checked })} />Published
         </label>
         <label className="flex items-center gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
          <input type="checkbox" checked={editingProject.is_featured} onChange={(e) => setEditingProject({ ...editingProject, is_featured: e.target.checked })} />Featured
         </label>
        </div>
        {projectError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{projectError}</p>}
        <div className="flex gap-2">
         <Button type="submit" variant="primary" size="md" disabled={submittingProject}>{submittingProject ? 'Updating...' : 'Update Project'}</Button>
         <Button type="button" variant="outline" size="md" onClick={() => { setEditingProject(null); setProjectError(''); setProjectFieldErrors({}); }}>Cancel</Button>
        </div>
       </form>
      ) : (
       <AddProjectForm onCreated={() => { setShowAddForm(false); loadProjects(); }} onCancel={() => setShowAddForm(false)} pmOptions={pmOptions} />
      )}
     </div>
    )}
    {loading ? (
     <div className="p-stack-lg"><SkeletonTable rows={6} columns={6} /></div>
    ) : (
     <>
      <PortalTable columns={projectColumns} rows={projects} emptyMessage="No projects found." />
      <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
       <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
     </>
    )}
   </div>
  </div>
 );
}

function AddRoleForm({ onCreated, onCancel }) {
 const [form, setForm] = useState({ name: '', slug: '', description: '' });
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending: submitting } = useAsyncAction();
 const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateAddRole(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await run(async () => {
    await createRole(form);
    onCreated();
   });
  } catch (err) {
   setError(err.message || 'Could not create the role.');
  }
 };

 return (
  <form onSubmit={handleSubmit} className="space-y-4">
   <div className="grid gap-4 sm:grid-cols-2">
    <div>
     <input required type="text" placeholder="Role name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.name && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.name}</p>}
    </div>
    <div>
     <input required type="text" placeholder="Slug (e.g. content-editor)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.slug && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.slug}</p>}
    </div>
   </div>
   <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} w-full`} rows={2} />
   {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
   <div className="flex gap-2">
    <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Role'}</Button>
    <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
   </div>
  </form>
 );
}

function AddPermissionForm({ onCreated, onCancel }) {
 const [form, setForm] = useState({ name: '', module: '', action: '', description: '' });
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending: submitting } = useAsyncAction();
 const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateAddPermission(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await run(async () => {
    await createPermission(form);
    onCreated();
   });
  } catch (err) {
   setError(err.message || 'Could not create the permission.');
  }
 };

 return (
  <form onSubmit={handleSubmit} className="space-y-4">
   <div className="grid gap-4 sm:grid-cols-3">
    <div>
     <input required type="text" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.name && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.name}</p>}
    </div>
    <div>
     <input required type="text" placeholder="Module (e.g. projects)" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.module && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.module}</p>}
    </div>
    <div>
     <input required type="text" placeholder="Action (e.g. delete)" value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.action && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.action}</p>}
    </div>
   </div>
   {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
   <div className="flex gap-2">
    <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Permission'}</Button>
    <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
   </div>
  </form>
 );
}

function RolesManagement() {
 const [roles, setRoles] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showRoleForm, setShowRoleForm] = useState(false);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 const load = useCallback(() => {
  setLoading(true);
  fetchRoles({ page, limit: 20 })
   .then((r) => { setRoles(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => {
  load();
 }, [load]);

 const { run: runRemoveRole, isPending: removingRole } = useAsyncAction();
 const removeRole = (role) => {
  if (!window.confirm(`Delete role "${role.name}"?`)) return;
  runRemoveRole(async () => {
   try { await deleteRole(role.id); load(); } catch { /* row stays visible on failure */ }
  });
 };

 if (loading) return <div className="p-stack-lg"><SkeletonTable rows={6} columns={4} /></div>;

 const roleColumns = [
  { key: 'name', label: 'Name', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
  { key: 'slug', label: 'Slug', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted' },
  { key: 'description', label: 'Description', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
  {
   key: 'actions', label: '', className: 'text-right', headerClassName: 'text-right',
   render: (_v, r) => !r.is_system && (
    <button onClick={() => removeRole(r)} disabled={removingRole} aria-label={`Delete role ${r.name}`} className="text-ink-muted transition-colors hover:text-status-error-text disabled:opacity-50">
     <Icon name="delete" className="text-lg" />
    </button>
   ),
  },
 ];

 return (
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
    <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Custom Roles</h3>
    <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowRoleForm((v) => !v)}>
     {showRoleForm ? 'Close' : 'New Role'}
    </Button>
   </div>
   {showRoleForm && (
    <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
     <AddRoleForm onCreated={() => { setShowRoleForm(false); load(); }} onCancel={() => setShowRoleForm(false)} />
    </div>
   )}
   <PortalTable columns={roleColumns} rows={roles} emptyMessage="No custom roles yet." />
   <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
   </div>
  </div>
 );
}

function PermissionsManagement() {
 const [permissions, setPermissions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showPermForm, setShowPermForm] = useState(false);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 const load = useCallback(() => {
  setLoading(true);
  fetchPermissions({ page, limit: 20 })
   .then((p) => { setPermissions(p?.data || []); setTotalPages(p?.meta?.total_pages || 1); })
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => {
  load();
 }, [load]);

 const { run: runRemovePermission, isPending: removingPermission } = useAsyncAction();
 const removePermission = (perm) => {
  if (!window.confirm(`Delete permission "${perm.name}"?`)) return;
  runRemovePermission(async () => {
   try { await deletePermission(perm.id); load(); } catch { /* row stays visible on failure */ }
  });
 };

 if (loading) return <div className="p-stack-lg"><SkeletonTable rows={6} columns={4} /></div>;

 const permColumns = [
  { key: 'name', label: 'Name', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
  { key: 'module', label: 'Module', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted' },
  { key: 'action', label: 'Action', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted' },
  {
   key: 'actions', label: '', className: 'text-right', headerClassName: 'text-right',
   render: (_v, p) => (
    <button onClick={() => removePermission(p)} disabled={removingPermission} aria-label={`Delete permission ${p.name}`} className="text-ink-muted transition-colors hover:text-status-error-text disabled:opacity-50">
     <Icon name="delete" className="text-lg" />
    </button>
   ),
  },
 ];

 return (
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
    <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Permissions</h3>
    <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowPermForm((v) => !v)}>
     {showPermForm ? 'Close' : 'New Permission'}
    </Button>
   </div>
   {showPermForm && (
    <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
     <AddPermissionForm onCreated={() => { setShowPermForm(false); load(); }} onCancel={() => setShowPermForm(false)} />
    </div>
   )}
   <PortalTable columns={permColumns} rows={permissions} emptyMessage="No permissions yet." />
   <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
   </div>
  </div>
 );
}

function mediaIcon(mimeType) {
 if (!mimeType) return 'insert_drive_file';
 if (mimeType.startsWith('image/')) return 'image';
 if (mimeType.startsWith('video/')) return 'movie';
 if (mimeType === 'application/pdf') return 'picture_as_pdf';
 return 'insert_drive_file';
}

function MediaManagement() {
 const [media, setMedia] = useState([]);
 const [loading, setLoading] = useState(true);
 const { run: runUpload, isPending: uploading } = useAsyncAction();
 const [error, setError] = useState('');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 const loadMedia = useCallback(() => {
  setLoading(true);
  fetchMedia({ page, limit: 24 })
   .then((res) => { setMedia(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => {
  loadMedia();
 }, [loadMedia]);

 const handleUpload = async (e) => {
  const files = e.target.files;
  setError('');
  const clientErrors = validateMediaUpload(files);
  if (Object.keys(clientErrors).length > 0) {
   setError(clientErrors.files);
   e.target.value = '';
   return;
  }
  try {
   await runUpload(async () => {
    await uploadMedia(files, 'misc');
    loadMedia();
   });
  } catch (err) {
   setError(err.message || 'Upload failed.');
  } finally {
   e.target.value = '';
  }
 };

 const { run: runRemoveMedia, isPending: removingMedia } = useAsyncAction();
 const remove = (item) => {
  if (!window.confirm(`Delete "${item.file_name}"?`)) return;
  runRemoveMedia(async () => {
   try { await deleteMedia(item.id); loadMedia(); } catch { /* item stays visible on failure */ }
  });
 };

 return (
  <div className="space-y-stack-lg">
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Media Library</h3>
     <label className="flex cursor-pointer items-center gap-2 rounded bg-brand px-4 py-2.5 font-label-caps text-label-caps uppercase text-white transition-all hover:bg-brand-dark">
      <Icon name="upload_file" className="text-lg" />
      {uploading ? 'Uploading...' : 'Upload Files'}
      <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
     </label>
    </div>
    {error && <p className="flex items-center gap-1 px-stack-lg pt-4 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
    {loading ? (
     <div className="p-stack-lg"><SkeletonTable rows={6} columns={4} /></div>
    ) : (
     <div className="grid grid-cols-2 gap-gutter p-stack-lg sm:grid-cols-3 lg:grid-cols-4">
      {media.map((m) => (
       <div key={m.id} className="group relative overflow-hidden rounded-lg border border-outline-variant dark:border-dark-outline-variant">
        {m.mime_type?.startsWith('image/') ? (
         <img src={m.url} alt={m.file_name} className="h-28 w-full object-cover" />
        ) : (
         <div className="flex h-28 w-full items-center justify-center bg-surface-container dark:bg-dark-surface-container">
          <Icon name={mediaIcon(m.mime_type)} className="text-4xl text-ink-muted" />
         </div>
        )}
        <div className="p-2">
         <p className="truncate text-body-sm text-brand-dark dark:text-dark-brand" title={m.file_name}>{m.file_name}</p>
         <p className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{m.folder}</p>
        </div>
        <button onClick={() => remove(m)} disabled={removingMedia} aria-label={`Delete ${m.file_name}`} className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-ink-muted opacity-0 transition-opacity hover:text-status-error-text disabled:opacity-50 group-hover:opacity-100 dark:bg-dark-surface/90">
         <Icon name="delete" className="text-base" />
        </button>
       </div>
      ))}
      {!media.length && (
       <p className="col-span-full py-8 text-center text-body-sm text-ink-muted">No media uploaded yet.</p>
      )}
     </div>
    )}
    {!loading && (
     <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
     </div>
    )}
   </div>
  </div>
 );
}

const NOTIFICATION_ICON = { info: 'info', success: 'check_circle', warning: 'warning', error: 'error' };
const NOTIFICATION_TEXT = { info: 'text-status-info-text', success: 'text-status-success-text', warning: 'text-status-warning-text', error: 'text-status-error-text' };

function SendNotificationForm({ onSent, onCancel }) {
 const [form, setForm] = useState({ title: '', message: '', type: 'info', link: '', roles: '' });
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending: submitting } = useAsyncAction();
 const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateSendNotification(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await run(async () => {
    const roles = form.roles.split(',').map((r) => r.trim()).filter(Boolean);
    await createNotification({
     title: form.title, message: form.message || undefined, type: form.type,
     link: form.link || undefined, roles: roles.length ? roles : undefined,
    });
    onSent();
   });
  } catch (err) {
   setError(err.message || 'Could not send the notification.');
  }
 };

 return (
  <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="grid gap-4 sm:grid-cols-2">
    <div>
     <input required type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.title && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.title}</p>}
    </div>
    <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
     {['info', 'success', 'warning', 'error'].map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
   </div>
   <textarea placeholder="Message (optional)" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={`${inputClass} w-full`} rows={2} />
   <div className="grid gap-4 sm:grid-cols-2">
    <input type="text" placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputClass} />
    <input type="text" placeholder="Roles (comma-separated, e.g. admin,hr — blank = everyone)" value={form.roles} onChange={(e) => setForm({ ...form, roles: e.target.value })} className={inputClass} />
   </div>
   {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
   <div className="flex gap-2">
    <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Sending...' : 'Send Notification'}</Button>
    <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
   </div>
  </form>
 );
}

// The notifications endpoint (backend/app/routers/notification.py) has no
// page_params support — it just returns the caller's notifications capped
// at 50 — so pagination here is client-side over the loaded array.
const NOTIFICATIONS_PAGE_SIZE = 10;

function NotificationsManagement() {
 const [notifications, setNotifications] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showSend, setShowSend] = useState(false);
 const [page, setPage] = useState(1);

 const load = useCallback(() => {
  setLoading(true);
  fetchNotifications().then((res) => setNotifications(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
 }, []);

 useEffect(() => {
  load();
 }, [load]);

 const totalPages = Math.max(1, Math.ceil(notifications.length / NOTIFICATIONS_PAGE_SIZE));
 const safePage = Math.min(page, totalPages);
 const pagedNotifications = notifications.slice((safePage - 1) * NOTIFICATIONS_PAGE_SIZE, safePage * NOTIFICATIONS_PAGE_SIZE);

 const { run: runMarkOne, isPending: markingOne } = useAsyncAction();
 const { run: runMarkAll, isPending: markingAll } = useAsyncAction();

 const markOne = (n) => runMarkOne(async () => {
  try { await markNotificationRead(n.id); load(); } catch { /* row stays unread on failure */ }
 });

 const markAll = () => runMarkAll(async () => {
  try { await markAllNotificationsRead(); load(); } catch { /* list stays unchanged on failure */ }
 });

 const unreadCount = notifications.filter((n) => !n.is_read).length;

 return (
  <div className="space-y-stack-lg">
   <div className="flex justify-end">
    <Button onClick={() => setShowSend((v) => !v)} variant="primary" size="md" icon={<Icon name="send" />}>Send Notification</Button>
   </div>
   {showSend && <SendNotificationForm onSent={() => { setShowSend(false); load(); }} onCancel={() => setShowSend(false)} />}
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">
      Notifications {unreadCount > 0 && <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">({unreadCount} unread)</span>}
     </h3>
     <Button variant="outline" size="md" icon={<Icon name="done_all" />} onClick={markAll} disabled={!unreadCount || markingAll}>
      {markingAll ? 'Marking...' : 'Mark All Read'}
     </Button>
    </div>
    {loading ? (
     <div className="p-stack-lg"><SkeletonTable rows={6} columns={2} /></div>
    ) : (
     <>
      <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
       {pagedNotifications.map((n) => (
        <div key={n.id} className={`flex items-start gap-4 p-stack-lg ${n.is_read ? '' : 'bg-surface-container dark:bg-dark-surface-container'}`}>
         <Icon name={NOTIFICATION_ICON[n.type] || 'info'} className={`mt-0.5 text-2xl ${NOTIFICATION_TEXT[n.type] || 'text-status-info-text'}`} />
         <div className="flex-1">
          <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{n.title}</p>
          {n.message && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{n.message}</p>}
          <p className="mt-1 font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{new Date(n.created_at).toLocaleString()}</p>
         </div>
         {!n.is_read && (
          <button onClick={() => markOne(n)} disabled={markingOne} aria-label="Mark as read" className="text-ink-muted transition-colors hover:text-brand disabled:opacity-50" title="Mark as read">
           <Icon name="check" className="text-lg" />
          </button>
         )}
        </div>
       ))}
       {!notifications.length && (
        <p className="py-8 text-center text-body-sm text-ink-muted">No notifications.</p>
       )}
      </div>
      <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
       <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
      </div>
     </>
    )}
   </div>
  </div>
 );
}

function GenerateReportForm({ onCreated, onCancel }) {
 const [form, setForm] = useState({ title: '', report_type: '', period: '', summary: '' });
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending: submitting } = useAsyncAction();
 const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateGenerateReport(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await run(async () => {
    await generateReport(form);
    onCreated();
   });
  } catch (err) {
   setError(err.message || 'Could not generate the report.');
  }
 };

 return (
  <form onSubmit={handleSubmit} className="space-y-4">
   <div className="grid gap-4 sm:grid-cols-3">
    <div>
     <input required type="text" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.title && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.title}</p>}
    </div>
    <div>
     <input required type="text" placeholder="Type (e.g. financial)" value={form.report_type} onChange={(e) => setForm({ ...form, report_type: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.report_type && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.report_type}</p>}
    </div>
    <div>
     <input required type="text" placeholder="Period (e.g. Q1 2026)" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.period && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.period}</p>}
    </div>
   </div>
   <textarea placeholder="Summary (optional)" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={`${inputClass} w-full`} rows={2} />
   {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
   <div className="flex gap-2">
    <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Generating...' : 'Generate Report'}</Button>
    <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
   </div>
  </form>
 );
}

function ReportsManagement() {
 const [reports, setReports] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 const load = useCallback(() => {
  setLoading(true);
  fetchReports({ page, limit: 20 })
   .then((res) => { setReports(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => {
  load();
 }, [load]);

 const { run: runRemoveReport, isPending: removingReport } = useAsyncAction();
 const remove = (report) => {
  if (!window.confirm(`Delete report "${report.title}"?`)) return;
  runRemoveReport(async () => {
   try { await deleteReport(report.id); load(); } catch { /* row stays visible on failure */ }
  });
 };

 const reportColumns = [
  { key: 'title', label: 'Title', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
  { key: 'report_type', label: 'Type', className: 'text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted' },
  { key: 'period', label: 'Period', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted' },
  {
   key: 'actions', label: '', className: 'flex items-center justify-end gap-3 text-right', headerClassName: 'text-right',
   render: (_v, r) => (
    <>
     {r.file_url && (
      <a href={r.file_url} target="_blank" rel="noreferrer" aria-label={`Download ${r.title}`} className="text-ink-muted transition-colors hover:text-brand">
       <Icon name="download" className="text-lg" />
      </a>
     )}
     <button onClick={() => remove(r)} disabled={removingReport} aria-label={`Delete ${r.title}`} className="text-ink-muted transition-colors hover:text-status-error-text disabled:opacity-50">
      <Icon name="delete" className="text-lg" />
     </button>
    </>
   ),
  },
 ];

 return (
  <div className="space-y-stack-lg">
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Reports</h3>
     <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowForm((v) => !v)}>
      {showForm ? 'Close' : 'Generate Report'}
     </Button>
    </div>
    {showForm && (
     <div className="border-b border-outline-variant bg-surface-container p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container">
      <GenerateReportForm onCreated={() => { setShowForm(false); load(); }} onCancel={() => setShowForm(false)} />
     </div>
    )}
    {loading ? (
     <div className="p-stack-lg"><SkeletonTable rows={6} columns={4} /></div>
    ) : (
     <>
      <PortalTable columns={reportColumns} rows={reports} emptyMessage="No reports generated yet." />
      <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
       <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
     </>
    )}
   </div>
  </div>
 );
}

// ── Contact Submissions ─────────────────────────────────────────────────────

const CONTACT_STATUS_OPTIONS = [
 { value: 'new', label: 'New', variant: 'info' },
 { value: 'in_progress', label: 'In Progress', variant: 'warning' },
 { value: 'resolved', label: 'Resolved', variant: 'success' },
 { value: 'spam', label: 'Spam', variant: 'error' },
];

function ContactsManagement() {
 const [submissions, setSubmissions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [statusFilter, setStatusFilter] = useState('all');
 const [convertTarget, setConvertTarget] = useState(null);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const { toasts, toast } = useToast();

 const load = useCallback(() => {
  setLoading(true);
  const start = Date.now();
  const params = { page, limit: 20 };
  if (statusFilter !== 'all') params.status = statusFilter;
  fetchContactSubmissions(params)
   .then((res) => { setSubmissions(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => setSubmissions([]))
   .finally(() => {
    const elapsed = Date.now() - start;
    const remaining = 500 - elapsed;
    if (remaining > 0) {
     setTimeout(() => setLoading(false), remaining);
    } else {
     setLoading(false);
    }
   });
 }, [statusFilter, page]);

 useEffect(() => {
  load();
 }, [load]);

 // Changing the status filter must not leave the view on a page number that
 // no longer exists in the filtered result set.
 useEffect(() => {
  setPage(1);
 }, [statusFilter]);

 const { run: runStatusChange, isPending: statusChanging } = useAsyncAction();

 const markAsResolved = (submission) => runStatusChange(async () => {
  try {
   await updateContactStatus(submission.id, 'resolved');
   toast('Marked as resolved');
   load();
  } catch { toast('Failed to update status', 'error'); }
 });

 const markAsInProgress = (submission) => runStatusChange(async () => {
  try {
   await updateContactStatus(submission.id, 'in_progress');
   toast('Marked as in progress');
   load();
  } catch { toast('Failed to update status', 'error'); }
 });

 const markAsSpam = (submission) => runStatusChange(async () => {
  try {
   await updateContactStatus(submission.id, 'spam');
   toast('Marked as spam');
   load();
  } catch { toast('Failed to update status', 'error'); }
 });

 const handleLeadConverted = async (submission) => {
  setConvertTarget(null);
  toast(`${submission.name} converted to lead successfully!`);
  // Also mark as in_progress so the contact shows follow-up is happening
  try { await updateContactStatus(submission.id, 'in_progress'); } catch { /* non-critical */ }
  load();
 };

 const newCount = submissions.filter((s) => s.status === 'new').length;

 return (
  <div className="space-y-stack-lg">
   <Toast toasts={toasts} />
   {convertTarget && (
    <ConvertToLeadModal
     submission={convertTarget}
     onClose={() => setConvertTarget(null)}
     onSuccess={() => handleLeadConverted(convertTarget)}
    />
   )}
   <div className="rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <div className="flex items-center gap-4">
      <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Contact Submissions</h3>
      {newCount > 0 && (
       <span className="rounded-full bg-status-info-text/10 px-2.5 py-0.5 text-xs font-medium text-status-info-text">
        {newCount} new
       </span>
      )}
     </div>
     <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="rounded border border-outline-variant bg-white px-3 py-1.5 text-body-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink"
     >
      <option value="all">All Statuses</option>
      <option value="new">New</option>
      <option value="in_progress">In Progress</option>
      <option value="resolved">Resolved</option>
      <option value="spam">Spam</option>
     </select>
    </div>

    {loading ? (
     <div className="p-stack-lg"><SkeletonTable rows={6} columns={10} /></div>
    ) : (
     <div className="responsive-table overflow-x-auto custom-scrollbar pb-4">
      <table className="w-full min-w-[1200px] text-left">
       <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted whitespace-nowrap">
        <tr>
         <th className="px-stack-lg py-4">Name</th>
         <th className="px-stack-lg py-4">Email</th>
         <th className="px-stack-lg py-4">Phone</th>
         <th className="px-stack-lg py-4">Company</th>
         <th className="px-stack-lg py-4">Department</th>
         <th className="px-stack-lg py-4">Subject</th>
         <th className="px-stack-lg py-4">Message</th>
         <th className="px-stack-lg py-4">Status</th>
         <th className="px-stack-lg py-4">Submitted</th>
         <th className="px-stack-lg py-4">Actions</th>
        </tr>
       </thead>
       <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
        {submissions.map((s) => (
         <tr key={s.id} className="transition-colors hover:bg-accent-cyan-pale dark:hover:bg-white/5">
          <td data-label="Name" className="px-stack-lg py-4 text-body-md font-semibold text-brand-dark dark:text-dark-brand">{s.name}</td>
          <td data-label="Email" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.email}</td>
          <td data-label="Phone" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.phone || '—'}</td>
          <td data-label="Company" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.company || '—'}</td>
          <td data-label="Department" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.department?.replace('_', ' ') || '—'}</td>
          <td data-label="Subject" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.subject || '—'}</td>
          <td data-label="Message" className="max-w-xs truncate px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.message}</td>
          <td data-label="Status" className="px-stack-lg py-4">
           <StatusBadge variant={CONTACT_STATUS_OPTIONS.find((o) => o.value === s.status)?.variant || 'neutral'}>
            {s.status?.replace('_', ' ') || 'new'}
           </StatusBadge>
          </td>
          <td data-label="Submitted" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">
           {s.created_at ? new Date(s.created_at).toLocaleString() : '—'}
          </td>
          <td data-label="Actions" className="px-stack-lg py-4">
           <div className="flex items-center gap-1">
            {/* Convert to Lead */}
            {!s.lead_id && s.status !== 'spam' && (
             <button
              onClick={() => setConvertTarget(s)}
              aria-label="Convert to Lead"
              className="rounded p-1 text-ink-muted transition-colors hover:bg-accent-cyan-pale hover:text-brand dark:text-dark-ink-muted dark:hover:bg-brand/10"
              title="Convert to Lead"
             >
              <Icon name="person_add" />
             </button>
            )}
            {/* Mark in progress */}
            {s.status !== 'in_progress' && s.status !== 'resolved' && (
             <button
              onClick={() => markAsInProgress(s)}
              disabled={statusChanging}
              aria-label="Mark in progress"
              className="rounded p-1 text-ink-muted transition-colors hover:bg-surface-container hover:text-status-info-text disabled:opacity-50 dark:text-dark-ink-muted"
              title="Mark in progress"
             >
              <Icon name="schedule" />
             </button>
            )}
            {/* Mark resolved */}
            {s.status !== 'resolved' && s.status !== 'spam' && (
             <button
              onClick={() => markAsResolved(s)}
              disabled={statusChanging}
              aria-label="Mark resolved"
              className="rounded p-1 text-ink-muted transition-colors hover:bg-surface-container hover:text-status-success-text disabled:opacity-50 dark:text-dark-ink-muted"
              title="Mark resolved"
             >
              <Icon name="check_circle" />
             </button>
            )}
            {/* Mark spam */}
            {s.status !== 'spam' && (
             <button
              onClick={() => markAsSpam(s)}
              disabled={statusChanging}
              aria-label="Mark as spam"
              className="rounded p-1 text-ink-muted transition-colors hover:bg-surface-container hover:text-status-error-text disabled:opacity-50 dark:text-dark-ink-muted"
              title="Mark as spam"
             >
              <Icon name="report" />
             </button>
            )}
           </div>
          </td>
         </tr>
        ))}
        {!submissions.length && (
         <tr>
          <td data-label="Name" colSpan={10} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">
           No contact submissions found.
          </td>
         </tr>
        )}
       </tbody>
      </table>
     </div>
    )}
    {!loading && (
     <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
     </div>
    )}
   </div>
  </div>
 );
}

// ── Analytics ────────────────────────────────────────────────────────────────
function AnalyticsManagement() {
 const [summary, setSummary] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');

 useEffect(() => {
  setLoading(true);
  fetchAnalyticsSummary()
   .then((res) => setSummary(res?.data || null))
   .catch((err) => setError(err?.message || 'Could not load analytics.'))
   .finally(() => setLoading(false));
 }, []);

 if (loading) return <div className="p-stack-lg"><SkeletonTable rows={6} columns={2} /></div>;
 if (error) return <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>;
 if (!summary) return <p className="text-body-sm text-ink-muted">No analytics data yet.</p>;

 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div className="rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
     <p className="text-stat-md font-stat text-brand-dark dark:text-dark-brand">{summary.total_views ?? 0}</p>
     <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Total Page Views</p>
    </div>
    <div className="rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
     <p className="text-stat-md font-stat text-brand-dark dark:text-dark-brand">{summary.unique_paths ?? 0}</p>
     <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Unique Pages Visited</p>
    </div>
   </div>
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Top Pages</h3>
    </div>
    <PortalTable
     emptyMessage="No page views recorded yet."
     rows={summary.top_pages || []}
     columns={[
      { key: 'path', label: 'Path', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
      { key: 'count', label: 'Views', className: 'text-body-md text-ink-muted dark:text-white' },
     ]}
    />
   </div>
  </div>
 );
}

// ── Settings ─────────────────────────────────────────────────────────────────
// The settings endpoint (backend/app/routers/settings.py) has no page_params
// support — it just returns every setting matching the optional group filter —
// so pagination here is client-side over the loaded array.
const SETTINGS_PAGE_SIZE = 10;

function SettingsManagement() {
 const [settings, setSettings] = useState([]);
 const [loading, setLoading] = useState(true);
 const [editingKey, setEditingKey] = useState(null);
 const [editValue, setEditValue] = useState('');
 const [editError, setEditError] = useState('');
 const { run: runSaveEdit, isPending: saving } = useAsyncAction();
 const [newKey, setNewKey] = useState({ key: '', value: '', group: 'general' });
 const [showNew, setShowNew] = useState(false);
 const [newError, setNewError] = useState('');
 const [newFieldErrors, setNewFieldErrors] = useState({});
 const { run: runCreateSetting, isPending: creatingSetting } = useAsyncAction();
 const [page, setPage] = useState(1);

 const load = useCallback(() => {
  setLoading(true);
  fetchSettings().then((res) => setSettings(res?.data || [])).catch(() => {}).finally(() => setLoading(false));
 }, []);

 useEffect(() => { load(); }, [load]);

 const totalPages = Math.max(1, Math.ceil(settings.length / SETTINGS_PAGE_SIZE));
 const safePage = Math.min(page, totalPages);
 const pagedSettings = settings.slice((safePage - 1) * SETTINGS_PAGE_SIZE, safePage * SETTINGS_PAGE_SIZE);

 const startEdit = (s) => { setEditingKey(s.key); setEditValue(typeof s.value === 'string' ? s.value : JSON.stringify(s.value)); setEditError(''); };

 const saveEdit = async (group) => {
  setEditError('');
  try {
   await runSaveEdit(async () => {
    await upsertSetting(editingKey, { value: editValue, group });
    setEditingKey(null);
    load();
   });
  } catch (err) {
   setEditError(err.message || 'Could not save the setting.');
  }
 };

 const createSetting = async (e) => {
  e.preventDefault();
  setNewError('');
  const clientErrors = validateNewSetting(newKey);
  if (Object.keys(clientErrors).length > 0) {
   setNewFieldErrors(clientErrors);
   setNewError('Please fix the errors below.');
   return;
  }
  setNewFieldErrors({});
  try {
   await runCreateSetting(async () => {
    await upsertSetting(newKey.key.trim(), { value: newKey.value, group: newKey.group || 'general' });
    setNewKey({ key: '', value: '', group: 'general' });
    setShowNew(false);
    load();
   });
  } catch (err) {
   setNewError(err.message || 'Could not create the setting.');
  }
 };

 const { run: runRemoveSetting, isPending: removingSetting } = useAsyncAction();
 const remove = (key) => {
  if (!window.confirm(`Delete setting "${key}"?`)) return;
  runRemoveSetting(async () => {
   await deleteSetting(key);
   load();
  });
 };

 if (loading) return <div className="p-stack-lg"><SkeletonTable rows={6} columns={4} /></div>;

 return (
  <div className="space-y-stack-lg">
   <div className="flex justify-end">
    <Button onClick={() => setShowNew((v) => !v)} variant="primary" size="md" icon={<Icon name="add" />}>New Setting</Button>
   </div>
   {showNew && (
    <form onSubmit={createSetting} className="grid grid-cols-1 gap-3 rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface sm:grid-cols-3">
     <div>
      <input placeholder="Key (e.g. site.title)" value={newKey.key} onChange={(e) => setNewKey({ ...newKey, key: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
      {newFieldErrors.key && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{newFieldErrors.key}</p>}
     </div>
     <input placeholder="Value" value={newKey.value} onChange={(e) => setNewKey({ ...newKey, value: e.target.value })} className={FORM_INPUT_CLASS} />
     <input placeholder="Group (e.g. general)" value={newKey.group} onChange={(e) => setNewKey({ ...newKey, group: e.target.value })} className={FORM_INPUT_CLASS} />
     {newError && <p className="flex items-center gap-1 text-body-sm text-status-error-text sm:col-span-3"><Icon name="error" className="text-base" />{newError}</p>}
     <div className="flex gap-2 sm:col-span-3">
      <Button type="submit" variant="primary" size="md" disabled={creatingSetting}>{creatingSetting ? 'Saving...' : 'Save'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => setShowNew(false)}>Cancel</Button>
     </div>
    </form>
   )}
   {editError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{editError}</p>}
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="overflow-x-auto">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr><th className="px-stack-lg py-4">Key</th><th className="px-stack-lg py-4">Group</th><th className="px-stack-lg py-4">Value</th><th className="px-stack-lg py-4"></th></tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {pagedSettings.map((s) => (
       <tr key={s.key} className="transition-colors hover:bg-surface-low dark:hover:bg-dark-surface-low">
        <td data-label="Key" className="px-stack-lg py-4 font-label-caps text-label-caps text-brand">{s.key}</td>
        <td data-label="Group" className="px-stack-lg py-4"><Badge className="text-label-caps">{s.group}</Badge></td>
        <td data-label="Value" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-white">
         {editingKey === s.key
          ? <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className={FORM_INPUT_CLASS} autoFocus />
          : (typeof s.value === 'string' ? s.value : JSON.stringify(s.value))}
        </td>
        <td data-label="Key" className="px-stack-lg py-4">
         <div className="flex gap-2">
          {editingKey === s.key ? (
           <>
            <button onClick={() => saveEdit(s.group)} disabled={saving} aria-label="Save" className="text-brand hover:text-brand-dark"><Icon name="check" /></button>
            <button onClick={() => { setEditingKey(null); setEditError(''); }} aria-label="Cancel" className="text-ink-muted hover:text-ink"><Icon name="close" /></button>
           </>
          ) : (
           <>
            <button onClick={() => startEdit(s)} aria-label={`Edit ${s.key}`} className="text-brand hover:text-brand-dark"><Icon name="edit" /></button>
            <button onClick={() => remove(s.key)} disabled={removingSetting} aria-label={`Delete ${s.key}`} className="text-status-error-text hover:opacity-70 disabled:opacity-50"><Icon name="delete" /></button>
           </>
          )}
         </div>
        </td>
       </tr>
      ))}
      {!settings.length && (
       <tr><td data-label="Key" colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted">No settings configured yet.</td></tr>
      )}
     </tbody>
    </table>
    </div>
    <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
    </div>
   </div>
  </div>
 );
}


// ── Careers: job postings + application review ──────────────────────────────
function NewCareerForm({ onCreated, onCancel }) {
 const [form, setForm] = useState({ title: '', department: '', location: '', employment_type: 'full_time', description: '' });
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending: submitting } = useAsyncAction();
 const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md dark:text-dark-ink bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateNewCareer(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await run(async () => {
    await careersApi.create({
     title: form.title,
     department: form.department || undefined,
     location: form.location || undefined,
     employment_type: form.employment_type,
     description: form.description || undefined,
    });
    onCreated();
   });
  } catch (err) {
   setError(err.message || 'Could not create the job posting.');
  }
 };

 return (
  <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="grid gap-4 sm:grid-cols-3">
    <div>
     <input required type="text" placeholder="Job title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.title && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.title}</p>}
    </div>
    <div>
     <input type="text" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.department && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.department}</p>}
    </div>
    <div>
     <input type="text" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputClass + ' w-full'} />
     {fieldErrors.location && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.location}</p>}
    </div>
   </div>
   <select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className={inputClass}>
    <option value="full_time">Full-time</option>
    <option value="part_time">Part-time</option>
    <option value="contract">Contract</option>
    <option value="internship">Internship</option>
   </select>
   <textarea placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} w-full`} rows={2} />
   {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
   <div className="flex gap-2">
    <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Posting...' : 'Post Position'}</Button>
    <Button type="button" variant="outline" size="md" onClick={onCancel}>Cancel</Button>
   </div>
  </form>
 );
}

function CareersManagement() {
 const [careers, setCareers] = useState([]);
 const [applications, setApplications] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showNew, setShowNew] = useState(false);
 const [statusFilter, setStatusFilter] = useState('');
 const [careersPage, setCareersPage] = useState(1);
 const [careersTotalPages, setCareersTotalPages] = useState(1);
 const [appsPage, setAppsPage] = useState(1);
 const [appsTotalPages, setAppsTotalPages] = useState(1);

 const load = useCallback(() => {
  setLoading(true);
  Promise.all([
   careersApi.list({ page: careersPage, limit: 20 }),
   fetchApplications({ page: appsPage, limit: 20, ...(statusFilter ? { status: statusFilter } : {}) }),
  ])
   .then(([c, a]) => {
    setCareers(c?.data || []);
    setCareersTotalPages(c?.meta?.total_pages || 1);
    setApplications(a?.data || []);
    setAppsTotalPages(a?.meta?.total_pages || 1);
   })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [statusFilter, careersPage, appsPage]);

 useEffect(() => { load(); }, [load]);

 // Changing the application status filter must not leave the applications
 // list on a page number that no longer exists in the filtered result set.
 useEffect(() => {
  setAppsPage(1);
 }, [statusFilter]);

 const careerTitleById = Object.fromEntries(careers.map((c) => [c.id, c.title]));

 const { run: runSetAppStatus, isPending: settingAppStatus } = useAsyncAction();
 const setAppStatus = (id, status) => runSetAppStatus(async () => {
  await updateApplicationStatus(id, status);
  load();
 });

 return (
  <div className="space-y-stack-xl">
   <div>
    <div className="mb-4 flex items-center justify-between">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Open Positions</h3>
     <Button onClick={() => setShowNew((v) => !v)} variant="primary" size="md" icon={<Icon name="add" />}>New Position</Button>
    </div>
    {showNew && <NewCareerForm onCreated={() => { setShowNew(false); load(); }} onCancel={() => setShowNew(false)} />}
    <div className="responsive-table mt-4 overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
     {loading ? <div className="p-stack-lg"><SkeletonTable rows={6} columns={4} /></div> : (
      <>
       <PortalTable
        emptyMessage="No open positions — this list only shows currently-open postings."
        rows={careers}
        columns={[
         { key: 'title', label: 'Title', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
         { key: 'department', label: 'Department', className: 'text-body-md text-ink-muted dark:text-white', render: (v) => v || '—' },
         { key: 'location', label: 'Location', className: 'text-body-md text-ink-muted dark:text-white', render: (v) => v || '—' },
         { key: 'employment_type', label: 'Type', render: (v) => <Badge className="text-label-caps">{v?.replace('_', ' ')}</Badge> },
        ]}
       />
       <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
        <Pagination page={careersPage} totalPages={careersTotalPages} onChange={setCareersPage} />
       </div>
      </>
     )}
    </div>
   </div>

   <div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Applications</h3>
     <div className="flex gap-2">
      {['', 'applied', 'shortlisted', 'interview', 'offered', 'rejected', 'hired'].map((s) => (
       <button key={s || 'all'} onClick={() => setStatusFilter(s)}
        className={`rounded-full px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${statusFilter === s ? 'bg-brand text-white' : 'bg-surface-container text-ink-muted dark:bg-dark-surface-container'}`}>
        {s || 'all'}
       </button>
      ))}
     </div>
    </div>
    <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
     {loading ? <div className="p-stack-lg"><SkeletonTable rows={6} columns={4} /></div> : (
      <>
      <PortalTable
       emptyMessage={`No applications${statusFilter ? ` with status "${statusFilter}"` : ''} yet.`}
       rows={applications}
       columns={[
        {
         key: 'full_name', label: 'Applicant',
         render: (_v, a) => (
          <div>
           <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{a.full_name}</p>
           <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{a.email}</p>
          </div>
         ),
        },
        { key: 'career_id', label: 'Position', className: 'text-body-md text-ink-muted dark:text-white', render: (v) => careerTitleById[v] || '—' },
        {
         key: 'resume_url', label: 'Resume',
         render: (v) => (
          <a href={v} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-body-sm text-brand hover:text-brand-dark">
           <Icon name="description" className="text-lg" />Resume
          </a>
         ),
        },
        {
         key: 'status', label: 'Status',
         render: (v, a) => (
          <select
           value={v}
           onChange={(e) => setAppStatus(a.id, e.target.value)}
           disabled={settingAppStatus}
           aria-label={`Status for ${a.full_name}`}
           className="rounded border border-outline-variant bg-white px-2 py-1 text-body-sm disabled:opacity-50 dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink"
          >
           {['applied', 'shortlisted', 'interview', 'offered', 'rejected', 'hired'].map((s) => (
            <option key={s} value={s}>{s}</option>
           ))}
          </select>
         ),
        },
       ]}
      />
      <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
       <Pagination page={appsPage} totalPages={appsTotalPages} onChange={setAppsPage} />
      </div>
      </>
     )}
    </div>
   </div>
  </div>
 );
}

// ── Blog Comment Moderation ──────────────────────────────────────────────────
function CommentsManagement() {
 const [comments, setComments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState('pending');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 const load = useCallback(() => {
  setLoading(true);
  fetchComments({ page, limit: 20, ...(filter ? { status: filter } : {}) })
   .then((res) => { setComments(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [filter, page]);

 useEffect(() => { load(); }, [load]);

 // Changing the moderation filter must not leave the view on a page number
 // that no longer exists in the filtered result set.
 useEffect(() => {
  setPage(1);
 }, [filter]);

 const { run: runModerate, isPending: moderating } = useAsyncAction();
 const { run: runRemoveComment, isPending: removingComment } = useAsyncAction();
 const moderate = (id, status) => runModerate(async () => { await moderateComment(id, status); load(); });
 const remove = (id) => {
  if (!window.confirm('Permanently delete this comment?')) return;
  runRemoveComment(async () => { await deleteComment(id); load(); });
 };

 return (
  <div className="space-y-stack-lg">
   <div className="flex gap-2">
    {['pending', 'approved', 'rejected'].map((s) => (
     <button key={s} onClick={() => setFilter(s)}
      className={`rounded-full px-4 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${filter === s ? 'bg-brand text-white' : 'bg-surface-container text-ink-muted dark:bg-dark-surface-container'}`}>
      {s}
     </button>
    ))}
   </div>
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    {loading ? <div className="p-stack-lg"><SkeletonTable rows={6} columns={2} /></div> : (
     <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {comments.map((c) => (
       <div key={c.id} className="flex items-start justify-between gap-4 p-stack-lg">
        <div className="min-w-0 flex-1">
         <p className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{c.name} <span className="font-normal text-ink-muted">&middot; {c.email}</span></p>
         <p className="mt-1 text-body-sm text-ink dark:text-white">{c.content}</p>
        </div>
        <div className="flex shrink-0 gap-2">
         {c.status !== 'approved' && (
          <button onClick={() => moderate(c.id, 'approved')} disabled={moderating} aria-label="Approve comment" className="text-status-success-text hover:opacity-70 disabled:opacity-50" title="Approve"><Icon name="check_circle" className="text-xl" /></button>
         )}
         {c.status !== 'rejected' && (
          <button onClick={() => moderate(c.id, 'rejected')} disabled={moderating} aria-label="Reject comment" className="text-status-error-text hover:opacity-70 disabled:opacity-50" title="Reject"><Icon name="cancel" className="text-xl" /></button>
         )}
         <button onClick={() => remove(c.id)} disabled={removingComment} aria-label="Delete comment" className="text-ink-muted hover:text-status-error-text disabled:opacity-50" title="Delete"><Icon name="delete" className="text-xl" /></button>
        </div>
       </div>
      ))}
      {!comments.length && <p className="py-8 text-center text-body-sm text-ink-muted">No {filter} comments.</p>}
     </div>
    )}
    {!loading && (
     <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
     </div>
    )}
   </div>
  </div>
 );
}

// ── Newsletter Subscribers ───────────────────────────────────────────────────
function NewsletterManagement() {
 const [subscribers, setSubscribers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 useEffect(() => {
  setLoading(true);
  fetchNewsletterSubscribers({ is_active: true, page, limit: 20 })
   .then((res) => { setSubscribers(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 if (loading) return <div className="p-stack-lg"><SkeletonTable rows={6} columns={3} /></div>;

 return (
  <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
    <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Newsletter Subscribers ({subscribers.length} active)</h3>
   </div>
   <PortalTable
    emptyMessage="No active subscribers yet."
    rows={subscribers}
    columns={[
     { key: 'email', label: 'Email', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
     { key: 'name', label: 'Name', className: 'text-body-md text-ink-muted dark:text-white', render: (v) => v || '—' },
     { key: 'subscribed_at', label: 'Subscribed', className: 'text-body-md text-ink-muted dark:text-white', render: (v) => (v ? new Date(v).toLocaleDateString() : '—') },
    ]}
   />
   <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
   </div>
  </div>
 );
}

function AuditLogsManagement() {
 const [logs, setLogs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 useEffect(() => {
  setLoading(true);
  fetchAuditLogs({ page, limit: 20 })
   .then((res) => { setLogs(res?.data || []); setTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 return (
  <div className="space-y-stack-lg">
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
    <div className="border-b border-outline-variant p-stack-lg dark:border-dark-outline-variant">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Audit Logs</h3>
    </div>
    {loading ? (
     <div className="p-stack-lg"><SkeletonTable rows={6} columns={4} /></div>
    ) : (
     <>
      <PortalTable
       emptyMessage="No audit log entries yet."
       rows={logs}
       columns={[
        { key: 'action', label: 'Action', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
        { key: 'entity_type', label: 'Entity', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
        { key: 'ip_address', label: 'IP Address', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
        { key: 'created_at', label: 'When', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => new Date(v).toLocaleString() },
       ]}
      />
      <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
       <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
     </>
    )}
   </div>
  </div>
 );
}

export default function AdminPanel() {
 useDocumentTitle('Admin Panel | CoralSwift Technologies');
 const { user, initializing, logout } = useAuth();
 const { denied } = useRoleGuard('admin', '/login');
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('overview');
 const [loading, setLoading] = useState(true);
 const initialLoadDone = useRef(false);
 const [kpis, setKpis] = useState(null);
 const [statusBreakdown, setStatusBreakdown] = useState(null);
 const [currentRole, setCurrentRole] = useState(null);
 const [currentUser, setCurrentUser] = useState(null);

 useEffect(() => {
  if (!user) { setLoading(false); return; }
  if (!initialLoadDone.current) setLoading(true);
  const userRole = user?.role || 'admin';
  setCurrentRole(userRole);
  setCurrentUser({ name: user?.name || user?.email, email: user?.email, role: userRole });
  Promise.allSettled([
   fetchDashboardOverview(),
   fetchProjectStatusBreakdownApi(),
  ]).then(([d, sb]) => {
   if (d.status === 'fulfilled') setKpis(d.value?.data || null);
   if (sb.status === 'fulfilled') setStatusBreakdown(sb.value?.data || null);
  }).finally(() => { initialLoadDone.current = true; setLoading(false); });
 }, [user]);

 // useRoleGuard already redirects both the unauthenticated case (to
 // /login?returnTo=..., preserving destination) and the wrong-role case —
 // this only needs to keep blocking render for a role the guard doesn't
 // itself know about (a stale currentRole value read before hydration).
 useEffect(() => {
  if (!loading && currentRole && !['admin', 'super_admin'].includes(currentRole)) {
   navigate('/login', { replace: true });
  }
 }, [loading, currentRole, navigate]);

 if (initializing) {
  return <div className="bg-surface-container py-section-padding"><LoadingSpinner /></div>;
 }

 if (!user || denied || (!loading && currentRole && !['admin', 'super_admin'].includes(currentRole))) {
  return <div className="bg-surface-container py-section-padding"><LoadingSpinner /></div>;
 }

 if (loading) {
  return <div className="bg-surface-container py-section-padding"><LoadingSpinner /></div>;
 }

  return (
   <div className="flex h-dvh flex-col bg-surface dark:bg-dark-surface">
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-outline-variant bg-white px-4 py-3 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface sm:gap-4 sm:px-6 lg:px-10 xl:px-12">
     <div className="flex min-w-0 items-center gap-3 sm:gap-4">
      <img src="/logo-icon.png" alt="CoralSwift Emblem" className="h-9 w-auto shrink-0 object-contain" />
      <div className="hidden h-7 w-px bg-outline-variant sm:block dark:bg-dark-outline-variant" />
      <Avatar name={currentUser?.name || 'Admin'} size="md" />
      <div className="min-w-0">
       <h1 className="max-w-[40vw] truncate font-display text-headline-sm font-bold text-brand-dark sm:max-w-none dark:text-white">{currentUser?.name || 'Admin'}</h1>
       <p className="hidden text-body-sm text-ink-muted sm:block dark:text-dark-ink-muted">{currentUser?.email || ''} &middot; <span className="font-semibold text-brand">{(currentUser?.role || currentRole || 'admin').replace('_', ' ')}</span></p>
      </div>
     </div>
     <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <Button variant="primary" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
       Sign Out
      </Button>
     </div>
    </div>

   <div className="flex min-h-0 flex-1">
    <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-outline-variant bg-white md:block dark:border-dark-outline-variant dark:bg-dark-surface">
     <nav aria-label="Portal navigation" className="flex flex-col gap-1.5 p-3">
      {adminPanelTabs.map((tab) => (
       <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-label-caps text-label-caps uppercase transition-all ${
         activeTab === tab.id ? 'bg-brand font-bold text-white shadow-sm' : 'font-semibold text-ink-muted hover:bg-brand/10 hover:text-brand dark:text-dark-ink-muted dark:hover:bg-dark-surface-container dark:hover:text-dark-brand'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </nav>
    </aside>

    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
     <Tabs
      tabs={adminPanelTabs.map((tab) => ({ key: tab.id, label: tab.label, icon: <Icon name={tab.icon} className="text-lg" /> }))}
      active={activeTab}
      onChange={setActiveTab}
      variant="underline"
      ariaLabel="Portal navigation"
      tabClassName={(selected) =>
       `flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-label-caps text-label-caps uppercase transition-colors ${
        selected ? 'border-brand font-bold text-brand' : 'border-transparent font-semibold text-ink-muted hover:border-brand/40 hover:text-ink dark:text-dark-ink-muted dark:hover:text-white'
       }`
      }
      className="scrollbar-hide mb-stack-lg flex gap-1 overflow-x-auto border-b border-outline-variant bg-white px-4 py-2 sm:px-6 md:hidden lg:px-10 xl:px-12 dark:border-dark-outline-variant dark:bg-dark-surface"
     />

     <div className="min-w-0 flex-1 overflow-auto bg-surface px-4 py-stack-lg sm:px-6 lg:px-10 xl:px-12 dark:bg-dark-surface">
      {activeTab === 'overview' && <Dashboard kpis={kpis} statusBreakdown={statusBreakdown} setActiveTab={setActiveTab} />}
      {activeTab === 'content' && <ContentManagement />}
      {activeTab === 'contacts' && <ContactsManagement />}
      {activeTab === 'projects' && <ProjectsManagement />}
      {activeTab === 'users' && <UserManagement currentRole={currentRole} />}
      {activeTab === 'employees' && <EmployeeManagement />}
      {activeTab === 'clients' && <ClientManagement />}
      {activeTab === 'roles' && <RolesManagement />}
      {activeTab === 'permissions' && <PermissionsManagement />}
      {activeTab === 'media' && <MediaManagement />}
      {activeTab === 'notifications' && <NotificationsManagement />}
      {activeTab === 'reports' && <ReportsManagement />}
      {activeTab === 'careers' && <CareersManagement />}
      {activeTab === 'comments' && <CommentsManagement />}
      {activeTab === 'newsletter' && <NewsletterManagement />}
      {activeTab === 'analytics' && <AnalyticsManagement />}
      {activeTab === 'settings' && <SettingsManagement />}
      {activeTab === 'logs' && <AuditLogsManagement />}
     </div>
    </div>
   </div>
  </div>
 );
}
