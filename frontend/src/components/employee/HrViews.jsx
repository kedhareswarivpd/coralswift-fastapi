import { useState, useEffect, useCallback } from 'react';
import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import RowAction from '../ui/RowAction.jsx';
import { SkeletonTable } from '../ui/Skeleton.jsx';
import Pagination from '../ui/Pagination.jsx';
import useAsyncAction from '../../hooks/useAsyncAction.js';
import { apiRequest } from '../../api/client.js';
import {
 fetchLeaves, reviewLeave,
 fetchApplications, updateApplicationStatus,
} from '../../api/admin.js';

const PAGE_LIMIT = 20;

const APPLICATION_STATUS_OPTIONS = ['applied', 'shortlisted', 'interview', 'offered', 'rejected', 'hired'];
const APPLICATION_STATUS_COLOR = { applied: 'neutral', shortlisted: 'info', interview: 'warning', offered: 'success', rejected: 'error', hired: 'success' };

// ---------- HR ----------
function LeaveApprovals() {
 const [leaves, setLeaves] = useState([]);
 const [loading, setLoading] = useState(true);
 const [actingId, setActingId] = useState(null);
 const [filter, setFilter] = useState('pending');
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [toast, setToast] = useState('');
 const { run, isPending } = useAsyncAction();

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const load = useCallback(() => {
  setLoading(true);
  const params = { page, limit: PAGE_LIMIT };
  if (filter !== 'all') params.status = filter;
  fetchLeaves(params)
   .then((r) => { setLeaves(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [filter, page]);

 useEffect(() => { load(); }, [load]);

 // Changing the status filter must not leave the list on a page number
 // that no longer exists in the filtered result set.
 useEffect(() => { setPage(1); }, [filter]);

 // auto-refresh every 30s so new employee submissions appear
 useEffect(() => {
  const id = setInterval(load, 30000);
  return () => clearInterval(id);
 }, [load]);

 const review = (id, status) => run(async () => {
  setActingId(id);
  try {
   await reviewLeave(id, status);
   showToast(`Leave ${status} successfully.`);
   load();
  } catch (err) {
   showToast(err?.message || 'Action failed.');
  } finally {
   setActingId(null);
  }
 });

 const LEAVE_STATUS_COLOR = { pending: 'warning', approved: 'success', rejected: 'error', cancelled: 'neutral' };

 if (loading) return <SkeletonTable rows={6} columns={8} />;
 return (
  <div className="space-y-stack-md">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
     <span className="font-label-caps text-label-caps uppercase text-brand-dark dark:text-white">Filter:</span>
     {['pending', 'approved', 'rejected', 'all'].map((s) => (
      <button key={s} onClick={() => setFilter(s)}
       className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
        filter === s ? 'border-brand bg-brand text-white' : 'border-outline-variant text-ink-muted hover:border-brand hover:text-brand dark:border-dark-outline-variant dark:text-dark-ink-muted'
       }`}>{s}
      </button>
     ))}
    </div>
    <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-brand-dark dark:text-white">
     <Icon name="refresh" className="text-base" /> Refresh
    </button>
   </div>
   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('success') || toast.includes('approved') || toast.includes('rejected')
      ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text'
      : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast}</p>
   )}
   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr>
       <th className="px-stack-lg py-4">Employee</th>
       <th className="px-stack-lg py-4">Type</th>
       <th className="px-stack-lg py-4">From</th>
       <th className="px-stack-lg py-4">To</th>
       <th className="px-stack-lg py-4">Days</th>
       <th className="px-stack-lg py-4">Reason</th>
       <th className="px-stack-lg py-4">Status</th>
       <th className="px-stack-lg py-4">Actions</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {leaves.map((l) => {
       const days = l.start_date && l.end_date
        ? Math.ceil((new Date(l.end_date) - new Date(l.start_date)) / 86400000) + 1
        : '—';
       return (
        <tr key={l.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
         <td data-label="Employee" className="px-stack-lg py-4">
          <p className="text-body-md font-semibold text-brand-dark dark:text-white">{l.employee_code || '—'}</p>
          {l.designation && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.designation}</p>}
         </td>
         <td data-label="Type" className="px-stack-lg py-4 text-body-md capitalize text-brand-dark dark:text-white">{l.type}</td>
         <td data-label="From" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.start_date}</td>
         <td data-label="To" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.end_date}</td>
         <td data-label="Days" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{days}</td>
         <td data-label="Reason" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.reason || '—'}</td>
         <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={LEAVE_STATUS_COLOR[l.status]}>{l.status}</StatusBadge></td>
         <td data-label="Actions" className="px-stack-lg py-4">
          {l.status === 'pending' && (
           <div className="flex gap-2">
            <RowAction disabled={isPending && actingId === l.id} onClick={() => review(l.id, 'approved')}>Approve</RowAction>
            <RowAction variant="outline" disabled={isPending && actingId === l.id} onClick={() => review(l.id, 'rejected')}>Reject</RowAction>
           </div>
          )}
         </td>
        </tr>
       );
      })}
      {!leaves.length && <tr><td data-label="Employee" colSpan={8} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No leave requests found.</td></tr>}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Recruitment() {
 const [positions, setPositions] = useState([]);
 const [positionsPage, setPositionsPage] = useState(1);
 const [positionsTotalPages, setPositionsTotalPages] = useState(1);
 const [positionsTotal, setPositionsTotal] = useState(0);
 const [applications, setApplications] = useState([]);
 const [appsPage, setAppsPage] = useState(1);
 const [appsTotalPages, setAppsTotalPages] = useState(1);
 const [appsTotal, setAppsTotal] = useState(0);
 const [loading, setLoading] = useState(true);
 const [savingId, setSavingId] = useState(null);
 const [statusFilter, setStatusFilter] = useState('all');
 const [toast, setToast] = useState('');
 const { run, isPending } = useAsyncAction();

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const load = useCallback(() => {
  setLoading(true);
  Promise.allSettled([
   apiRequest(`/careers?page=${positionsPage}&limit=20`),
   fetchApplications({ page: appsPage, limit: 20, ...(statusFilter !== 'all' ? { status: statusFilter } : {}) }),
  ]).then(([positionsRes, appsRes]) => {
   if (positionsRes.status === 'fulfilled') {
    setPositions(positionsRes.value?.data || []);
    setPositionsTotalPages(positionsRes.value?.meta?.total_pages || 1);
    setPositionsTotal(positionsRes.value?.meta?.total || 0);
   }
   if (appsRes.status === 'fulfilled') {
    setApplications(appsRes.value?.data || []);
    setAppsTotalPages(appsRes.value?.meta?.total_pages || 1);
    setAppsTotal(appsRes.value?.meta?.total || 0);
   }
  }).finally(() => setLoading(false));
 }, [positionsPage, appsPage, statusFilter]);

 useEffect(() => { load(); }, [load]);

 // Changing the application status filter must not leave that list on a
 // page number that no longer exists in the filtered result set.
 useEffect(() => { setAppsPage(1); }, [statusFilter]);

 useEffect(() => {
  const id = setInterval(load, 30000);
  return () => clearInterval(id);
 }, [load]);

 const changeStatus = (id, status) => run(async () => {
  setSavingId(id);
  try {
   await updateApplicationStatus(id, status);
   showToast('Application status updated.');
   load();
  } catch (err) {
   showToast(err?.message || 'Update failed.');
  } finally {
   setSavingId(null);
  }
 });

 const positionTitle = (careerId) => positions.find((p) => p.id === careerId)?.title || 'Position';

 // /careers already filters to status=open server-side (career.py), so
 // `positions` only ever holds open postings for the current page.
 const openPositions = positions;
 // In Pipeline / Hired reflect only the currently loaded page of
 // applications once the list is paginated server-side — Open
 // Positions / Applications use the backend's total counts instead, which
 // stay accurate across all pages.
 const inPipeline = applications.filter((a) => ['applied', 'shortlisted', 'interview', 'offered'].includes(a.status)).length;
 const hiredCount = applications.filter((a) => a.status === 'hired').length;

 const kpis = [
  { label: 'Open Positions', value: positionsTotal, icon: 'work' },
  { label: 'Applications', value: appsTotal, icon: 'person_add' },
  { label: 'In Pipeline', value: inPipeline, icon: 'swap_horiz' },
  { label: 'Hired', value: hiredCount, icon: 'verified' },
 ];

 if (loading) return <SkeletonTable rows={6} columns={5} />;
 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-gutter lg:grid-cols-4">
    {kpis.map((stat) => (
     <div key={stat.label} className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-2 flex items-center gap-3">
       <Icon name={stat.icon} className="text-2xl text-brand" />
       <span className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{stat.label}</span>
      </div>
      <p className="font-stat text-stat-lg text-brand-dark dark:text-white">{stat.value}</p>
     </div>
    ))}
   </div>

   <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-white">Open Positions</h3>
     <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-brand-dark dark:text-white">
      <Icon name="refresh" className="text-base" /> Refresh
     </button>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
     {openPositions.map((p) => (
      <div key={p.id} className="rounded-lg border border-outline-variant p-4 dark:border-dark-outline-variant">
       <p className="mb-1 font-display text-body-lg font-semibold text-brand-dark dark:text-white">{p.title}</p>
       <p className="text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted">
        {p.department || 'General'} · {p.location || 'Remote'} · {String(p.employment_type || 'full_time').replace('_', ' ')}
       </p>
       <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.experience_required ? `Experience: ${p.experience_required}` : ''}</p>
      </div>
     ))}
     {!openPositions.length && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">No open positions right now.</p>}
    </div>
    <Pagination page={positionsPage} totalPages={positionsTotalPages} onChange={setPositionsPage} className="mt-4" />
   </div>

   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('success') || toast.includes('updated')
      ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text'
      : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast}</p>
   )}

   <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
     <span className="font-label-caps text-label-caps uppercase text-brand-dark dark:text-white">Filter:</span>
     {['all', ...APPLICATION_STATUS_OPTIONS].map((s) => (
      <button key={s} onClick={() => setStatusFilter(s)}
       className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
        statusFilter === s ? 'border-brand bg-brand text-white' : 'border-outline-variant text-ink-muted hover:border-brand hover:text-brand dark:border-dark-outline-variant dark:text-dark-ink-muted'
       }`}>{s}
      </button>
     ))}
    </div>
   </div>

   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr>
       <th className="px-stack-lg py-4">Applicant</th>
       <th className="px-stack-lg py-4">Position</th>
       <th className="px-stack-lg py-4">Email</th>
       <th className="px-stack-lg py-4">Applied</th>
       <th className="px-stack-lg py-4">Status</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {applications.map((a) => (
       <tr key={a.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Applicant" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-white">{a.full_name}</td>
        <td data-label="Position" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{positionTitle(a.career_id)}</td>
        <td data-label="Email" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{a.email}</td>
        <td data-label="Applied" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{(a.created_at || '').slice(0, 10) || '—'}</td>
        <td data-label="Status" className="px-stack-lg py-4">
         <div className="flex items-center gap-2">
          <StatusBadge variant={APPLICATION_STATUS_COLOR[a.status]}>{a.status}</StatusBadge>
          <select value={a.status} disabled={isPending && savingId === a.id} onChange={(e) => changeStatus(a.id, e.target.value)}
           className="rounded border border-outline-variant bg-white dark:bg-dark-surface px-2 py-1 text-body-sm text-brand-dark dark:border-dark-outline-variant dark:text-white">
           {APPLICATION_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
         </div>
        </td>
       </tr>
      ))}
      {!applications.length && <tr><td data-label="Applicant" colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No applications found.</td></tr>}
     </tbody>
    </table>
   </div>
   <Pagination page={appsPage} totalPages={appsTotalPages} onChange={setAppsPage} />
  </div>
 );
}


export { LeaveApprovals, Recruitment };
