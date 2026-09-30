import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Button from '../components/ui/Button.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { SkeletonTable } from '../components/ui/Skeleton.jsx';
import RowAction from '../components/ui/RowAction.jsx';
import { PortalTable } from '../components/ui/ResponsiveTable.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { FORM_INPUT_CLASS } from '../components/ui/formClasses.js';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRoleGuard } from '../hooks/useRoleGuard.js';
import useAsyncAction from '../hooks/useAsyncAction.js';
import { useAuth } from '../context/AuthContext.jsx';
// demo data removed — all data now fetched from API
import {
 fetchDepartments, createDepartment, deleteDepartment,
 fetchRoles, createRole, deleteRole, fetchPermissions, createPermission, deletePermission,
 fetchUsers, exportUserData, anonymizeUser,
 fetchAuditLogs, fetchDashboardOverview,
 fetchBackups, triggerBackup, deleteBackup, backupDownloadUrl,
} from '../api/admin.js';
import { validateCreateDepartment, validateCreateRole, validateCreatePermission } from '../schemas/super-admin.schema.js';

const superAdminTabs = [
 { id: 'overview', label: 'Overview', icon: 'dashboard' },
 { id: 'departments', label: 'Departments', icon: 'apartment' },
 { id: 'roles', label: 'Roles & Permissions', icon: 'verified_user' },
 { id: 'gdpr', label: 'Data Export / GDPR', icon: 'privacy_tip' },
 { id: 'audit', label: 'Audit Logs', icon: 'history' },
 { id: 'backups', label: 'Backups', icon: 'backup' },
 { id: 'billing', label: 'Billing', icon: 'account_balance' },
 { id: 'impersonation', label: 'Impersonation', icon: 'switch_account' },
];

function ComingSoon({ icon, title, description }) {
 return (
  <div className="rounded-lg border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg py-12 text-center dark:border-dark-outline-variant">
   <Icon name={icon} className="mb-3 text-4xl text-ink-muted dark:text-dark-ink-muted" />
   <h3 className="mb-2 font-display text-headline-sm text-brand-dark dark:text-white">{title}</h3>
   <p className="mx-auto max-w-md text-body-sm text-ink-muted dark:text-dark-ink-muted">{description}</p>
  </div>
 );
}

function Overview() {
 const [kpis, setKpis] = useState({ total_employees: 0, total_clients: 0, total_projects: 0, active_projects: 0, open_tasks: 0, total_revenue: 0, open_tickets: 0, new_applications: 0, unresolved_contacts: 0, published_blogs: 0 });
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetchDashboardOverview().then((res) => setKpis(res?.data || {})).catch(() => {}).finally(() => setLoading(false));
 }, []);

 if (loading) return <SkeletonTable rows={4} columns={2} />;
 const cards = [
  { label: 'Employees', value: kpis.total_employees, icon: 'badge', color: 'text-brand', bg: 'bg-accent-cyan-pale dark:bg-blue-900/30' },
  { label: 'Clients', value: kpis.total_clients, icon: 'business', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Projects', value: kpis.total_projects, icon: 'folder', color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Revenue', value: `$${(kpis.total_revenue / 1000000).toFixed(1)}M`, icon: 'payments', color: 'text-amber-600', bg: 'bg-amber-50' },
 ];
 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
    {cards.map((c) => (
     <div key={c.label} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-outline-variant">
      <div className={`mb-4 inline-flex size-11 items-center justify-center rounded-xl ${c.bg}`}>
       <Icon name={c.icon} className={`text-2xl ${c.color}`} />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-white">{c.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{c.label}</p>
     </div>
    ))}
   </div>
   <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
    <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
     This company-wide summary plus every screen in Admin Panel is available here. The tabs on the left are exclusive to Super Admin:
     org structure, the global role/permission matrix, GDPR tooling, and the full audit trail.
    </p>
   </div>
  </div>
 );
}

