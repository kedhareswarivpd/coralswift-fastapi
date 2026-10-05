import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { SkeletonTable, SkeletonCard } from '../components/ui/Skeleton.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRoleGuard } from '../hooks/useRoleGuard.js';
import useAsyncAction from '../hooks/useAsyncAction.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
 employeeTabsForRole,
} from '../data/portal.js';
import {
 fetchMyProfile, applyLeave as applyLeaveApi, submitTimesheet, fetchMyDocuments,
 checkIn as checkInApi, checkOut as checkOutApi,
 fetchMyPayslips, fetchMyPerformanceReviews, fetchMyTrainingEnrollments,
 fetchTrainingCatalog, enrollInCourse,
} from '../api/employees.js';
import { apiRequest } from '../api/client.js';
import { fetchProposals, fetchContracts, fetchLeads, fetchMeetings } from '../api/crm.js';
import { fetchClients } from '../api/admin.js';
import { lazyWithReload as lazy } from '../utils/lazyWithReload.js';
import { validateNewLeaveRequest, validateNewTimesheet } from '../schemas/employee-self-service.schema.js';

// Sonar M5: EmployeePortal.jsx bundled every role's sub-views (sales CRM,
// marketing, PM, dev/QA/support/finance, HR) into one 550kB+ chunk that every
// employee downloaded regardless of role. These role-specific view clusters
// are extracted into components/employee/*.jsx, each named export lazily
// wrapped below. Every wrapper for the same source file shares one chunk
// (Vite dedupes identical dynamic import specifiers), so a role's whole
// cluster loads together the first time any one of its tabs is opened —
// but never for a different role.
const namedLazy = (importer, name) => lazy(() => importer().then((m) => ({ default: m[name] })));

const salesCrmImporter = () => import('../components/employee/SalesCrmViews.jsx');
const CrmDashboard = namedLazy(salesCrmImporter, 'CrmDashboard');
const ContactSubmissionsView = namedLazy(salesCrmImporter, 'ContactSubmissionsView');
const Leads = namedLazy(salesCrmImporter, 'Leads');
const SalesClients = namedLazy(salesCrmImporter, 'SalesClients');
const Proposals = namedLazy(salesCrmImporter, 'Proposals');
const Contracts = namedLazy(salesCrmImporter, 'Contracts');
const SalesMeetings = namedLazy(salesCrmImporter, 'SalesMeetings');
const SalesReports = namedLazy(salesCrmImporter, 'SalesReports');

const marketingImporter = () => import('../components/employee/MarketingViews.jsx');
const MarketingLeadsView = namedLazy(marketingImporter, 'MarketingLeadsView');
const TestimonialModeration = namedLazy(marketingImporter, 'TestimonialModeration');

const pmImporter = () => import('../components/employee/ProjectManagerViews.jsx');
const TeamProjects = namedLazy(pmImporter, 'TeamProjects');
const TaskBoard = namedLazy(pmImporter, 'TaskBoard');
const Approvals = namedLazy(pmImporter, 'Approvals');

const opsImporter = () => import('../components/employee/OpsRoleViews.jsx');
const MyTasksBoard = namedLazy(opsImporter, 'MyTasksBoard');
const TestQueue = namedLazy(opsImporter, 'TestQueue');
const TicketQueue = namedLazy(opsImporter, 'TicketQueue');
const Invoices = namedLazy(opsImporter, 'Invoices');

const hrImporter = () => import('../components/employee/HrViews.jsx');
const LeaveApprovals = namedLazy(hrImporter, 'LeaveApprovals');
const Recruitment = namedLazy(hrImporter, 'Recruitment');

// Self-service lists (leaves/timesheets/payslips/performance/training/documents)
// are fetched once as a capped array (SELF_SERVICE_LIST_CAP server-side, not
// page_params) — so these tabs paginate the already-loaded array client-side
// rather than re-fetching per page.
const CLIENT_PAGE_SIZE = 10;

function TabFallback() {
 return (
  <div className="space-y-stack-md">
   <SkeletonCard />
   <SkeletonTable rows={6} columns={5} />
  </div>
 );
}

