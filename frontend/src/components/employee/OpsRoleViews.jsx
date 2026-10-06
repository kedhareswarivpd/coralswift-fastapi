import { useState, useEffect, useCallback } from 'react';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import RowAction from '../ui/RowAction.jsx';
import Pagination from '../ui/Pagination.jsx';
import { SkeletonTable } from '../ui/Skeleton.jsx';
import { FORM_INPUT_CLASS } from '../ui/formClasses.js';
import useAsyncAction from '../../hooks/useAsyncAction.js';
import { validateNewInvoice } from '../../schemas/finance.schema.js';
import {
 fetchTasks, updateTaskStatus,
 fetchTickets, updateTicket, replyToTicket,
 fetchInvoices, createInvoice, updateInvoice, recordPayment,
 fetchClients,
} from '../../api/admin.js';

const TASK_STATUS_COLUMNS = ['todo', 'in_progress', 'in_review', 'done', 'blocked'];
const TASK_PRIORITY_COLOR = { low: 'neutral', medium: 'info', high: 'warning', urgent: 'error' };
const TICKET_STATUS_COLOR = { open: 'warning', in_progress: 'info', resolved: 'success', closed: 'neutral' };
const TICKET_PRIORITY_COLOR = { low: 'neutral', medium: 'info', high: 'warning', critical: 'error' };
const INVOICE_STATUS_COLOR = { draft: 'neutral', sent: 'warning', paid: 'success', overdue: 'error', cancelled: 'neutral' };