function Departments() {
 const [departments, setDepartments] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ name: '', description: '' });
 const [fieldErrors, setFieldErrors] = useState({});
 const [error, setError] = useState('');
 const [actingId, setActingId] = useState(null);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const { run: runCreate, isPending: creating } = useAsyncAction();
 const { run: runDelete, isPending: deleting } = useAsyncAction();

 const load = useCallback(() => {
  setLoading(true);
  fetchDepartments({ page, limit: 20 })
   .then((r) => { setDepartments(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => { load(); }, [load]);

 const handleCreate = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateCreateDepartment(form);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  try {
   await runCreate(async () => {
    await createDepartment(form);
    setForm({ name: '', description: '' });
    setShowForm(false);
    load();
   });
  } catch (err) {
   setError(err.message || 'Could not create the department.');
  }
 };

 const remove = async (id) => {
  setActingId(id);
  await runDelete(async () => { await deleteDepartment(id); load(); });
  setActingId(null);
 };

 if (loading) return <SkeletonTable rows={6} columns={3} />;
 return (
  <div className="space-y-stack-md">
   <div className="flex justify-end">
    <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowForm((v) => !v)}>New Department</Button>
   </div>
   {showForm && (
    <form onSubmit={handleCreate} className="space-y-4 rounded-lg border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg shadow-sm dark:border-dark-outline-variant">
     <div className="grid gap-4 sm:grid-cols-2">
      <div>
       <input required type="text" placeholder="Department name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
       {fieldErrors.name && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.name}</p>}
      </div>
      <input type="text" placeholder="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={FORM_INPUT_CLASS} />
     </div>
     {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
     </div>
    </form>
   )}
   <PortalTable
    columns={[
     { key: 'name', label: 'Name', className: 'text-body-md font-medium text-brand-dark dark:text-white' },
     { key: 'description', label: 'Description', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
     { key: 'actions', label: 'Actions', render: (_v, d) => <RowAction variant="danger" disabled={deleting && actingId === d.id} onClick={() => remove(d.id)}>Delete</RowAction> },
    ]}
    rows={departments}
    emptyMessage="No departments yet."
   />
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function RolesPermissions() {
 const [roles, setRoles] = useState([]);
 const [permissions, setPermissions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [roleForm, setRoleForm] = useState({ name: '', slug: '', description: '' });
 const [permForm, setPermForm] = useState({ name: '', module: '', action: '' });
 const [roleFieldErrors, setRoleFieldErrors] = useState({});
 const [roleError, setRoleError] = useState('');
 const [permFieldErrors, setPermFieldErrors] = useState({});
 const [permError, setPermError] = useState('');
 const [actingId, setActingId] = useState(null);
 const [rolesPage, setRolesPage] = useState(1);
 const [rolesTotalPages, setRolesTotalPages] = useState(1);
 const [permsPage, setPermsPage] = useState(1);
 const [permsTotalPages, setPermsTotalPages] = useState(1);
 const { run: runCreateRole, isPending: creatingRole } = useAsyncAction();
 const { run: runCreatePermission, isPending: creatingPermission } = useAsyncAction();
 const { run: runRemoveRole, isPending: removingRole } = useAsyncAction();
 const { run: runRemovePermission, isPending: removingPermission } = useAsyncAction();

 const load = useCallback(() => {
  setLoading(true);
  Promise.allSettled([
   fetchRoles({ page: rolesPage, limit: 20 }),
   fetchPermissions({ page: permsPage, limit: 20 }),
  ]).then(([r, p]) => {
   if (r.status === 'fulfilled') { setRoles(r.value?.data || []); setRolesTotalPages(r.value?.meta?.total_pages || 1); }
   if (p.status === 'fulfilled') { setPermissions(p.value?.data || []); setPermsTotalPages(p.value?.meta?.total_pages || 1); }
  }).finally(() => setLoading(false));
 }, [rolesPage, permsPage]);

 useEffect(() => { load(); }, [load]);

 const handleCreateRole = async (e) => {
  e.preventDefault();
  setRoleError('');
  const clientErrors = validateCreateRole(roleForm);
  if (Object.keys(clientErrors).length > 0) {
   setRoleFieldErrors(clientErrors);
   setRoleError('Please fix the errors below.');
   return;
  }
  setRoleFieldErrors({});
  try {
   await runCreateRole(async () => { await createRole(roleForm); setRoleForm({ name: '', slug: '', description: '' }); load(); });
  } catch (err) {
   setRoleError(err.message || 'Could not create the role.');
  }
 };

 const handleCreatePermission = async (e) => {
  e.preventDefault();
  setPermError('');
  const clientErrors = validateCreatePermission(permForm);
  if (Object.keys(clientErrors).length > 0) {
   setPermFieldErrors(clientErrors);
   setPermError('Please fix the errors below.');
   return;
  }
  setPermFieldErrors({});
  try {
   await runCreatePermission(async () => { await createPermission(permForm); setPermForm({ name: '', module: '', action: '' }); load(); });
  } catch (err) {
   setPermError(err.message || 'Could not create the permission.');
  }
 };

 const removeRole = async (id) => { setActingId(id); await runRemoveRole(async () => { await deleteRole(id); load(); }); setActingId(null); };
 const removePermission = async (id) => { setActingId(id); await runRemovePermission(async () => { await deletePermission(id); load(); }); setActingId(null); };

 if (loading) return <SkeletonTable rows={6} columns={3} />;
 return (
  <div className="space-y-stack-lg">
   <div className="space-y-4 rounded-lg border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg shadow-sm dark:border-dark-outline-variant">
    <h3 className="font-display text-headline-sm text-brand-dark dark:text-white">Custom Roles</h3>
    <form onSubmit={handleCreateRole} className="space-y-4">
     <div className="grid gap-4 sm:grid-cols-3">
      <div>
       <input required type="text" placeholder="Name" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
       {roleFieldErrors.name && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{roleFieldErrors.name}</p>}
      </div>
      <div>
       <input required type="text" placeholder="Slug (e.g. regional-lead)" value={roleForm.slug} onChange={(e) => setRoleForm({ ...roleForm, slug: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
       {roleFieldErrors.slug && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{roleFieldErrors.slug}</p>}
      </div>
      <input type="text" placeholder="Description" value={roleForm.description} onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })} className={FORM_INPUT_CLASS} />
     </div>
     {roleError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{roleError}</p>}
     <div className="flex justify-end">
      <Button type="submit" variant="primary" size="md" disabled={creatingRole}>{creatingRole ? 'Adding...' : 'Add Role'}</Button>
     </div>
    </form>
    <div className="divide-y divide-outline-variant/50 dark:divide-dark-outline-variant/50">
     {roles.map((r) => (
      <div key={r.id} className="flex items-center justify-between py-3">
       <div>
        <p className="text-body-md font-semibold text-brand-dark dark:text-white">{r.name} {r.is_system && <StatusBadge variant="neutral">system</StatusBadge>}</p>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{r.slug} — {r.description || 'No description'}</p>
       </div>
       {!r.is_system && <RowAction variant="danger" disabled={removingRole && actingId === r.id} onClick={() => removeRole(r.id)}>Delete</RowAction>}
      </div>
     ))}
     {!roles.length && <p className="py-6 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No custom roles yet — the 13 system roles from `UserRole` cover most needs.</p>}
    </div>
    <Pagination page={rolesPage} totalPages={rolesTotalPages} onChange={setRolesPage} />
   </div>

   <div className="space-y-4 rounded-lg border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg shadow-sm dark:border-dark-outline-variant">
    <h3 className="font-display text-headline-sm text-brand-dark dark:text-white">Permissions</h3>
    <form onSubmit={handleCreatePermission} className="space-y-4">
     <div className="grid gap-4 sm:grid-cols-3">
      <div>
       <input required type="text" placeholder="Name" value={permForm.name} onChange={(e) => setPermForm({ ...permForm, name: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
       {permFieldErrors.name && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{permFieldErrors.name}</p>}
      </div>
      <div>
       <input required type="text" placeholder="Module (e.g. invoices)" value={permForm.module} onChange={(e) => setPermForm({ ...permForm, module: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
       {permFieldErrors.module && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{permFieldErrors.module}</p>}
      </div>
      <div>
       <input required type="text" placeholder="Action (e.g. approve)" value={permForm.action} onChange={(e) => setPermForm({ ...permForm, action: e.target.value })} className={FORM_INPUT_CLASS + ' w-full'} />
       {permFieldErrors.action && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{permFieldErrors.action}</p>}
      </div>
     </div>
     {permError && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{permError}</p>}
     <div className="flex justify-end">
      <Button type="submit" variant="primary" size="md" disabled={creatingPermission}>{creatingPermission ? 'Adding...' : 'Add Permission'}</Button>
     </div>
    </form>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
     {permissions.map((p) => (
      <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-outline-variant bg-white p-3 transition-colors hover:bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <div>
        <p className="text-body-sm font-semibold text-brand-dark dark:text-white">{p.name}</p>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.module}.{p.action}</p>
       </div>
       <button type="button" onClick={() => removePermission(p.id)} disabled={removingPermission && actingId === p.id}
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-status-error/30 text-status-error transition-colors hover:bg-status-error-bg hover:text-status-error disabled:opacity-50"
        aria-label={`Delete permission ${p.name}`}>
        <Icon name="delete" className="text-base" />
       </button>
      </div>
     ))}
     {!permissions.length && <p className="py-6 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted sm:col-span-2 lg:col-span-3">No permissions defined yet.</p>}
    </div>
    <Pagination page={permsPage} totalPages={permsTotalPages} onChange={setPermsPage} />
   </div>
  </div>
 );
}

function DataExportGdpr() {
 const [search, setSearch] = useState('');
 const [appliedSearch, setAppliedSearch] = useState('');
 const [results, setResults] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searching, setSearching] = useState(false);
 const [actingId, setActingId] = useState(null);
 const [exportedJson, setExportedJson] = useState(null);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const { run: runExport, isPending: exporting } = useAsyncAction();
 const { run: runAnonymize, isPending: anonymizing } = useAsyncAction();

 useEffect(() => {
  setLoading(true);
  fetchUsers({ search: appliedSearch.trim() || undefined, page, limit: 20 })
   .then((r) => { setResults(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => { setLoading(false); setSearching(false); });
 }, [appliedSearch, page]);

 const runSearch = (e) => {
  e.preventDefault();
  setSearching(true);
  // A new search must not leave the view on a page number that no longer
  // exists in the new result set.
  setPage(1);
  setAppliedSearch(search);
 };

 const doExport = async (userId) => {
  setActingId(userId);
  await runExport(async () => {
   const r = await exportUserData(userId);
   setExportedJson(r?.data || null);
  });
  setActingId(null);
 };

 const doAnonymize = async (userId) => {
  if (!window.confirm('This permanently anonymizes the account (name, email, phone, avatar) and deactivates it. This cannot be undone. Continue?')) return;
  setActingId(userId);
  await runAnonymize(async () => { await anonymizeUser(userId); setResults((prev) => prev.filter((u) => u.id !== userId)); });
  setActingId(null);
 };

 if (loading) return <SkeletonTable rows={6} columns={4} />;

 return (
  <div className="space-y-stack-md">
   <form onSubmit={runSearch} className="flex gap-2">
    <input type="text" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} className={`flex-1 ${FORM_INPUT_CLASS}`} />
    <Button type="submit" variant="primary" size="md" disabled={searching}>{searching ? 'Searching...' : 'Search'}</Button>
   </form>
   <PortalTable
    columns={[
     { key: 'name', label: 'Name', className: 'text-body-md font-medium text-brand-dark dark:text-white' },
     { key: 'email', label: 'Email', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted' },
     { key: 'role', label: 'Role', className: 'text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted', render: (v) => v?.replace('_', ' ') },
     {
      key: 'actions',
      label: 'Actions',
      render: (_v, u) => (
       <div className="flex gap-2">
        <RowAction disabled={exporting && actingId === u.id} onClick={() => doExport(u.id)}>Export Data</RowAction>
        <RowAction variant="danger" disabled={anonymizing && actingId === u.id} onClick={() => doAnonymize(u.id)}>Anonymize</RowAction>
       </div>
      ),
     },
    ]}
    rows={results}
    emptyMessage="Search for a user to export or anonymize their data."
   />
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
   {exportedJson && (
    <div className="rounded-lg border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg shadow-sm dark:border-dark-outline-variant">
     <h3 className="mb-3 font-display text-headline-sm text-brand-dark dark:text-white">Exported Data</h3>
     <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-surface-container p-4 text-body-sm text-ink dark:bg-dark-surface-container dark:text-white">{JSON.stringify(exportedJson, null, 2)}</pre>
    </div>
   )}
  </div>
 );
}

function AuditLogs() {
 const [logs, setLogs] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 useEffect(() => {
  setLoading(true);
  fetchAuditLogs({ page, limit: 20 })
   .then((r) => { setLogs(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 if (loading) return <SkeletonTable rows={6} columns={4} />;
 return (
  <div className="space-y-stack-md">
   <PortalTable
    columns={[
     { key: 'action', label: 'Action', className: 'text-body-sm font-medium text-brand-dark dark:text-white' },
     { key: 'entity_type', label: 'Entity', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
     { key: 'ip_address', label: 'IP', className: 'font-mono text-body-xs text-ink-muted dark:text-dark-ink-muted', render: (v) => v || '—' },
     { key: 'created_at', label: 'When', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => (v ? new Date(v).toLocaleString() : '—') },
    ]}
    rows={logs}
    emptyMessage="No audit activity yet."
   />
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

// Backups are filesystem-based (backend/app/routers/backups.py just globs a
// directory) — there's no page_params support, so pagination here is
// client-side over the loaded array.
const BACKUPS_PAGE_SIZE = 10;

function Backups() {
 const [backups, setBackups] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState('');
 const [deletingFilename, setDeletingFilename] = useState(null);
 const [page, setPage] = useState(1);
 const { run: runTrigger, isPending: triggering } = useAsyncAction();
 const { run: runDelete, isPending: deleting } = useAsyncAction();

 const load = useCallback(() => {
  setLoading(true);
  fetchBackups().then((r) => setBackups(r?.data || [])).catch(() => {}).finally(() => setLoading(false));
 }, []);

 useEffect(() => { load(); }, [load]);

 const totalPages = Math.max(1, Math.ceil(backups.length / BACKUPS_PAGE_SIZE));
 const safePage = Math.min(page, totalPages);
 const pagedBackups = backups.slice((safePage - 1) * BACKUPS_PAGE_SIZE, safePage * BACKUPS_PAGE_SIZE);

 const runBackup = async () => {
  setError('');
  try {
   // A real pg_dump — the backend gives this up to 5 minutes.
   await runTrigger(async () => { await triggerBackup(); load(); });
  } catch (err) {
   setError(err?.message || 'Backup failed. Please try again.');
  }
 };

 const removeBackup = async (filename) => {
  if (!window.confirm(`Permanently delete backup "${filename}"? This cannot be undone.`)) return;
  setDeletingFilename(filename);
  await runDelete(async () => { await deleteBackup(filename); load(); });
  setDeletingFilename(null);
 };

 const formatSize = (bytes) => {
  if (!bytes) return '—';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
 };

 if (loading) return <SkeletonTable rows={6} columns={4} />;

 return (
  <div className="space-y-stack-lg">
   <div className="flex items-center justify-between">
    <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Real database backups (pg_dump), triggered manually — no scheduler runs automatically yet.</p>
    <Button variant="primary" size="md" onClick={runBackup} disabled={triggering} icon={<Icon name="backup" />}>
     {triggering ? 'Running backup...' : 'Trigger Backup Now'}
    </Button>
   </div>
   {error && <p className="flex items-center gap-1 text-body-sm text-status-error"><Icon name="error" className="text-base" />{error}</p>}
   <PortalTable
    columns={[
     { key: 'filename', label: 'Filename', className: 'font-mono text-body-xs text-brand-dark dark:text-white' },
     { key: 'size_bytes', label: 'Size', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => formatSize(v) },
     { key: 'created_at', label: 'Created', className: 'text-body-sm text-ink-muted dark:text-dark-ink-muted', render: (v) => (v ? new Date(v).toLocaleString() : '—') },
     {
      key: 'actions',
      label: '',
      render: (_v, b) => (
       <div className="flex gap-3">
        <a href={backupDownloadUrl(b.filename)} aria-label={`Download backup ${b.filename}`} className="text-brand hover:text-brand-dark" title="Download">
         <Icon name="download" className="text-xl" />
        </a>
        <button onClick={() => removeBackup(b.filename)} disabled={deleting && deletingFilename === b.filename} aria-label={`Delete backup ${b.filename}`} className="text-status-error hover:opacity-70 disabled:opacity-50" title="Delete">
         <Icon name="delete" className="text-xl" />
        </button>
       </div>
      ),
     },
    ]}
    rows={pagedBackups}
    emptyMessage="No backups yet — trigger one above."
   />
   <Pagination page={safePage} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

export default function SuperAdminPanel() {
 useDocumentTitle('Super Admin | CoralSwift Technologies');
 const { user, initializing, logout } = useAuth();
 const { denied } = useRoleGuard('super_admin', '/admin');
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('overview');
 const [currentUser, setCurrentUser] = useState(null);

 useEffect(() => {
  if (user) {
   setCurrentUser({ name: user?.name || user?.email, email: user?.email, role: user?.role || 'super_admin' });
  }
 }, [user]);

 // useRoleGuard already redirects both the unauthenticated case (to
 // /login?returnTo=..., preserving destination) and the wrong-role case
 // (to /admin, per the redirectTo passed above) — no separate effect needed.
 if (initializing || !user || denied || currentUser === null || currentUser.role !== 'super_admin') {
  return <div className="bg-surface-container py-section-padding dark:bg-dark-surface-container"><LoadingSpinner /></div>;
 }

  return (
   <div className="flex h-dvh flex-col bg-dark-surface">
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-brand-dark/30 bg-brand-dark px-4 py-3 sm:gap-4 sm:px-6 lg:px-10 xl:px-12 ">
     <div className="flex min-w-0 items-center gap-2 sm:gap-4">
      <Avatar name={currentUser?.name || 'Super Admin'} size="lg" />
      <div className="min-w-0">
       <h1 className="max-w-[40vw] truncate font-display text-headline-md font-bold text-white sm:max-w-none">{currentUser?.name || 'Super Admin'}</h1>
       <p className="hidden text-body-sm text-white/70 sm:block">{currentUser?.email || ''} &middot; super admin</p>
      </div>
     </div>
     <Button variant="primary" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
      Sign Out
     </Button>
    </div>

   <div className="flex min-h-0 flex-1">
    <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-brand-dark/30 bg-brand-dark md:block">
     <nav aria-label="Portal navigation" className="flex flex-col gap-1 p-3">
      {superAdminTabs.map((tab) => (
       <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left text-body-sm font-medium transition-colors ${
         activeTab === tab.id ? 'bg-white/20 font-semibold text-white' : 'font-medium text-white/70 hover:bg-white/10 hover:text-white'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </nav>
    </aside>

    <div className="flex min-h-0 flex-1 flex-col">
     <div className="scrollbar-hide mb-stack-lg flex gap-1 overflow-x-auto border-b px-4 py-2 sm:px-6 md:hidden lg:px-10 xl:px-12">
      {superAdminTabs.map((tab) => (
       <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-body-sm font-medium transition-colors ${
         activeTab === tab.id ? 'border-white font-semibold text-white' : 'border-transparent text-white/70 hover:border-white/40 hover:text-white'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </div>

     <div className="min-w-0 flex-1 overflow-y-auto px-4 py-stack-lg sm:px-6 lg:px-10 xl:px-12 ">
      {activeTab === 'overview' && <Overview />}
      {activeTab === 'departments' && <Departments />}
      {activeTab === 'roles' && <RolesPermissions />}
      {activeTab === 'gdpr' && <DataExportGdpr />}
      {activeTab === 'audit' && <AuditLogs />}
      {activeTab === 'backups' && <Backups />}
      {activeTab === 'billing' && (
       <ComingSoon icon="account_balance" title="Billing & Subscription"
        description="This deployment doesn't have a billing/subscription model yet — there's no plan, invoice-to-platform, or metering system in the current schema. Building it for real is a separate project, not a UI-only add-on." />
      )}
      {activeTab === 'impersonation' && (
       <ComingSoon icon="switch_account" title="Impersonation"
        description="Deliberately not implemented yet. Signing in as another user safely requires audit-logged, time-boxed session tokens and its own review — that's a security-sensitive feature that shouldn't ship as a quick add-on." />
      )}
     </div>
    </div>
   </div>
  </div>
 );
}