function Overview({ profile, attendance, leaves, timesheets, payslips }) {
 const totalHours = timesheets.reduce((s, t) => s + t.hours, 0);
 const pendingLeaves = leaves.filter((l) => l.status === 'pending').length;
 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
    {[
     { label: 'Today', value: attendance.status, icon: 'clock_loader_60', sub: `${attendance.checkIn || '--'} - ${attendance.checkOut || '--'}` },
     { label: 'Hours This Week', value: `${totalHours}h`, icon: 'schedule' },
     { label: 'Pending Leaves', value: pendingLeaves, icon: 'beach_access' },
     { label: 'Latest Payslip', value: `$${payslips[0]?.netPay?.toLocaleString() || 0}`, icon: 'payments' },
    ].map((stat) => (
     <div key={stat.label} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-outline-variant">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale dark:bg-blue-900/30">
       <Icon name={stat.icon} className="text-2xl text-brand" />
      </div>
      <p className="font-stat text-3xl font-bold capitalize text-brand-dark dark:text-white">{stat.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{stat.label}</p>
      {stat.sub && <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">{stat.sub}</p>}
     </div>
    ))}
   </div>
   <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
    <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-white">My Profile</h3>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
     {[
      { label: 'Name', value: profile.name },
      { label: 'Employee Code', value: profile.employee_code },
      { label: 'Designation', value: profile.designation },
      { label: 'Department', value: profile.department },
      { label: 'Email', value: profile.email },
      { label: 'Status', value: profile.status },
     ].map((f) => (
      <div key={f.label}>
       <span className="font-label-caps text-label-caps text-ink-muted dark:text-dark-ink-muted">{f.label}</span>
       <p className="text-body-md capitalize text-brand-dark dark:text-white">{f.value || '—'}</p>
      </div>
     ))}
    </div>
   </div>
  </div>
 );
}

function Attendance({ attendance, onChange }) {
 const today = new Date().toISOString().slice(0, 10);
 const isToday = attendance.date === today;
 const [checkedIn, setCheckedIn] = useState(isToday && Boolean(attendance.checkIn));
 const [checkedOut, setCheckedOut] = useState(isToday && Boolean(attendance.checkOut));
 const [toast, setToast] = useState('');
 const { run, isPending: loading } = useAsyncAction();

 useEffect(() => {
  const t = new Date().toISOString().slice(0, 10);
  const dayMatch = attendance.date === t;
  setCheckedIn(dayMatch && Boolean(attendance.checkIn));
  setCheckedOut(dayMatch && Boolean(attendance.checkOut));
 }, [attendance.date, attendance.checkIn, attendance.checkOut]);

 const showToast = (msg) => {
  setToast(msg);
  setTimeout(() => setToast(''), 3000);
 };

 const currentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

 const handleCheckIn = () => run(async () => {
  try {
   const res = await checkInApi();
   const updated = res?.data;
   const time = toLocalTime(updated?.check_in) || currentTime();
   onChange?.({ ...attendance, checkIn: time, status: 'present' });
   setCheckedIn(true);
   showToast(`Checked in at ${time}`);
  } catch (err) {
   // Do not fabricate a check-in time on failure — the real attendance
   // record was never created, so the UI must not claim it was.
   showToast(err?.message || 'Check-in failed. Please try again.');
  }
 });

 const handleCheckOut = () => run(async () => {
  try {
   const res = await checkOutApi();
   const updated = res?.data;
   const time = toLocalTime(updated?.check_out) || currentTime();
   onChange?.({ ...attendance, checkOut: time });
   setCheckedOut(true);
   showToast(`Checked out at ${time}`);
  } catch (err) {
   // Same as check-in: a failed request must not be reported as success.
   showToast(err?.message || 'Check-out failed. Please try again.');
  }
 });

 return (
  <div className="space-y-stack-lg">
   <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
    <h3 className="mb-6 font-display text-headline-sm text-brand-dark dark:text-white">Today&apos;s Attendance</h3>
    <div className="mb-6 grid gap-gutter sm:grid-cols-3">
     <div className="rounded-xl bg-accent-cyan-pale p-stack-lg text-center dark:bg-blue-900/30">
      <Icon name="login" className="mb-2 text-3xl text-brand" />
      <p className="font-label-caps text-label-caps text-brand">Check-In</p>
      <p className="font-display text-headline-sm text-brand">{attendance.checkIn || '--'}</p>
     </div>
     <div className="rounded-xl bg-accent-cyan-pale p-stack-lg text-center dark:bg-blue-900/30">
      <Icon name="logout" className="mb-2 text-3xl text-brand" />
      <p className="font-label-caps text-label-caps text-brand">Check-Out</p>
      <p className="font-display text-headline-sm text-brand">{attendance.checkOut || '--'}</p>
     </div>
     <div className="rounded-xl bg-accent-cyan-pale p-stack-lg text-center dark:bg-blue-900/30">
      <Icon name="badge" className="mb-2 text-3xl text-brand" />
      <p className="font-label-caps text-label-caps text-brand">Status</p>
      <StatusBadge variant={attendance.status === 'present' ? 'success' : 'warning'} className="mt-1">
       {attendance.status || 'Not checked in'}
      </StatusBadge>
     </div>
    </div>
    <div className="flex justify-center gap-3">
     <Button onClick={handleCheckIn} variant={checkedIn ? 'outline' : 'primary'} size="md" disabled={checkedIn || loading} icon={<Icon name="login" />}>
      {loading && !checkedIn ? 'Checking in...' : checkedIn ? 'Checked In ✓' : 'Check In'}
     </Button>
     <Button onClick={handleCheckOut} variant={checkedOut ? 'outline' : 'primary'} size="md" disabled={checkedOut || !checkedIn || loading} icon={<Icon name="logout" />}>
      {loading && checkedIn && !checkedOut ? 'Checking out...' : checkedOut ? 'Checked Out ✓' : 'Check Out'}
     </Button>
    </div>
    {toast && (
     <p className="mt-4 rounded-lg border border-green-200 bg-status-success-bg px-4 py-2 text-center text-body-sm text-status-success-text">
      ✓ {toast}
     </p>
    )}
   </div>
  </div>
 );
}

function Leaves({ leaves: initialLeaves }) {
 const [showForm, setShowForm] = useState(false);
 const LEAVE_TYPES = [
  { label: 'Earned (Annual)', value: 'earned' },
  { label: 'Sick', value: 'sick' },
  { label: 'Casual (Personal)', value: 'casual' },
  { label: 'Unpaid', value: 'unpaid' },
  { label: 'Maternity', value: 'maternity' },
  { label: 'Paternity', value: 'paternity' },
 ];
 const [form, setForm] = useState({ type: 'earned', from: '', to: '', reason: '' });
 const [errors, setErrors] = useState({});
 const [allLeaves, setAllLeaves] = useState(initialLeaves);
 const [toast, setToast] = useState('');
 const [page, setPage] = useState(1);
 const { run: runSubmit, isPending: submitting } = useAsyncAction();

 const totalPages = Math.max(1, Math.ceil(allLeaves.length / CLIENT_PAGE_SIZE));
 const pagedLeaves = allLeaves.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const handleChange = (field, value) => {
  setForm((prev) => ({ ...prev, [field]: value }));
  if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  const clientErrors = validateNewLeaveRequest(form);
  setErrors(clientErrors);
  if (Object.keys(clientErrors).length > 0) return;
  runSubmit(async () => {
   try {
    const res = await applyLeaveApi({
     type: form.type,
     start_date: form.from,
     end_date: form.to,
     reason: form.reason,
    });
    const d = res?.data;
    const days = Math.ceil((new Date(d.end_date) - new Date(d.start_date)) / 86400000) + 1;
    const newLeave = { id: d.id, type: d.type, from: d.start_date, to: d.end_date, status: d.status, days };
    setAllLeaves((prev) => [newLeave, ...prev]);
    setForm({ type: 'earned', from: '', to: '', reason: '' });
    setErrors({});
    setShowForm(false);
    setPage(1);
    showToast('Leave request submitted successfully.');
   } catch (err) {
    showToast(err?.message || 'Failed to submit leave request.');
   }
  });
 };

 return (
  <div className="space-y-stack-md">
   <div className="flex justify-end">
    <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>Apply Leave</Button>
   </div>
   {showForm && (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
     <div className="grid gap-4 sm:grid-cols-3">
      <div>
       <select value={form.type} onChange={(e) => handleChange('type', e.target.value)}
        className={`w-full rounded border bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:outline-none dark:text-white dark:placeholder-white/40 ${errors.type ? 'border-status-error focus:border-status-error' : 'border-outline-variant focus:border-brand dark:border-dark-outline-variant'}`}>
        {LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
       </select>
       {errors.type && <p className="mt-1 text-body-xs text-status-error">{errors.type}</p>}
      </div>
      <div>
       <input type="date" value={form.from} onChange={(e) => handleChange('from', e.target.value)}
        className={`w-full rounded border bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:outline-none dark:text-white dark:placeholder-white/40 ${errors.from ? 'border-status-error focus:border-status-error' : 'border-outline-variant focus:border-brand dark:border-dark-outline-variant'}`} />
       {errors.from && <p className="mt-1 text-body-xs text-status-error">{errors.from}</p>}
      </div>
      <div>
       <input type="date" value={form.to} onChange={(e) => handleChange('to', e.target.value)}
        className={`w-full rounded border bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:outline-none dark:text-white dark:placeholder-white/40 ${errors.to ? 'border-status-error focus:border-status-error' : 'border-outline-variant focus:border-brand dark:border-dark-outline-variant'}`} />
       {errors.to && <p className="mt-1 text-body-xs text-status-error">{errors.to}</p>}
      </div>
     </div>
     <div>
      <textarea placeholder="Reason for leave (min 10 characters)" value={form.reason} onChange={(e) => handleChange('reason', e.target.value)}
       rows={2} className={`w-full rounded border bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:outline-none dark:text-white dark:placeholder-white/40 ${errors.reason ? 'border-status-error focus:border-status-error' : 'border-outline-variant focus:border-brand dark:border-dark-outline-variant'}`} />
      {errors.reason && <p className="mt-1 text-body-xs text-status-error">{errors.reason}</p>}
     </div>
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
     </div>
    </form>
   )}
   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('success') ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text' : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast}</p>
   )}
   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr><th className="px-stack-lg py-4">Type</th><th className="px-stack-lg py-4">From</th><th className="px-stack-lg py-4">To</th><th className="px-stack-lg py-4">Days</th><th className="px-stack-lg py-4">Status</th></tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {pagedLeaves.length === 0 ? (
       <tr><td data-label="Type" colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No leave requests yet.</td></tr>
      ) : pagedLeaves.map((l) => (
       <tr key={l.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Type" className="px-stack-lg py-4 text-body-md capitalize text-brand-dark dark:text-white">{l.type}</td>
        <td data-label="From" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{l.from}</td>
        <td data-label="To" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{l.to}</td>
        <td data-label="Days" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{l.days}</td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={l.status === 'approved' ? 'success' : l.status === 'pending' ? 'warning' : 'error'}>{l.status}</StatusBadge></td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Timesheets({ timesheets: initialTimesheets }) {
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ date: '', project: '', hours: '', description: '' });
 const [errors, setErrors] = useState({});
 const [allEntries, setAllEntries] = useState(initialTimesheets);
 const [toast, setToast] = useState('');
 const [page, setPage] = useState(1);
 const { run: runSubmit, isPending: submitting } = useAsyncAction();
 const totalHours = allEntries.reduce((s, e) => s + (Number(e.hours) || 0), 0);

 const totalPages = Math.max(1, Math.ceil(allEntries.length / CLIENT_PAGE_SIZE));
 const pagedEntries = allEntries.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const handleChange = (field, value) => {
  setForm((prev) => ({ ...prev, [field]: value }));
  if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
 };

 const refresh = async () => {
  try {
   const res = await apiRequest('/employees/me/timesheets');
   setAllEntries(normalizeTimesheets(res?.data));
   setPage(1);
   showToast('Timesheets refreshed.');
  } catch (err) {
   showToast(err?.message || 'Refresh failed.');
  }
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  const clientErrors = validateNewTimesheet(form);
  setErrors(clientErrors);
  if (Object.keys(clientErrors).length > 0) return;
  runSubmit(async () => {
   try {
    const payload = {
     date: form.date,
     hours: parseFloat(form.hours),
     description: form.description || null,
    };
    const res = await submitTimesheet(payload);
    const d = res?.data;
    const entry = { id: d.id, date: d.date, project: form.project || 'General', hours: Number(d.hours), description: d.description };
    setAllEntries((prev) => [entry, ...prev]);
    setForm({ date: '', project: '', hours: '', description: '' });
    setErrors({});
    setShowForm(false);
    setPage(1);
    showToast('Hours logged successfully.');
   } catch (err) {
    showToast(err?.message || 'Failed to log hours.');
   }
  });
 };

 return (
  <div className="space-y-stack-md">
   <div className="flex items-center justify-between">
    <p className="text-body-md text-ink-muted dark:text-dark-ink-muted">Total hours logged: <span className="font-semibold text-brand-dark dark:text-white">{totalHours}h</span></p>
    <div className="flex items-center gap-3">
     <button onClick={refresh} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-brand-light">
      <Icon name="refresh" className="text-base" /> Refresh
     </button>
     <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>Log Hours</Button>
    </div>
   </div>
   {showForm && (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm backdrop-blur dark:border-dark-outline-variant">
     <div className="grid gap-4 sm:grid-cols-3">
      <div>
       <input type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)}
        className={`w-full rounded border bg-brand px-4 py-3 text-body-md text-white placeholder-white/60 focus:outline-none ${errors.date ? 'border-status-error focus:border-status-error' : 'border-blue-700 focus:border-brand'}`} />
       {errors.date && <p className="mt-1 text-body-xs text-status-error">{errors.date}</p>}
      </div>
      <input type="text" placeholder="Project name (optional)" value={form.project} onChange={(e) => handleChange('project', e.target.value)}
       className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
      <div>
       <input type="number" step="0.25" min="0.25" max="24" placeholder="Hours *" value={form.hours} onChange={(e) => handleChange('hours', e.target.value)}
        className={`w-full rounded border bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:outline-none dark:text-white dark:placeholder-white/40 ${errors.hours ? 'border-status-error focus:border-status-error' : 'border-outline-variant focus:border-brand dark:border-dark-outline-variant'}`} />
       {errors.hours && <p className="mt-1 text-body-xs text-status-error">{errors.hours}</p>}
      </div>
     </div>
     <textarea placeholder="Description" value={form.description} onChange={(e) => handleChange('description', e.target.value)}
      rows={2} className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Logging...' : 'Log'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
     </div>
    </form>
   )}
   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('success') || toast.includes('refreshed') ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text' : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast}</p>
   )}
   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr><th className="px-stack-lg py-4">Date</th><th className="px-stack-lg py-4">Project</th><th className="px-stack-lg py-4">Hours</th><th className="px-stack-lg py-4">Description</th></tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {pagedEntries.map((e) => (
       <tr key={e.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Date" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{e.date}</td>
        <td data-label="Project" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-white">{e.project}</td>
        <td data-label="Hours" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-white">{e.hours}h</td>
        <td data-label="Description" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{e.description || '—'}</td>
       </tr>
      ))}
      {!allEntries.length && <tr><td data-label="Date" colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-brand-dark dark:text-white/40">No timesheets logged yet. Click &ldquo;Log Hours&rdquo; to get started.</td></tr>}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Payslips({ payslips }) {
 const totalNet = payslips.reduce((s, p) => s + (p.netPay || 0), 0);
 const latestPay = payslips.length ? payslips[0].netPay : 0;
 const kpis = [
  { label: 'Total Net Received', value: `$${totalNet.toLocaleString()}`, icon: 'payments' },
  { label: 'Latest Net Pay', value: `$${latestPay.toLocaleString()}`, icon: 'account_balance_wallet' },
  { label: 'Available Payslips', value: payslips.length, icon: 'receipt_long' },
 ];
 const [page, setPage] = useState(1);
 const totalPages = Math.max(1, Math.ceil(payslips.length / CLIENT_PAGE_SIZE));
 const pagedPayslips = payslips.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-gutter lg:grid-cols-3">
    {kpis.map((stat) => (
     <div key={stat.label} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale dark:bg-blue-900/30">
       <Icon name={stat.icon} className="text-2xl text-brand" />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-white">{stat.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{stat.label}</p>
     </div>
    ))}
   </div>

   <div className="responsive-table overflow-x-auto rounded-xl border border-outline-variant bg-white dark:bg-dark-surface shadow-sm dark:border-dark-outline-variant">
    <div className="border-b border-outline-variant/50 bg-surface-container px-6 py-4 dark:border-dark-outline-variant/50 dark:bg-dark-surface-container/50">
     <h3 className="font-display text-body-md font-bold text-brand-dark dark:text-white">Monthly Compensation History</h3>
    </div>
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr>
       <th className="px-stack-lg py-4">Period</th>
       <th className="px-stack-lg py-4">Gross Earnings</th>
       <th className="px-stack-lg py-4">Deductions</th>
       <th className="px-stack-lg py-4">Net Payout</th>
       <th className="px-stack-lg py-4">Status</th>
       <th className="px-stack-lg py-4 text-right">Action</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {pagedPayslips.length === 0 ? (
       <tr><td data-label="Period" colSpan={6} className="px-stack-lg py-12 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No payslips available yet.</td></tr>
      ) : pagedPayslips.map((p) => (
       <tr key={`${p.month}-${p.year}`} className="transition-colors hover:bg-accent-cyan-pale dark:hover:bg-blue-900/30">
        <td data-label="Period" className="px-stack-lg py-4 font-semibold text-brand-dark dark:text-white">
         <div className="flex items-center gap-2">
          <Icon name="calendar_month" className="text-base text-brand" />
          <span>{p.month} {p.year}</span>
         </div>
        </td>
        <td data-label="Gross Earnings" className="px-stack-lg py-4 text-body-md text-ink-muted dark:text-dark-ink-muted">${p.grossPay.toLocaleString()}</td>
        <td data-label="Deductions" className="px-stack-lg py-4 text-body-md text-status-error">-${p.deductions.toLocaleString()}</td>
        <td data-label="Net Payout" className="px-stack-lg py-4 text-body-md font-bold text-emerald-600">${p.netPay.toLocaleString()}</td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant="success">{p.status}</StatusBadge></td>
        <td data-label="Action" className="px-stack-lg py-4 text-right">
         {p.file_url ? (
          <a
           href={p.file_url} target="_blank" rel="noreferrer" aria-label={`Download ${p.month} ${p.year} payslip`}
           className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-white dark:bg-dark-surface px-3 py-1.5 text-body-xs font-semibold text-ink shadow-sm transition hover:border-blue-500 hover:text-brand active:scale-95 dark:border-dark-outline-variant dark:text-white">
           <Icon name="download" className="text-sm" /> Slip
          </a>
         ) : (
          <span className="text-body-xs text-ink-muted dark:text-dark-ink-muted">Not available</span>
         )}
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Tasks({ tasks, page, totalPages, onPageChange, onRefresh }) {
 const [selectedTask, setSelectedTask] = useState(null);
 const priorityColor = { urgent: 'error', high: 'warning', medium: 'info', low: 'neutral' };
 const statusColor = { done: 'success', in_progress: 'info', todo: 'neutral', blocked: 'error' };
 const { run, isPending } = useAsyncAction();
 const [actionError, setActionError] = useState('');

 const handleUpdateStatus = (status) => run(async () => {
  if (!selectedTask) return;
  setActionError('');
  try {
   await apiRequest(`/tasks/${selectedTask.id}/status`, { method: 'PATCH', body: { status } });
   setSelectedTask(prev => prev ? { ...prev, status } : null);
   if (onRefresh) onRefresh();
  } catch (err) {
   setActionError(err?.message || 'Could not update status.');
  }
 });

 const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
 const completed = tasks.filter((t) => t.status === 'done').length;

 const kpis = [
  { label: 'Total Assigned Tasks', value: tasks.length, icon: 'assignment' },
  { label: 'In Progress', value: inProgress, icon: 'pending' },
  { label: 'Completed Tasks', value: completed, icon: 'check_circle' },
 ];

 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-gutter lg:grid-cols-3">
    {kpis.map((stat) => (
     <div key={stat.label} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale dark:bg-blue-900/30">
       <Icon name={stat.icon} className="text-2xl text-brand" />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-white">{stat.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{stat.label}</p>
     </div>
    ))}
   </div>

   <div className="responsive-table overflow-x-auto rounded-xl border border-outline-variant bg-white dark:bg-dark-surface shadow-sm dark:border-dark-outline-variant">
    <div className="border-b border-outline-variant/50 bg-surface-container px-6 py-4 dark:border-dark-outline-variant/50 dark:bg-dark-surface-container/50 flex flex-wrap items-center justify-between gap-2">
     <h3 className="font-display text-body-md font-bold text-brand-dark dark:text-white">Task Assignments & Milestones</h3>
     <span className="text-body-xs text-ink-muted dark:text-dark-ink-muted">Click any task row to view full details & requirements</span>
    </div>
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr>
       <th className="px-stack-lg py-4">Task Deliverable</th>
       <th className="px-stack-lg py-4">Project</th>
       <th className="px-stack-lg py-4">Priority</th>
       <th className="px-stack-lg py-4">Status</th>
       <th className="px-stack-lg py-4">Due Date</th>
       <th className="px-stack-lg py-4 text-right">Action</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {tasks.length === 0 ? (
       <tr><td data-label="Task Deliverable" colSpan={6} className="px-stack-lg py-12 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No tasks assigned yet.</td></tr>
      ) : tasks.map((t) => (
       <tr key={t.id} onClick={() => setSelectedTask(t)} className="cursor-pointer transition-colors hover:bg-accent-cyan-pale dark:hover:bg-blue-900/30">
        <td data-label="Task Deliverable" className="px-stack-lg py-4 font-semibold text-brand-dark dark:text-white">{t.title}</td>
        <td data-label="Project" className="px-stack-lg py-4">
         <span className="inline-flex items-center gap-1 rounded-md bg-surface-container px-2 py-0.5 text-body-xs font-semibold text-ink dark:bg-dark-surface-container dark:text-white">
          <Icon name="folder" className="text-xs text-brand" />
          {t.project}
         </span>
        </td>
        <td data-label="Priority" className="px-stack-lg py-4"><StatusBadge variant={priorityColor[t.priority] || 'neutral'}>{t.priority}</StatusBadge></td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={statusColor[t.status] || 'neutral'}>{t.status.replace('_', ' ')}</StatusBadge></td>
        <td data-label="Due Date" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.due}</td>
        <td data-label="Action" className="px-stack-lg py-4 text-right">
         <button className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-body-xs font-semibold text-brand hover:bg-brand/10">
          <Icon name="visibility" className="text-sm" /> View
         </button>
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />

   {/* Task Details Modal */}
   <Modal open={Boolean(selectedTask)} onClose={() => setSelectedTask(null)} title={selectedTask?.title || 'Task Details'} size="md">
    {selectedTask && (
     <div className="space-y-4 pt-2">
      <div className="flex flex-wrap items-center gap-2">
       <span className="inline-flex items-center gap-1 rounded bg-brand/10 px-2.5 py-1 text-body-xs font-semibold text-brand dark:bg-brand/20">
        <Icon name="folder" className="text-sm" /> {selectedTask.project}
       </span>
       <StatusBadge variant={priorityColor[selectedTask.priority] || 'neutral'}>Priority: {selectedTask.priority}</StatusBadge>
       <StatusBadge variant={statusColor[selectedTask.status] || 'neutral'}>Status: {selectedTask.status.replace('_', ' ')}</StatusBadge>
      </div>

      <div className="rounded-lg border border-outline-variant bg-surface-container p-4 dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted mb-1">Requirement & Description</p>
       <p className="text-body-md text-brand-dark dark:text-white whitespace-pre-wrap">
        {selectedTask.description || 'No detailed description provided.'}
       </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-body-sm">
       <div>
        <span className="text-ink-muted dark:text-dark-ink-muted">Due Date: </span>
        <span className="font-semibold text-brand-dark dark:text-white">{selectedTask.due}</span>
       </div>
       <div>
        <span className="text-ink-muted dark:text-dark-ink-muted">Estimated Hours: </span>
        <span className="font-semibold text-brand-dark dark:text-white">{selectedTask.estimated_hours ? `${selectedTask.estimated_hours}h` : '—'}</span>
       </div>
      </div>

      {actionError && <p className="text-body-sm text-status-error">{actionError}</p>}

      <div className="border-t border-outline-variant pt-4 dark:border-dark-outline-variant">
       <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted mb-2">Update Task Status:</p>
       <div className="flex flex-wrap gap-2">
        <Button variant={selectedTask.status === 'todo' ? 'primary' : 'outline'} size="sm" onClick={() => handleUpdateStatus('todo')} disabled={isPending}>TODO</Button>
        <Button variant={selectedTask.status === 'in_progress' ? 'primary' : 'outline'} size="sm" onClick={() => handleUpdateStatus('in_progress')} disabled={isPending}>IN PROGRESS</Button>
        <Button variant={selectedTask.status === 'done' ? 'primary' : 'outline'} size="sm" onClick={() => handleUpdateStatus('done')} disabled={isPending}>DONE ✓</Button>
        <Button variant={selectedTask.status === 'blocked' ? 'primary' : 'outline'} size="sm" onClick={() => handleUpdateStatus('blocked')} disabled={isPending}>BLOCKED</Button>
       </div>
      </div>
     </div>
    )}
   </Modal>
  </div>
 );
}

function Projects({ projects, page, totalPages, onPageChange }) {
 const [selectedProject, setSelectedProject] = useState(null);
 const statusColor = { completed: 'success', in_progress: 'info', on_hold: 'warning', planning: 'neutral' };
 const completed = projects.filter((p) => p.status === 'completed').length;
 const inProgress = projects.filter((p) => p.status === 'in_progress' || p.status === 'planning').length;
 const kpis = [
  { label: 'Total Projects', value: projects.length, icon: 'folder' },
  { label: 'In Progress', value: inProgress, icon: 'pending' },
  { label: 'Completed', value: completed, icon: 'check_circle' },
 ];
 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-gutter lg:grid-cols-3">
    {kpis.map((stat) => (
     <div key={stat.label} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale dark:bg-blue-900/30">
       <Icon name={stat.icon} className="text-2xl text-brand" />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-white">{stat.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{stat.label}</p>
     </div>
    ))}
   </div>
   <section>
    <h3 className="mb-4 font-display text-headline-sm text-white">Assigned Projects</h3>
    {projects.length === 0 && <p className="py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No projects assigned yet.</p>}
    <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
     {projects.map((p) => (
      <div key={p.id} onClick={() => setSelectedProject(p)} className="cursor-pointer flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant transition hover:border-brand">
       <p className="font-display text-body-md font-semibold text-brand-dark dark:text-white">{p.title}</p>
       <p className="mt-1 text-body-xs uppercase tracking-wide text-ink-muted dark:text-dark-ink-muted">Deadline: {p.deadline}</p>
       <p className="mt-2 flex-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">Role: {p.role}</p>
       <div className="mt-4 flex items-center justify-between">
        <StatusBadge variant={statusColor[p.status]}>{p.status.replace('_', ' ')}</StatusBadge>
        <span className="text-body-sm font-semibold text-brand-dark dark:text-white">{p.progress}%</span>
       </div>
       <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-container dark:bg-dark-surface-container">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${p.progress}%` }} />
       </div>
       <div className="mt-4 pt-3 border-t border-outline-variant/40 flex items-center justify-between text-body-xs font-semibold text-brand">
        <span>Click for overview</span>
        <Icon name="arrow_forward" className="text-sm" />
       </div>
      </div>
     ))}
    </div>
   </section>
   <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />

   {/* Project Overview Modal */}
   <Modal open={Boolean(selectedProject)} onClose={() => setSelectedProject(null)} title={selectedProject?.title || 'Project Overview'} size="md">
    {selectedProject && (
     <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
       <StatusBadge variant={statusColor[selectedProject.status]}>{selectedProject.status.replace('_', ' ')}</StatusBadge>
       <span className="text-body-sm font-bold text-brand">{selectedProject.progress}% complete</span>
      </div>

      <div className="rounded-lg border border-outline-variant bg-surface-container p-4 dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted mb-1">Project Overview</p>
       <p className="text-body-md text-brand-dark dark:text-white">
        {selectedProject.overview || selectedProject.title}
       </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-body-sm">
       <div>
        <span className="text-ink-muted dark:text-dark-ink-muted">Your Role: </span>
        <span className="font-semibold text-brand-dark dark:text-white">{selectedProject.role}</span>
       </div>
       <div>
        <span className="text-ink-muted dark:text-dark-ink-muted">Target Deadline: </span>
        <span className="font-semibold text-brand-dark dark:text-white">{selectedProject.deadline}</span>
       </div>
      </div>

      <div className="pt-2 text-right">
       <Button variant="primary" size="md" onClick={() => setSelectedProject(null)}>Close</Button>
      </div>
     </div>
    )}
   </Modal>
  </div>
 );
}

function Performance({ reviews }) {
 const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0;
 const totalGoals = reviews.reduce((s, r) => s + r.goals, 0);
 const totalAchieved = reviews.reduce((s, r) => s + r.achieved, 0);
 const kpis = [
  { label: 'Total Reviews', value: reviews.length, icon: 'reviews' },
  { label: 'Avg Rating', value: `${avgRating}/5`, icon: 'star' },
  { label: 'Goals Achieved', value: `${totalAchieved}/${totalGoals}`, icon: 'flag' },
 ];
 const [page, setPage] = useState(1);
 const totalPages = Math.max(1, Math.ceil(reviews.length / CLIENT_PAGE_SIZE));
 const pagedReviews = reviews.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);
 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-gutter lg:grid-cols-3">
    {kpis.map((stat) => (
     <div key={stat.label} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale dark:bg-blue-900/30">
       <Icon name={stat.icon} className="text-2xl text-brand" />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-white">{stat.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{stat.label}</p>
     </div>
    ))}
   </div>
   <section>
    <h3 className="mb-4 font-display text-headline-sm text-white">Performance Reviews</h3>
    {reviews.length === 0 && <p className="py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No performance reviews yet.</p>}
    <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
     {pagedReviews.map((r) => (
      <div key={r.period} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
       <p className="font-display text-body-md font-semibold text-brand-dark dark:text-white">{r.period}</p>
       <p className="mt-1 text-body-xs uppercase tracking-wide text-ink-muted dark:text-dark-ink-muted">Goals Set: {r.goals} &middot; Achieved: {r.achieved}</p>
       <p className="mt-2 flex-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">&ldquo;{r.feedback}&rdquo;</p>
       <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
         <Icon name="star" className="text-xl text-yellow-400" />
         <span className="font-stat text-body-md font-semibold text-brand-dark dark:text-white">{r.rating}/5</span>
        </div>
        <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{Math.round((r.achieved / r.goals) * 100)}% achieved</span>
       </div>
      </div>
     ))}
    </div>
   </section>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Training({ courses, catalog, onEnroll, enrollingId }) {
 const statusColor = { completed: 'success', in_progress: 'info', pending: 'neutral', enrolled: 'info' };
 const enrolledIds = new Set(courses.map((c) => c.courseId ?? c.id));
 const available = (catalog || []).filter((c) => !enrolledIds.has(c.id));
 const [page, setPage] = useState(1);
 const totalPages = Math.max(1, Math.ceil(courses.length / CLIENT_PAGE_SIZE));
 const pagedCourses = courses.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

 return (
  <div className="space-y-stack-lg">
   <section>
    <h3 className="mb-4 font-display text-headline-sm text-white">Available Courses</h3>
    {available.length > 0 ? (
     <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
      {available.map((c) => (
       <div key={c.id} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm transition-all hover:shadow-md dark:border-dark-outline-variant">
        <p className="font-display text-body-md font-semibold text-brand-dark dark:text-white">{c.title}</p>
        <p className="mt-1 font-label-caps text-body-xs uppercase tracking-wide text-brand">{c.category}</p>
        <p className="mt-2 flex-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.description || 'No description available.'}</p>
        <div className="mt-4 flex items-center justify-between border-t border-outline-variant/50 pt-3 dark:border-dark-outline-variant/50">
         <span className="text-body-sm font-medium text-ink-muted dark:text-dark-ink-muted">
          {c.duration_hours ? `${c.duration_hours} hrs` : 'Self-paced'}
         </span>
         <button
          type="button"
          onClick={() => onEnroll(c.id)}
          disabled={enrollingId === c.id}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
         >
          <Icon name="school" className="text-base leading-none" />
          {enrollingId === c.id ? 'Enrolling...' : 'Enroll'}
         </button>
        </div>
       </div>
      ))}
     </div>
    ) : (
     <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-8 text-center text-body-sm text-ink-muted shadow-sm dark:border-dark-outline-variant dark:text-dark-ink-muted">
      You are enrolled in all available courses, or no new courses are listed.
     </div>
    )}
   </section>

   <section>
    <h3 className="mb-4 font-display text-headline-sm text-white">My Enrollments</h3>
    <div className="responsive-table overflow-x-auto rounded-xl border border-outline-variant bg-white dark:bg-dark-surface shadow-sm dark:border-dark-outline-variant">
     <table className="w-full text-left">
      <thead className="border-b border-outline-variant bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:border-dark-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted">
       <tr>
        <th className="px-6 py-4">Course</th>
        <th className="px-6 py-4">Category</th>
        <th className="px-6 py-4">Status</th>
        <th className="px-6 py-4">Completed On</th>
        <th className="px-6 py-4">Score</th>
       </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
       {pagedCourses.length === 0 ? (
        <tr><td data-label="Course" colSpan={5} className="px-6 py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No enrollments yet. Browse available courses above and click Enroll!</td></tr>
       ) : pagedCourses.map((c) => (
        <tr key={c.id} className="transition-colors hover:bg-surface-container dark:bg-dark-surface-container">
         <td data-label="Course" className="px-6 py-4 font-medium text-brand-dark dark:text-white">{c.title}</td>
         <td data-label="Category" className="px-6 py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.category}</td>
         <td data-label="Status" className="px-6 py-4"><StatusBadge variant={statusColor[c.status] || 'neutral'}>{c.status?.replace('_', ' ')}</StatusBadge></td>
         <td data-label="Completed On" className="px-6 py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.completedOn || '—'}</td>
         <td data-label="Score" className="px-6 py-4 text-body-sm font-semibold text-brand-dark dark:text-white">{c.score || '—'}</td>
        </tr>
       ))}
      </tbody>
     </table>
    </div>
    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
   </section>
  </div>
 );
}

function Documents({ docs }) {
 const typeIcon = { contract: 'gavel', id_proof: 'badge', certificate: 'workspace_premium', other: 'description', resume: 'person' };
 const contracts = docs.filter((d) => d.type === 'contract').length;
 const certs = docs.filter((d) => d.type === 'certificate').length;
 const kpis = [
  { label: 'Total Documents', value: docs.length, icon: 'description' },
  { label: 'Contracts', value: contracts, icon: 'gavel' },
  { label: 'Certificates', value: certs, icon: 'workspace_premium' },
 ];
 const [page, setPage] = useState(1);
 const totalPages = Math.max(1, Math.ceil(docs.length / CLIENT_PAGE_SIZE));
 const pagedDocs = docs.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-gutter lg:grid-cols-3">
    {kpis.map((stat) => (
     <div key={stat.label} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale dark:bg-blue-900/30">
       <Icon name={stat.icon} className="text-2xl text-brand" />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-white">{stat.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{stat.label}</p>
     </div>
    ))}
   </div>
   <section>
    <h3 className="mb-4 font-display text-headline-sm text-white">My Documents</h3>
    {docs.length === 0 && <p className="py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No documents available yet.</p>}
    <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
     {pagedDocs.map((d) => (
      <div key={d.id} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
       <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale dark:bg-blue-900/30">
        <Icon name={typeIcon[d.type] || 'description'} className="text-2xl text-brand" />
       </div>
       <p className="font-display text-body-md font-semibold text-brand-dark dark:text-white">{d.name}</p>
       <p className="mt-1 text-body-xs uppercase tracking-wide text-ink-muted dark:text-dark-ink-muted">{d.type.replace('_', ' ')}{d.size ? ` · ${d.size}` : ''}</p>
       <p className="mt-2 flex-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">{d.uploadedOn}</p>
       <div className="mt-4 flex items-center justify-between">
        <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Document</span>
        {d.file_url ? (
         <a
          href={d.file_url} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 rounded bg-brand px-4 py-2 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark"
          aria-label={`Download ${d.name}`}>
          <Icon name="download" className="text-base leading-none" />
          Download
         </a>
        ) : (
         <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Not available</span>
        )}
       </div>
      </div>
     ))}
    </div>
   </section>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

const ROLE_LABELS = {
 employee: 'Employee',
 developer: 'Developer',
 sales: 'Sales',
 marketing: 'Marketing',
 project_manager: 'Project Manager',
 qa: 'QA',
 support: 'Support',
 finance: 'Finance',
 hr: 'HR',
};

const PATH_ROLE_MAP = {
 '/employee': 'employee',
 '/sales': 'sales',
 '/marketing': 'marketing',
 '/developer': 'developer',
 '/project-manager': 'project_manager',
 '/qa': 'qa',
 '/support': 'support',
 '/finance': 'finance',
 '/hr': 'hr',
};

const CRM_ROLES = ['sales', 'marketing', 'admin', 'project_manager'];

// ─── Employee data normalizers ───────────────────────────────────────────────
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const normalizeLeaves = (arr) => (arr || []).map((l) => ({
 id: l.id, type: l.type,
 from: l.start_date ?? l.from, to: l.end_date ?? l.to, status: l.status,
 days: l.start_date && l.end_date ? Math.ceil((new Date(l.end_date) - new Date(l.start_date)) / 86400000) + 1 : (l.days ?? 1),
}));

const normalizeTimesheets = (arr) => (arr || []).map((t) => ({
 id: t.id, date: t.date,
 project: t.project?.title ?? t.project_name ?? 'General',
 hours: Number(t.hours ?? 0), description: t.description,
}));

const normalizePayslips = (arr) => (arr || []).map((p) => ({
 id: p.id, month: MONTH_NAMES[(p.month ?? 1) - 1], year: p.year,
 grossPay: Number(p.basic ?? 0) + Number(p.allowances ?? 0),
 deductions: Number(p.deductions ?? 0), netPay: Number(p.net_pay ?? 0), status: p.status,
 file_url: p.file_url,
}));

const normalizeTasks = (arr) => (arr || []).map((t) => ({
 id: t.id, title: t.title,
 description: t.description,
 project_id: t.project_id,
 project: t.project_title ?? t.project?.title ?? t.project_name ?? '—',
 priority: t.priority, status: t.status, due: t.due_date ?? t.due ?? '—',
 estimated_hours: t.estimated_hours,
}));

const normalizeEmpProjects = (arr, pmUserId) => (arr || []).map((p) => ({
 id: p.id, title: p.title,
 overview: p.overview,
 role: p.project_manager_id === pmUserId ? 'Project Manager' : (p.role ?? 'Team Member'),
 status: p.status,
 progress: p.progress_percent ?? p.progress ?? 0,
 deadline: p.end_date ?? p.deadline ?? '—',
}));

const normalizePerformance = (arr) => (arr || []).map((r) => ({
 period: r.review_period ?? r.period,
 rating: Number(r.rating ?? 0), goals: r.goals_set ?? r.goals ?? 0,
 achieved: r.goals_achieved ?? r.achieved ?? 0, feedback: r.feedback ?? r.comments ?? '',
}));

const normalizeTraining = (arr) => (arr || []).map((t) => ({
 id: t.id, courseId: t.course_id ?? t.courseId ?? t.training?.id,
 title: t.training?.title ?? t.title,
 category: t.training?.category ?? t.category ?? '—',
 status: t.status, completedOn: t.completed_at?.slice(0, 10) ?? t.completedOn ?? null,
 score: t.score ?? null,
}));

const normalizeCatalog = (arr) => (arr || []).map((c) => ({
 id: c.id, title: c.title, category: c.category || 'General',
 description: c.description, duration_hours: c.duration_hours,
}));

const normalizeDocs = (arr) => (arr || []).map((d) => ({
 id: d.id, name: d.title ?? d.name, type: d.type,
 uploadedOn: d.created_at?.slice(0, 10) ?? d.uploadedOn, file_url: d.file_url,
}));

const toLocalTime = (t) => {
 if (!t) return null;
 const m = String(t).match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
 if (!m) return t;
 let h = Number(m[1]) % 12;
 if (m[3].toUpperCase() === 'PM') h += 12;
 const d = new Date();
 d.setUTCHours(h, Number(m[2]), 0, 0);
 return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function EmployeePortal() {
 const { pathname } = useLocation();
 const urlRole = PATH_ROLE_MAP[pathname] || 'employee';
 const portalTitle = `${ROLE_LABELS[urlRole] || 'Employee'} Portal`;

 useDocumentTitle(`${portalTitle} | CoralSwift Technologies`);
 const { user, initializing, logout } = useAuth();
 const { denied } = useRoleGuard('employee', '/login');
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('overview');
 const [loading, setLoading] = useState(true);
 const initialLoadDone = useRef(false);
 const [profile, setProfile] = useState({ name: '', email: '', role: 'employee', designation: '', department: '', status: 'active', employee_code: '' });
 const [attendance, setAttendance] = useState({ date: new Date().toISOString().slice(0, 10), checkIn: null, checkOut: null, status: 'absent' });
 const [leaves, setLeaves] = useState([]);
 const [timesheets, setTimesheets] = useState([]);
 const [payslips, setPayslips] = useState([]);
 const [tasks, setTasks] = useState([]);
 const [tasksPage, setTasksPage] = useState(1);
 const [tasksTotalPages, setTasksTotalPages] = useState(1);
 const [projects, setProjects] = useState([]);
 const [projectsPage, setProjectsPage] = useState(1);
 const [projectsTotalPages, setProjectsTotalPages] = useState(1);
 const [performance, setPerformance] = useState([]);
 const [training, setTraining] = useState([]);
 const [catalog, setCatalog] = useState([]);
 const [enrollingId, setEnrollingId] = useState(null);
 const [documents, setDocuments] = useState([]);
 const [leadsData, setLeadsData] = useState([]);
 const [proposalsData, setProposalsData] = useState([]);
 const [contractsData, setContractsData] = useState([]);
 const [meetingsData, setMeetingsData] = useState([]);
 const [clientsData, setClientsData] = useState([]);
 // The portal always uses the role the backend authenticated for this session.
 // No client-side role override is possible — tabs and permissions reflect the
 // real role returned by `/employees/me/profile`.
 const effectiveRole = profile.role;
 const portalTabs = employeeTabsForRole(effectiveRole);

 const refreshCrm = useCallback(() => {
  // Leads/Proposals/Contracts/Meetings feed cross-referencing views
  // (CrmDashboard funnel stats, SalesReports, Proposals' lead-name lookup,
  // Contracts' proposal/lead lookup) that need the full working set, not
  // just one page — so this fetches a large batch (matching fetchClients'
  // limit:100 below) and the CRM sub-views (SalesCrmViews.jsx) paginate
  // that already-fetched array client-side rather than re-fetching per page.
  Promise.allSettled([
   fetchLeads({ limit: 100 }),
   fetchProposals({ limit: 100 }),
   fetchContracts({ limit: 100 }),
   fetchMeetings({ limit: 100 }),
   fetchClients({ limit: 100 }),
  ]).then(([l, p, c, m, cl]) => {
   if (l.status === 'fulfilled') setLeadsData(l.value?.data || []);
   if (p.status === 'fulfilled') setProposalsData(p.value?.data || []);
   if (c.status === 'fulfilled') setContractsData(c.value?.data || []);
   if (m.status === 'fulfilled') setMeetingsData(m.value?.data || []);
   if (cl.status === 'fulfilled') setClientsData(cl.value?.data || []);
  });
 }, []);

 const { run: runEnroll } = useAsyncAction();

 const handleEnroll = (courseId) => runEnroll(async () => {
  setEnrollingId(courseId);
  try {
   await enrollInCourse(courseId);
   const res = await fetchMyTrainingEnrollments();
   setTraining(normalizeTraining(res?.data));
  } catch {
   // Non-critical: enrollment list simply won't reflect the failed attempt.
  } finally {
   setEnrollingId(null);
  }
 });

 useEffect(() => {
  if (!user) { setLoading(false); return; }
  if (!initialLoadDone.current) setLoading(true);

  const handleProfile = (profileData) => {
   if (!profileData) return;
   const p = profileData;
   const realRole = p.role || 'employee';
   setProfile({
    _employeeId: p.id,
    _userId: p.user_id,
    employee_code: p.employee_code,
    name: p.name || user.email,
    email: p.email || user.email,
    role: realRole,
    designation: p.designation,
    department: p.department_name || p.department_id,
    status: p.status,
   });
   Promise.allSettled([
    apiRequest(`/employees/me/attendance/today`),
    apiRequest(`/employees/me/leaves`),
    apiRequest(`/employees/me/timesheets`),
   ]).then(([attRes, lvRes, tsRes]) => {
    if (attRes.status === 'fulfilled' && attRes.value?.data) {
     const a = attRes.value.data;
     setAttendance({ date: a.date, checkIn: toLocalTime(a.check_in), checkOut: toLocalTime(a.check_out), status: a.status });
    }
    if (lvRes.status === 'fulfilled') setLeaves(normalizeLeaves(lvRes.value?.data));
    if (tsRes.status === 'fulfilled') setTimesheets(normalizeTimesheets(tsRes.value?.data));
   });
  };

  Promise.allSettled([
   fetchMyProfile().then((res) => {
    const p = res?.data;
    if (p) handleProfile(p);
    return res;
   }),
   fetchMyPayslips(),
   fetchMyPerformanceReviews(),
   fetchMyTrainingEnrollments(),
   fetchMyDocuments(),
   fetchTrainingCatalog(),
  ]).then(([, psRes, perfRes, trainRes, docsRes, catRes]) => {
   if (psRes.status === 'fulfilled') setPayslips(normalizePayslips(psRes.value?.data));
   if (perfRes.status === 'fulfilled') setPerformance(normalizePerformance(perfRes.value?.data));
   if (trainRes.status === 'fulfilled') setTraining(normalizeTraining(trainRes.value?.data));
   if (catRes.status === 'fulfilled') setCatalog(normalizeCatalog(catRes.value?.data));
   if (docsRes.status === 'fulfilled') setDocuments(normalizeDocs(docsRes.value?.data));
  }).finally(() => { initialLoadDone.current = true; setLoading(false); });
 }, [user]);

 // Tasks and Projects (unlike the /employees/me/* self-service lists above)
 // are backed by routers (tasks.py/projects.py) that support real
 // page_params, so these fetch one page at a time instead of a capped batch.
 useEffect(() => {
  if (!profile._userId) return;
  apiRequest(`/tasks?assigned_to=${profile._userId}&page=${tasksPage}&limit=20`)
   .then((res) => { setTasks(normalizeTasks(res?.data)); setTasksTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {});
 }, [profile._userId, tasksPage]);

 useEffect(() => {
  if (!profile._userId && !profile._employeeId) return;
  const isPM = profile.role === 'project_manager' || profile.role === 'admin';
  const url = isPM
   ? `/projects?project_manager_id=${profile._userId}&page=${projectsPage}&limit=20`
   : `/projects?employee_id=${profile._employeeId}&page=${projectsPage}&limit=20`;
  apiRequest(url)
   .then((res) => { setProjects(normalizeEmpProjects(res?.data, profile._userId)); setProjectsTotalPages(res?.meta?.total_pages || 1); })
   .catch(() => {});
 }, [profile._userId, profile._employeeId, profile.role, projectsPage]);

 useEffect(() => {
  if (!user || !CRM_ROLES.includes(effectiveRole)) return;
  refreshCrm();
 }, [user, effectiveRole, refreshCrm]);

 // Reset to the first tab whenever the (real or previewed) role changes, since the
 // previously active tab may not exist in the new role's tab set.
 useEffect(() => {
  setActiveTab('overview');
 }, [effectiveRole]);

 // useRoleGuard already redirects the unauthenticated case (to
 // /login?returnTo=..., preserving destination). This only adds a smarter
 // fallback for the authenticated-but-wrong-role case: a client account
 // landing here goes to /client instead of bouncing to /login.
 useEffect(() => {
  if (!initializing && user && denied) navigate(profile.role === 'client' ? '/client' : '/login', { replace: true });
 }, [initializing, user, denied, profile.role, navigate]);

 if (initializing || !user || denied) return <div className="bg-white/10 py-section-padding"><LoadingSpinner /></div>;
 if (loading) return <div className="bg-white/10 py-section-padding"><LoadingSpinner /></div>;

  return (
   <div className="flex h-dvh flex-col bg-dark-surface">
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-brand-dark/30 bg-brand-dark px-4 py-3 sm:gap-4 sm:px-6 lg:px-10 xl:px-12">
     <div className="flex min-w-0 items-center gap-2 sm:gap-4">
      <Avatar name={profile.name} size="lg" />
      <div className="min-w-0">
       <p className="mb-0.5 font-label-caps text-body-xs uppercase tracking-widest text-cyan-300 font-bold">{portalTitle}</p>
       <h1 className="max-w-[50vw] truncate font-display text-headline-md font-bold text-white sm:max-w-none">{profile.name}</h1>
       <p className="truncate text-body-sm text-white/80">{profile.email}{profile.designation ? ` · ${profile.designation}` : ''}{profile.department ? ` · ${profile.department}` : ''}</p>
      </div>
     </div>
     <div className="flex shrink-0 items-center gap-2 sm:gap-3">
      <Button variant="outline-light" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
       Sign Out
      </Button>
     </div>
    </div>

   <div className="flex min-h-0 flex-1">
    <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-brand-dark/30 bg-brand-dark md:block">
     <nav aria-label="Portal navigation" className="flex flex-col gap-1 p-3">
      {portalTabs.map((tab) => (
       <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-label-caps text-label-caps uppercase transition-colors ${
         activeTab === tab.id ? 'bg-white/20 font-bold text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </nav>
    </aside>

    <div className="flex min-h-0 flex-1 flex-col">
     <div className="scrollbar-hide mb-stack-lg flex gap-1 overflow-x-auto border-b px-4 py-2 sm:px-6 md:hidden lg:px-10 xl:px-12">
      {portalTabs.map((tab) => (
       <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-label-caps text-label-caps uppercase transition-colors ${
         activeTab === tab.id ? 'border-white font-bold text-white' : 'border-transparent text-white/70 hover:border-white/40 hover:text-white'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </div>

     <div className="min-w-0 flex-1 overflow-y-auto px-4 py-stack-lg sm:px-6 lg:px-10 xl:px-12 ">
      {activeTab === 'overview' && <Overview profile={profile} attendance={attendance} leaves={leaves} timesheets={timesheets} payslips={payslips} />}
      <Suspense fallback={<TabFallback />}>
       {activeTab === 'crm-dashboard' && effectiveRole === 'sales' && <CrmDashboard leads={leadsData} proposals={proposalsData} contracts={contractsData} />}
       {activeTab === 'contact-submissions' && effectiveRole === 'sales' && <ContactSubmissionsView onLeadCreated={refreshCrm} />}
       {activeTab === 'leads' && effectiveRole === 'sales' && <Leads leads={leadsData} onRefresh={refreshCrm} />}
       {activeTab === 'clients' && effectiveRole === 'sales' && <SalesClients clients={clientsData} />}
       {activeTab === 'proposals' && effectiveRole === 'sales' && <Proposals proposals={proposalsData} leads={leadsData} contracts={contractsData} onRefresh={refreshCrm} onNavigateTab={setActiveTab} />}
       {activeTab === 'contracts' && effectiveRole === 'sales' && <Contracts contracts={contractsData} proposals={proposalsData} leads={leadsData} onRefresh={refreshCrm} />}
       {activeTab === 'meetings' && effectiveRole === 'sales' && <SalesMeetings meetings={meetingsData} clients={clientsData} onRefresh={refreshCrm} />}
       {activeTab === 'reports' && effectiveRole === 'sales' && <SalesReports leads={leadsData} proposals={proposalsData} contracts={contractsData} />}
       {activeTab === 'marketing-leads' && effectiveRole === 'marketing' && <MarketingLeadsView />}
       {activeTab === 'testimonials' && effectiveRole === 'marketing' && <TestimonialModeration />}
       {activeTab === 'team-projects' && effectiveRole === 'project_manager' && <TeamProjects userId={user?.id} />}
       {activeTab === 'task-board' && effectiveRole === 'project_manager' && <TaskBoard userId={user?.id} />}
       {activeTab === 'approvals' && effectiveRole === 'project_manager' && <Approvals />}
       {activeTab === 'my-tasks' && effectiveRole === 'developer' && <MyTasksBoard userId={user?.id} />}
       {activeTab === 'test-queue' && effectiveRole === 'qa' && <TestQueue />}
       {activeTab === 'ticket-queue' && effectiveRole === 'support' && <TicketQueue userId={user?.id} />}
       {activeTab === 'invoices' && effectiveRole === 'finance' && <Invoices />}
       {activeTab === 'leave-approvals' && effectiveRole === 'hr' && <LeaveApprovals />}
       {activeTab === 'recruitment' && effectiveRole === 'hr' && <Recruitment />}
      </Suspense>
      {activeTab === 'attendance' && <Attendance attendance={attendance} onChange={setAttendance} />}
      {activeTab === 'leaves' && <Leaves leaves={leaves} />}
      {activeTab === 'timesheets' && <Timesheets timesheets={timesheets} />}
      {activeTab === 'payslips' && <Payslips payslips={payslips} />}
      {activeTab === 'tasks' && (
       <Tasks
        tasks={tasks}
        page={tasksPage}
        totalPages={tasksTotalPages}
        onPageChange={setTasksPage}
        onRefresh={() => {
         if (!profile._userId) return;
         apiRequest(`/tasks?assigned_to=${profile._userId}&page=${tasksPage}&limit=20`)
          .then((res) => { setTasks(normalizeTasks(res?.data)); setTasksTotalPages(res?.meta?.total_pages || 1); })
          .catch(() => {});
        }}
       />
      )}
      {activeTab === 'projects' && <Projects projects={projects} page={projectsPage} totalPages={projectsTotalPages} onPageChange={setProjectsPage} />}
      {activeTab === 'performance' && <Performance reviews={performance} />}
      {activeTab === 'training' && <Training courses={training} catalog={catalog} onEnroll={handleEnroll} enrollingId={enrollingId} />}
      {activeTab === 'documents' && <Documents docs={documents} />}

     </div>
    </div>
   </div>
  </div>
 );
}