// ---------- Developer ----------
function MyTasksBoard({ userId }) {
 const [tasks, setTasks] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [savingId, setSavingId] = useState(null);
 const [toast, setToast] = useState({ msg: '', type: 'success' });
 const { run, isPending } = useAsyncAction();

 const showToast = (msg, type = 'success') => {
  setToast({ msg, type });
  setTimeout(() => setToast({ msg: '', type: 'success' }), 3500);
 };

 const load = useCallback(() => {
  if (!userId) { setLoading(false); return; }
  setLoading(true);
  fetchTasks({ assigned_to: userId, page, limit: 20 })
   .then((r) => { setTasks(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [userId, page]);

 useEffect(() => { load(); }, [load]);

 const changeStatus = (taskId, status) => run(async () => {
  setSavingId(taskId);
  try {
   await updateTaskStatus(taskId, status);
   showToast(`Task moved to ${status.replace('_', ' ')}`);
   load();
  } catch (err) {
   showToast(err?.message || 'Failed to update task', 'error');
  } finally {
   setSavingId(null);
  }
 });

 const kpis = [
  { label: 'Assigned to Me', value: tasks.length, icon: 'assignment' },
  { label: 'In Progress', value: tasks.filter((t) => t.status === 'in_progress').length, icon: 'pending' },
  { label: 'In Review', value: tasks.filter((t) => t.status === 'in_review').length, icon: 'rate_review' },
  { label: 'Blocked', value: tasks.filter((t) => t.status === 'blocked').length, icon: 'report' },
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

   {toast.msg && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.type === 'success' ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text' : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast.msg}</p>
   )}

   <div className="grid gap-gutter md:grid-cols-5">
    {TASK_STATUS_COLUMNS.map((col) => {
     const colTasks = tasks.filter((t) => t.status === col);
     return (
      <div key={col} className="space-y-3 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-4 shadow-sm dark:border-dark-outline-variant">
       <div className="flex items-center justify-between border-b border-outline-variant/50 pb-2 dark:border-dark-outline-variant/50">
        <p className="font-label-caps text-label-caps font-bold uppercase text-ink dark:text-white">
         {col.replace('_', ' ')}
        </p>
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-body-xs font-semibold text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">{colTasks.length}</span>
       </div>
       <div className="space-y-2.5">
        {colTasks.map((t) => (
         <div key={t.id} className="space-y-2 rounded-lg border border-outline-variant bg-surface-container p-3.5 shadow-sm transition-all hover:border-outline-variant hover:shadow dark:border-dark-outline-variant dark:bg-dark-surface-container">
          <div className="flex items-start justify-between gap-2">
           <p className="text-body-sm font-semibold leading-snug text-brand-dark dark:text-white">{t.title}</p>
           <StatusBadge variant={TASK_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge>
          </div>
          {t.due_date && (
           <p className="flex items-center gap-1 text-body-xs text-ink-muted dark:text-dark-ink-muted">
            <Icon name="event" className="text-xs" />
            <span>Due: {t.due_date}</span>
           </p>
          )}
          <div className="pt-1">
           <select value={t.status} disabled={isPending && savingId === t.id} onChange={(e) => changeStatus(t.id, e.target.value)}
            className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-2 py-1 text-body-xs font-medium text-ink focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white">
            {TASK_STATUS_COLUMNS.map((s) => (
             <option key={s} value={s}>Move to: {s.replace('_', ' ').toUpperCase()}</option>
            ))}
           </select>
          </div>
         </div>
        ))}
        {!colTasks.length && (
         <div className="rounded-lg border border-dashed border-outline-variant py-6 text-center text-body-xs text-ink-muted dark:border-dark-outline-variant dark:text-dark-ink-muted">
          No tasks
         </div>
        )}
       </div>
      </div>
     );
    })}
   </div>

   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

// ---------- QA ----------
function TestQueue() {
 const [tasks, setTasks] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [savingId, setSavingId] = useState(null);
 const [filter, setFilter] = useState('in_review');
 const [toast, setToast] = useState('');
 const { run, isPending } = useAsyncAction();

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const load = useCallback(() => {
  setLoading(true);
  fetchTasks({ page, limit: 20 })
   .then((r) => { setTasks(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => { load(); }, [load]);

 useEffect(() => {
  const id = setInterval(load, 30000);
  return () => clearInterval(id);
 }, [load]);

 const resolve = (id, status) => run(async () => {
  setSavingId(id);
  try {
   await updateTaskStatus(id, status);
   showToast(status === 'done' ? 'Task passed QA.' : 'Task blocked — bug logged.');
   load();
  } catch (err) {
   showToast(err?.message || 'Action failed.');
  } finally {
   setSavingId(null);
  }
 });

 const visible = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);
 const kpis = [
  { label: 'In Review', value: tasks.filter((t) => t.status === 'in_review').length, icon: 'bug_report' },
  { label: 'Passed', value: tasks.filter((t) => t.status === 'done').length, icon: 'task_alt' },
  { label: 'Blocked / Bugs', value: tasks.filter((t) => t.status === 'blocked').length, icon: 'report' },
  { label: 'Total Tasks', value: tasks.length, icon: 'fact_check' },
 ];

 const TASK_STATUS_COLOR = { todo: 'neutral', in_progress: 'info', in_review: 'warning', done: 'success', blocked: 'error' };

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

   <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
     <span className="font-label-caps text-label-caps uppercase text-brand-dark dark:text-white">Filter:</span>
     {['in_review', 'done', 'blocked', 'all'].map((s) => (
      <button key={s} onClick={() => setFilter(s)}
       className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
        filter === s ? 'border-brand bg-brand text-white' : 'border-outline-variant text-ink-muted hover:border-brand hover:text-brand dark:border-dark-outline-variant dark:text-dark-ink-muted'
       }`}>{s.replace('_', ' ')}
      </button>
     ))}
    </div>
    <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-brand-dark dark:text-white">
     <Icon name="refresh" className="text-base" /> Refresh
    </button>
   </div>

   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('passed') || toast.includes('success')
      ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text'
      : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast}</p>
   )}

   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr>
       <th className="px-stack-lg py-4">Task</th>
       <th className="px-stack-lg py-4">Priority</th>
       <th className="px-stack-lg py-4">Status</th>
       <th className="px-stack-lg py-4">Due</th>
       <th className="px-stack-lg py-4">Actions</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {visible.map((t) => (
       <tr key={t.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Task" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-white">{t.title}</td>
        <td data-label="Priority" className="px-stack-lg py-4"><StatusBadge variant={TASK_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge></td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={TASK_STATUS_COLOR[t.status]}>{t.status?.replace('_', ' ')}</StatusBadge></td>
        <td data-label="Due" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.due_date || '—'}</td>
        <td data-label="Actions" className="px-stack-lg py-4">
         <div className="flex gap-2">
          <RowAction disabled={isPending && savingId === t.id} onClick={() => resolve(t.id, 'done')}>Pass</RowAction>
          <RowAction variant="outline" disabled={isPending && savingId === t.id} onClick={() => resolve(t.id, 'blocked')}>Fail / Log Bug</RowAction>
         </div>
        </td>
       </tr>
      ))}
      {!visible.length && <tr><td data-label="Task" colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">Nothing waiting for QA sign-off.</td></tr>}
     </tbody>
    </table>
   </div>

   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

// ---------- Support ----------
function TicketQueue({ userId }) {
 const [tickets, setTickets] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [savingId, setSavingId] = useState(null);
 const [replyDraft, setReplyDraft] = useState({});
 const [openTicketId, setOpenTicketId] = useState(null);
 const [filter, setFilter] = useState('all');
 const [toast, setToast] = useState('');
 const { run, isPending } = useAsyncAction();

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const isRealId = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id ?? '');

 const load = useCallback(() => {
  setLoading(true);
  fetchTickets({ page, limit: 20 })
   .then((r) => { setTickets(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => { load(); }, [load]);

 useEffect(() => {
  const id = setInterval(load, 30000);
  return () => clearInterval(id);
 }, [load]);

 const changeStatus = (id, status) => run(async () => {
  setSavingId(id);
  try {
   if (isRealId(id)) {
    await updateTicket(id, { status });
   } else {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
   }
   showToast(`Ticket ${status.replace('_', ' ')}.`);
   if (isRealId(id)) load();
  } catch (err) {
   showToast(err?.message || 'Action failed.');
  } finally {
   setSavingId(null);
  }
 });

 const assignToMe = (id) => run(async () => {
  setSavingId(id);
  try {
   if (isRealId(id)) {
    await updateTicket(id, { assigned_to: userId });
   } else {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, assigned_to: userId || 'u-support' } : t)));
   }
   showToast('Ticket assigned to you.');
   if (isRealId(id)) load();
  } catch (err) {
   showToast(err?.message || 'Assignment failed.');
  } finally {
   setSavingId(null);
  }
 });

 const sendReply = (id) => run(async () => {
  const message = replyDraft[id];
  if (!message) return;
  setSavingId(id);
  try {
   if (isRealId(id)) {
    await replyToTicket(id, { message });
   }
   setReplyDraft((prev) => ({ ...prev, [id]: '' }));
   setOpenTicketId(null);
   showToast('Reply sent.');
  } catch (err) {
   showToast(err?.message || 'Reply failed.');
  } finally {
   setSavingId(null);
  }
 });

 const visible = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);
 const kpis = [
  { label: 'Open', value: tickets.filter((t) => t.status === 'open').length, icon: 'confirmation_number' },
  { label: 'In Progress', value: tickets.filter((t) => t.status === 'in_progress').length, icon: 'pending_actions' },
  { label: 'Resolved', value: tickets.filter((t) => t.status === 'resolved').length, icon: 'task_alt' },
  { label: 'Unassigned', value: tickets.filter((t) => !t.assigned_to).length, icon: 'person_off' },
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

   <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex items-center gap-3">
     <span className="font-label-caps text-label-caps uppercase text-brand-dark dark:text-white">Filter:</span>
     {['all', 'open', 'in_progress', 'resolved', 'closed'].map((s) => (
      <button key={s} onClick={() => setFilter(s)}
       className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
        filter === s ? 'border-brand bg-brand text-white' : 'border-outline-variant text-ink-muted hover:border-brand hover:text-brand dark:border-dark-outline-variant dark:text-dark-ink-muted'
       }`}>{s.replace('_', ' ')}
      </button>
     ))}
    </div>
    <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-brand-dark dark:text-white">
     <Icon name="refresh" className="text-base" /> Refresh
    </button>
   </div>

   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('sent') || toast.includes('assigned') || toast.includes('resolved') || toast.includes('closed')
      ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text'
      : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast}</p>
   )}

   <div className="space-y-4">
    {visible.map((t) => (
     <div key={t.id} className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-4">
       <div>
        <p className="font-display text-body-md font-semibold text-brand-dark dark:text-white">{t.subject}</p>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.ticket_number}</p>
       </div>
       <div className="flex items-center gap-2">
        <StatusBadge variant={TICKET_PRIORITY_COLOR[t.priority]}>{t.priority}</StatusBadge>
        <StatusBadge variant={TICKET_STATUS_COLOR[t.status]}>{t.status.replace('_', ' ')}</StatusBadge>
       </div>
      </div>
      <p className="mb-3 text-body-sm text-ink-muted dark:text-dark-ink-muted">{t.description}</p>
      <div className="flex flex-wrap items-center gap-2">
       {!t.assigned_to && <RowAction disabled={isPending && savingId === t.id} onClick={() => assignToMe(t.id)}>Assign to me</RowAction>}
       <select value={t.status} disabled={isPending && savingId === t.id} onChange={(e) => changeStatus(t.id, e.target.value)}
        className="rounded border border-outline-variant bg-white dark:bg-dark-surface px-2 py-1.5 text-body-sm text-brand-dark dark:border-dark-outline-variant dark:text-white">
        {['open', 'in_progress', 'resolved', 'closed'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
       </select>
       <RowAction variant="outline" onClick={() => setOpenTicketId(openTicketId === t.id ? null : t.id)}>Reply</RowAction>
      </div>
      {openTicketId === t.id && (
       <div className="mt-3 flex gap-2">
        <textarea rows={2} value={replyDraft[t.id] || ''} onChange={(e) => setReplyDraft((prev) => ({ ...prev, [t.id]: e.target.value }))}
         placeholder="Type a reply..." className="flex-1 rounded border border-outline-variant bg-white dark:bg-dark-surface px-3 py-2 text-body-sm text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
        <RowAction disabled={isPending && savingId === t.id} onClick={() => sendReply(t.id)}>Send</RowAction>
       </div>
      )}
     </div>
    ))}
    {!visible.length && <p className="py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No tickets in the queue.</p>}
   </div>

   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

// ---------- Finance ----------
function Invoices() {
 const [invoices, setInvoices] = useState([]);
 const [clients, setClients] = useState([]);
 const [loading, setLoading] = useState(true);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ client_id: '', amount: '', tax: '', currency: 'USD', issue_date: '', due_date: '' });
 const [fieldErrors, setFieldErrors] = useState({});
 const [actingId, setActingId] = useState(null);
 const { run: runCreate, isPending: submitting } = useAsyncAction();
 const { run, isPending } = useAsyncAction();

 const load = useCallback(() => {
  setLoading(true);
  Promise.allSettled([fetchInvoices({ page, limit: 20 }), fetchClients({ limit: 100 })]).then(([i, c]) => {
   if (i.status === 'fulfilled') { setInvoices(i.value?.data || []); setTotalPages(i.value?.meta?.total_pages || 1); }
   if (c.status === 'fulfilled') setClients(c.value?.data || []);
  }).finally(() => setLoading(false));
 }, [page]);

 useEffect(() => { load();  }, [load]);

 const clientName = (id) => clients.find((c) => c.id === id)?.company_name || '—';

 const handleCreate = (e) => {
  e.preventDefault();
  const errors = validateNewInvoice(form);
  setFieldErrors(errors);
  if (Object.keys(errors).length > 0) return;
  runCreate(async () => {
   await createInvoice({
    client_id: form.client_id, amount: Number(form.amount), tax: form.tax ? Number(form.tax) : 0,
    currency: form.currency, issue_date: form.issue_date, due_date: form.due_date,
   });
   setForm({ client_id: '', amount: '', tax: '', currency: 'USD', issue_date: '', due_date: '' });
   setFieldErrors({});
   setShowForm(false);
   load();
  });
 };

 const send = (id) => run(async () => {
  setActingId(id);
  try { await updateInvoice(id, { status: 'sent' }); load(); } finally { setActingId(null); }
 });

 const markPaid = (invoice) => run(async () => {
  setActingId(invoice.id);
  try {
   await recordPayment(invoice.id, { amount: invoice.total_amount, method: 'bank_transfer', paid_at: new Date().toISOString(), status: 'completed' });
   load();
  } finally {
   setActingId(null);
  }
 });

 if (loading) return <SkeletonTable rows={6} columns={6} />;
 return (
  <div className="space-y-stack-md">
   <div className="flex justify-end">
    <Button variant="primary" size="md" icon={<Icon name="add" />} onClick={() => setShowForm((v) => !v)}>New Invoice</Button>
   </div>
   {showForm && (
    <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
     <div className="grid gap-4 sm:grid-cols-3">
      <div>
       <select required value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })} className={FORM_INPUT_CLASS}>
        <option value="" disabled>Select client</option>
        {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.id}</option>)}
       </select>
       {fieldErrors.client_id && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.client_id}</p>}
      </div>
      <div>
       <input required type="number" min="0" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={FORM_INPUT_CLASS} />
       {fieldErrors.amount && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.amount}</p>}
      </div>
      <div>
       <input type="number" min="0" placeholder="Tax" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })} className={FORM_INPUT_CLASS} />
       {fieldErrors.tax && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.tax}</p>}
      </div>
      <div>
       <input required type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} className={FORM_INPUT_CLASS} />
       {fieldErrors.issue_date && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.issue_date}</p>}
      </div>
      <div>
       <input required type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={FORM_INPUT_CLASS} />
       {fieldErrors.due_date && <p className="mt-1 flex items-center gap-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.due_date}</p>}
      </div>
      <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={FORM_INPUT_CLASS}>
       {['USD', 'EUR', 'GBP', 'INR'].map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
     </div>
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Creating...' : 'Create Invoice'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setFieldErrors({}); }}>Cancel</Button>
     </div>
    </form>
   )}
   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr><th className="px-stack-lg py-4">Invoice</th><th className="px-stack-lg py-4">Client</th><th className="px-stack-lg py-4">Total</th><th className="px-stack-lg py-4">Due</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Actions</th></tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {invoices.map((inv) => (
       <tr key={inv.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Invoice" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-white">{inv.invoice_number}</td>
        <td data-label="Client" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{clientName(inv.client_id)}</td>
        <td data-label="Total" className="px-stack-lg py-4 text-body-sm text-brand-dark dark:text-white">{inv.currency} {Number(inv.total_amount).toLocaleString()}</td>
        <td data-label="Due" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{inv.due_date}</td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={INVOICE_STATUS_COLOR[inv.status]}>{inv.status}</StatusBadge></td>
        <td data-label="Actions" className="px-stack-lg py-4">
         <div className="flex gap-2">
          {inv.status === 'draft' && <RowAction disabled={isPending && actingId === inv.id} onClick={() => send(inv.id)}>Send</RowAction>}
          {(inv.status === 'sent' || inv.status === 'overdue') && <RowAction disabled={isPending && actingId === inv.id} onClick={() => markPaid(inv)}>Record Payment</RowAction>}
         </div>
        </td>
       </tr>
      ))}
      {!invoices.length && <tr><td data-label="Invoice" colSpan={6} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No invoices yet.</td></tr>}
     </tbody>
    </table>
   </div>

   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}


export { MyTasksBoard, TestQueue, TicketQueue, Invoices };
