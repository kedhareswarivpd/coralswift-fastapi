import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import RowAction from '../ui/RowAction.jsx';
import { SkeletonTable } from '../ui/Skeleton.jsx';
import Pagination from '../ui/Pagination.jsx';
import LeadFlowPage from './LeadFlowPage.jsx';
import useAsyncAction from '../../hooks/useAsyncAction.js';
import { apiRequest } from '../../api/client.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
 createProposal, sendProposal, acceptProposal, rejectProposal,
 createContract, signContract,
 createLead,
 createMeeting, updateMeeting,
} from '../../api/crm.js';
import { validateConvertToLead, validateNewLead, validateNewProposal, validateNewMeeting } from '../../schemas/crm.schema.js';

// Client-side page size for the CRM sub-views whose data arrives as an
// already-fetched props array (see EmployeePortal.jsx's refreshCrm) rather
// than through a paginated endpoint call.
const CLIENT_PAGE_SIZE = 10;

// Extracted from EmployeePortal.jsx (Sonar M5): the Sales CRM sub-views are
// only rendered for the "sales" role, so splitting them into their own
// lazy-loaded chunk keeps that weight out of every other role's download.
const LEAD_SOURCE_OPTIONS = ['website', 'contact_form', 'referral', 'campaign', 'cold_outreach', 'event', 'other'];
const LEAD_STATUS_COLOR = { new: 'neutral', contacted: 'info', requirement_gathering: 'info', proposal_created: 'info', proposal_sent: 'warning', proposal_approved: 'success', converted: 'success', disqualified: 'error' };
const PROPOSAL_STATUS_COLOR = { draft: 'neutral', sent: 'warning', viewed: 'info', accepted: 'success', rejected: 'error' };
const CONTRACT_STATUS_COLOR = { pending: 'warning', signed: 'success', void: 'error' };

function Leads({ leads, onRefresh }) {
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ company: '', contact_name: '', email: '', phone: '', source: 'website', estimated_value: '' });
 const [errors, setErrors] = useState({});
 const [toast, setToast] = useState('');
 const [page, setPage] = useState(1);
 const [openLeadId, setOpenLeadId] = useState(null);
 const { run: runSubmit, isPending: submitting } = useAsyncAction();
 const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md text-brand-dark dark:text-white placeholder-ink-muted dark:placeholder-white/40 bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const totalPages = Math.max(1, Math.ceil(leads.length / CLIENT_PAGE_SIZE));
 const pagedLeads = leads.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

 const handleChange = (field, value) => {
  setForm((prev) => ({ ...prev, [field]: value }));
  if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  const clientErrors = validateNewLead(form);
  if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }
  setErrors({});
  runSubmit(async () => {
   try {
    await createLead({ ...form, estimated_value: form.estimated_value ? Number(form.estimated_value) : null });
    setForm({ company: '', contact_name: '', email: '', phone: '', source: 'website', estimated_value: '' });
    setShowForm(false);
    onRefresh();
    showToast('Lead saved successfully.');
   } catch (err) {
    showToast(err?.message || 'Failed to save lead.');
   }
  });
 };

 if (openLeadId) {
  return <LeadFlowPage leadId={openLeadId} onBack={() => setOpenLeadId(null)} onRefresh={onRefresh} />;
 }

 return (
  <div className="space-y-stack-md">
   <div className="flex justify-end">
    <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>New Lead</Button>
   </div>
   {showForm && (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
     <div className="grid gap-4 sm:grid-cols-2">
      <div>
       <input type="text" placeholder="Company (optional)" value={form.company} onChange={(e) => handleChange('company', e.target.value)} className={inputClass} />
      </div>
      <div>
       <input type="text" placeholder="Contact name *" value={form.contact_name} onChange={(e) => handleChange('contact_name', e.target.value)} className={`${inputClass} ${errors.contact_name ? 'border-status-error' : ''}`} />
       {errors.contact_name && <p className="mt-1 text-body-xs text-status-error">{errors.contact_name}</p>}
      </div>
      <div>
       <input type="email" placeholder="Email *" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className={`${inputClass} ${errors.email ? 'border-status-error' : ''}`} />
       {errors.email && <p className="mt-1 text-body-xs text-status-error">{errors.email}</p>}
      </div>
      <div>
       <input type="text" placeholder="Phone (optional)" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} className={`${inputClass} ${errors.phone ? 'border-status-error' : ''}`} />
       {errors.phone && <p className="mt-1 text-body-xs text-status-error">{errors.phone}</p>}
      </div>
      <select value={form.source} onChange={(e) => handleChange('source', e.target.value)} className={inputClass}>
       {LEAD_SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
      </select>
      <div>
       <input type="number" min="0" placeholder="Estimated value ($)" value={form.estimated_value} onChange={(e) => handleChange('estimated_value', e.target.value)} className={`${inputClass} ${errors.estimated_value ? 'border-status-error' : ''}`} />
       {errors.estimated_value && <p className="mt-1 text-body-xs text-status-error">{errors.estimated_value}</p>}
      </div>
     </div>
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Saving...' : 'Save Lead'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
     </div>
    </form>
   )}
   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('successfully') ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text' : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast}</p>
   )}
   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr><th className="px-stack-lg py-4">Company / Contact</th><th className="px-stack-lg py-4">Email</th><th className="px-stack-lg py-4">Source</th><th className="px-stack-lg py-4">Est. Value</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Open</th></tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {pagedLeads.map((l) => (
       <tr key={l.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
         <td data-label="Company / Contact" className="px-stack-lg py-4">
         <p className="text-body-md font-semibold text-brand-dark dark:text-white">{l.company || '—'}</p>
         <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.contact_name}</p>
        </td>
        <td data-label="Email" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.email}</td>
        <td data-label="Source" className="px-stack-lg py-4 text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted">{l.source?.replace('_', ' ')}</td>
        <td data-label="Est. Value" className="px-stack-lg py-4 text-body-sm text-brand-dark dark:text-white">{l.estimated_value ? `$${Number(l.estimated_value).toLocaleString()}` : '—'}</td>
        <td data-label="Status" className="px-stack-lg py-4">
         <StatusBadge variant={LEAD_STATUS_COLOR[l.status]}>{l.status?.replace('_', ' ')}</StatusBadge>
        </td>
        <td data-label="Open" className="px-stack-lg py-4">
         <RowAction onClick={() => setOpenLeadId(l.id)}>Open</RowAction>
        </td>
       </tr>
      ))}
      {!leads.length && (
       <tr><td data-label="Company / Contact" colSpan={6} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No leads yet.</td></tr>
      )}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

// ---------- Sales: Contact Submissions view (mirrors marketing's view but for sales) ----------
function ContactSubmissionsView({ onLeadCreated }) {
 const [submissions, setSubmissions] = useState([]);
 const [loading, setLoading] = useState(true);
 const [convertTarget, setConvertTarget] = useState(null);
 const [toast, setToast] = useState({ msg: '', type: 'success' });
 const [actingId, setActingId] = useState(null);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const { run, isPending } = useAsyncAction();
 const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 3500); };

 const load = useCallback(() => {
  setLoading(true);
  apiRequest(`/contact?page=${page}&limit=20`)
   .then((r) => { setSubmissions(r?.data || []); setTotalPages(r?.meta?.total_pages || 1); })
   .catch(() => {})
   .finally(() => setLoading(false));
 }, [page]);

 useEffect(() => { load(); }, [load]);

 const updateStatus = (id, status) => run(async () => {
  setActingId(id);
  try {
   await apiRequest(`/contact/${id}`, { method: 'PATCH', body: { status } });
   showToast(`Marked as ${status.replace('_', ' ')}`);
   load();
  } catch { showToast('Failed to update status', 'error'); }
  finally { setActingId(null); }
 });

 const handleConverted = async (sub) => {
  setConvertTarget(null);
  showToast(`${sub.name} converted to lead!`);
  try { await apiRequest(`/contact/${sub.id}`, { method: 'PATCH', body: { status: 'in_progress' } }); } catch { /* non-critical */ }
  load();
  onLeadCreated?.();
 };

 const statusColor = { new: 'neutral', in_progress: 'info', resolved: 'success', spam: 'error' };

 if (loading) return <SkeletonTable rows={6} columns={5} />;
 return (
  <div className="space-y-stack-md">
   {toast.msg && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.type === 'success' ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text' : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast.msg}</p>
   )}
   {convertTarget && (
    <SalesConvertModal
     submission={convertTarget}
     onClose={() => setConvertTarget(null)}
     onSuccess={() => handleConverted(convertTarget)}
    />
   )}
   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr><th className="px-stack-lg py-4">Contact</th><th className="px-stack-lg py-4">Subject</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Date</th><th className="px-stack-lg py-4">Actions</th></tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {submissions.map((s) => (
       <tr key={s.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Contact" className="px-stack-lg py-4">
         <p className="text-body-md font-semibold text-brand-dark dark:text-white">{s.name}</p>
         <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.email}</p>
         {s.company && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.company}</p>}
        </td>
        <td data-label="Subject" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.subject || '—'}</td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={statusColor[s.status] || 'neutral'}>{s.status?.replace('_', ' ')}</StatusBadge></td>
        <td data-label="Date" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.created_at?.slice(0, 10) || '—'}</td>
        <td data-label="Actions" className="px-stack-lg py-4">
         <div className="flex flex-col gap-1">
          {s.lead_id && s.status !== 'spam' && s.status !== 'resolved' && (
           <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Lead created</span>
          )}
          {!s.lead_id && s.status === 'in_progress' && (
           <RowAction onClick={() => setConvertTarget(s)}>Convert to Lead</RowAction>
          )}
          {s.status === 'new' && (
           <RowAction variant="outline" disabled={isPending && actingId === s.id} onClick={() => updateStatus(s.id, 'in_progress')}>
            {isPending && actingId === s.id ? 'Updating...' : 'Mark In Progress'}
           </RowAction>
          )}
          {s.status !== 'resolved' && s.status !== 'spam' && (
           <RowAction variant="outline" disabled={isPending && actingId === s.id} onClick={() => updateStatus(s.id, 'resolved')}>
            {isPending && actingId === s.id ? 'Updating...' : 'Resolve'}
           </RowAction>
          )}
         </div>
        </td>
       </tr>
      ))}
      {!submissions.length && <tr><td data-label="Contact" colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No contact submissions yet.</td></tr>}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

// Reusable Convert-to-Lead modal (shared by Sales and Marketing views)
function SalesConvertModal({ submission, onClose, onSuccess }) {
 const [estimatedValue, setEstimatedValue] = useState('');
 const [notes, setNotes] = useState(submission.message || '');
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending } = useAsyncAction();
 const inputClass = 'w-full rounded border border-outline-variant dark:border-dark-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark dark:text-white placeholder-ink-muted dark:placeholder-white/40 focus:border-brand focus:outline-none';

 const handleSubmit = (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateConvertToLead({ estimatedValue, notes });
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  run(async () => {
   try {
    await createLead({
     contact_name: submission.name,
     email: submission.email,
     phone: submission.phone || null,
     company: submission.company || null,
     source: 'contact_form',
     contact_submission_id: submission.id,
     estimated_value: estimatedValue ? Number(estimatedValue) : null,
     notes: notes || null,
    });
    onSuccess();
   } catch (err) {
    setError(err.message || 'Could not convert to lead. Please try again.');
   }
  });
 };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && onClose()}>
   <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl bg-white dark:bg-dark-surface p-6 shadow-2xl">
    <div className="mb-5 flex items-start justify-between">
     <div>
      <h2 className="font-display text-headline-sm font-bold text-brand-dark dark:text-white">Convert to Lead</h2>
      <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">Create a CRM lead from this contact submission</p>
     </div>
     <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink dark:text-dark-ink-muted dark:text-white"><Icon name="close" className="text-xl" /></button>
    </div>
    <div className="mb-5 space-y-1 rounded-lg bg-surface-container p-4 dark:bg-dark-surface-container">
     <p className="text-body-sm font-semibold text-brand-dark dark:text-white">{submission.name}</p>
     <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{submission.email}</p>
     {submission.phone && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{submission.phone}</p>}
     {submission.company && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{submission.company}</p>}
     {submission.subject && <p className="text-body-sm italic text-ink-muted dark:text-dark-ink-muted">{submission.subject}</p>}
    </div>
    <form onSubmit={handleSubmit} className="space-y-4">
     <div>
      <label className="mb-1 block text-body-sm font-medium text-ink dark:text-white">Estimated Value (USD)</label>
      <input type="number" min="0" step="0.01" placeholder="e.g. 5000" value={estimatedValue}
       onChange={(e) => setEstimatedValue(e.target.value)} className={inputClass} />
      {fieldErrors.estimatedValue && <p className="mt-1 text-body-xs text-status-error">{fieldErrors.estimatedValue}</p>}
     </div>
     <div>
      <label className="mb-1 block text-body-sm font-medium text-ink dark:text-white">Notes</label>
      <textarea rows={3} placeholder="Internal notes about this lead..." value={notes}
       onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} />
      {fieldErrors.notes && <p className="mt-1 text-body-xs text-status-error">{fieldErrors.notes}</p>}
     </div>
     {error && <p className="text-body-sm text-status-error">{error}</p>}
     <div className="flex gap-3 pt-1">
      <Button type="submit" variant="primary" size="md" disabled={isPending} className="flex-1">
       {isPending ? 'Converting...' : 'Convert to Lead'}
      </Button>
      <Button type="button" variant="outline" size="md" onClick={onClose}>Cancel</Button>
     </div>
    </form>
   </div>
  </div>
 );
}

function Proposals({ proposals, leads, contracts = [], onRefresh, onNavigateTab }) {
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ lead_id: '', scope_summary: '', price: '', currency: 'USD' });
 const [errors, setErrors] = useState({});
 const [actingId, setActingId] = useState(null);
 const [toast, setToast] = useState({ msg: '', type: 'success' });
 const [page, setPage] = useState(1);
 const [viewProposal, setViewProposal] = useState(null);
 const { run: runSubmit, isPending: submitting } = useAsyncAction();
 const { run: runRowAction, isPending: rowActionPending } = useAsyncAction();
 const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 3500); };
 const inputClass = 'border border-outline-variant dark:border-dark-outline-variant rounded px-4 py-3 text-body-md text-brand-dark dark:text-white placeholder-ink-muted dark:placeholder-white/40 bg-white dark:bg-dark-surface focus:outline-none focus:border-brand';

 const totalPages = Math.max(1, Math.ceil(proposals.length / CLIENT_PAGE_SIZE));
 const pagedProposals = proposals.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

 const leadLabel = (leadId) => {
  const lead = leads.find((l) => l.id === leadId);
  return lead ? (lead.company || lead.contact_name) : 'Unknown lead';
 };

 const handleChange = (field, value) => {
  setForm((prev) => ({ ...prev, [field]: value }));
  if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  const clientErrors = validateNewProposal(form);
  if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }
  setErrors({});
  runSubmit(async () => {
   await createProposal({ ...form, price: Number(form.price) });
   setForm({ lead_id: '', scope_summary: '', price: '', currency: 'USD' });
   setShowForm(false);
   onRefresh();
  });
 };

 const runAction = (action, proposalId, successMsg) => runRowAction(async () => {
  setActingId(proposalId);
  try {
   await action(proposalId);
   showToast(successMsg || 'Done!');
   onRefresh();
  } catch (err) {
   showToast(err?.message || 'Action failed. Please try again.', 'error');
  } finally {
   setActingId(null);
  }
 });

 return (
  <div className="space-y-stack-md">
   {toast.msg && <p className={`rounded-lg px-4 py-2 text-body-sm ${toast.type === 'success' ? 'bg-green-100 text-status-success-text' : 'bg-red-100 text-red-800'}`}>{toast.msg}</p>}
   <div className="flex justify-end">
    <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>New Proposal</Button>
   </div>
   {showForm && (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
     <div className="grid gap-4 sm:grid-cols-3">
      <div>
       <select value={form.lead_id} onChange={(e) => handleChange('lead_id', e.target.value)} className={`${inputClass} ${errors.lead_id ? 'border-status-error' : ''}`}>
        <option value="" disabled>Select lead *</option>
        {leads.map((l) => <option key={l.id} value={l.id}>{l.company || l.contact_name}</option>)}
       </select>
       {errors.lead_id && <p className="mt-1 text-body-xs text-status-error">{errors.lead_id}</p>}
      </div>
      <div>
       <input type="number" min="0" placeholder="Price *" value={form.price} onChange={(e) => handleChange('price', e.target.value)} className={`${inputClass} ${errors.price ? 'border-status-error' : ''}`} />
       {errors.price && <p className="mt-1 text-body-xs text-status-error">{errors.price}</p>}
      </div>
      <select value={form.currency} onChange={(e) => handleChange('currency', e.target.value)} className={inputClass}>
       {['USD', 'EUR', 'GBP', 'INR'].map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
     </div>
     <div>
      <textarea placeholder="Scope summary *" value={form.scope_summary} onChange={(e) => handleChange('scope_summary', e.target.value)} rows={3} className={`w-full ${inputClass} ${errors.scope_summary ? 'border-status-error' : ''}`} />
      {errors.scope_summary && <p className="mt-1 text-body-xs text-status-error">{errors.scope_summary}</p>}
     </div>
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Saving...' : 'Save Draft'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
     </div>
    </form>
   )}
   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr><th className="px-stack-lg py-4">Lead</th><th className="px-stack-lg py-4">Price</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Sent</th><th className="px-stack-lg py-4">View</th><th className="px-stack-lg py-4">Actions</th></tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {pagedProposals.map((p) => (
       <tr key={p.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Lead" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-white">{leadLabel(p.lead_id)}</td>
        <td data-label="Price" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.currency} {Number(p.price).toLocaleString()}</td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={PROPOSAL_STATUS_COLOR[p.status]}>{p.status}</StatusBadge></td>
        <td data-label="Sent" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{p.sent_at ? p.sent_at.slice(0, 10) : '—'}</td>
        <td data-label="View" className="px-stack-lg py-4">
         <button type="button" aria-label="View proposal" onClick={() => setViewProposal(p)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-accent-cyan-pale hover:text-brand-dark dark:text-dark-ink-muted dark:hover:bg-blue-900/30 dark:hover:text-white">
          <Icon name="visibility" className="text-lg" />
         </button>
        </td>
        <td data-label="Actions" className="px-stack-lg py-4">
         <div className="flex gap-2">
          {p.status === 'draft' && <RowAction disabled={rowActionPending && actingId === p.id} onClick={() => runAction(sendProposal, p.id, 'Proposal sent to client!')}>Send</RowAction>}
          {(p.status === 'sent' || p.status === 'viewed') && (
           <>
            <RowAction disabled={rowActionPending && actingId === p.id} onClick={() => runAction(acceptProposal, p.id, 'Proposal accepted — generate a contract!')}>Accept</RowAction>
            <RowAction variant="outline" disabled={rowActionPending && actingId === p.id} onClick={() => runAction(rejectProposal, p.id, 'Proposal marked as rejected.')}>Reject</RowAction>
           </>
          )}
          {p.status === 'accepted' && (
           contracts.some((c) => c.proposal_id === p.id) ? (
            <RowAction variant="outline" onClick={() => onNavigateTab?.('contracts')}>
             View in Contracts →
            </RowAction>
           ) : (
            <RowAction disabled={rowActionPending && actingId === p.id} onClick={() => runAction(createContract, p.id, 'Contract generated — go to Contracts tab to sign!')}>
             Generate Contract
            </RowAction>
           )
          )}
         </div>
        </td>
       </tr>
      ))}
      {!proposals.length && (
       <tr><td data-label="Lead" colSpan={6} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No proposals yet.</td></tr>
      )}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
   {viewProposal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setViewProposal(null)}>
     <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-dark-surface-container">
      <div className="mb-5 flex items-start justify-between">
       <div>
        <h2 className="font-display text-headline-sm font-bold text-brand-dark dark:text-white">Proposal v{viewProposal.version}</h2>
        <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">{leadLabel(viewProposal.lead_id)}</p>
       </div>
       <button onClick={() => setViewProposal(null)} aria-label="Close" className="text-ink-muted hover:text-ink dark:text-dark-ink-muted dark:text-white"><Icon name="close" className="text-xl" /></button>
      </div>
      <div className="space-y-4">
       <div className="flex items-center gap-2">
        <StatusBadge variant={PROPOSAL_STATUS_COLOR[viewProposal.status]}>{viewProposal.status}</StatusBadge>
        <span className="text-body-md font-semibold text-brand-dark dark:text-white">{viewProposal.currency} {Number(viewProposal.price).toLocaleString()}</span>
       </div>
       <div>
        <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Scope Summary</p>
        <p className="mt-1 whitespace-pre-wrap text-body-sm text-brand-dark dark:text-white">{viewProposal.scope_summary}</p>
       </div>
       <div className="grid grid-cols-2 gap-4 text-body-sm">
        <div>
         <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Sent</p>
         <p className="text-brand-dark dark:text-white">{viewProposal.sent_at ? new Date(viewProposal.sent_at).toLocaleString() : '—'}</p>
        </div>
        <div>
         <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Viewed by client</p>
         <p className="text-brand-dark dark:text-white">{viewProposal.viewed_at ? new Date(viewProposal.viewed_at).toLocaleString() : '—'}</p>
        </div>
       </div>
       {viewProposal.client_comment && (
        <div>
         <p className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Client Comment</p>
         <p className="mt-1 text-body-sm text-brand-dark dark:text-white">{viewProposal.client_comment}</p>
        </div>
       )}
       {viewProposal.rejection_reason && (
        <div>
         <p className="font-label-caps text-label-caps uppercase text-status-error">Rejection Reason</p>
         <p className="mt-1 text-body-sm text-red-800">{viewProposal.rejection_reason}</p>
        </div>
       )}
       <div className="flex justify-end pt-1">
        <Button type="button" variant="outline" size="md" onClick={() => setViewProposal(null)}>Close</Button>
       </div>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}

function Contracts({ contracts, proposals, leads, onRefresh }) {
 const [actingId, setActingId] = useState(null);
 const [confirmId, setConfirmId] = useState(null);
 const [toast, setToast] = useState({ msg: '', type: 'success' });
 const [page, setPage] = useState(1);
 const { run, isPending } = useAsyncAction();
 const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 4000); };

 const totalPages = Math.max(1, Math.ceil(contracts.length / CLIENT_PAGE_SIZE));
 const pagedContracts = contracts.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

 const describe = (proposalId) => {
  const proposal = proposals.find((p) => p.id === proposalId);
  if (!proposal) return 'Unknown deal';
  const lead = leads.find((l) => l.id === proposal.lead_id);
  return `${lead ? (lead.company || lead.contact_name) : 'Unknown lead'} — ${proposal.currency} ${Number(proposal.price).toLocaleString()}`;
 };

 const handleSign = (contractId) => run(async () => {
  setConfirmId(null);
  setActingId(contractId);
  try {
   await signContract(contractId, { client_signed: true, company_signed: true, provision_client_account: true });
   showToast('Contract signed! Client account has been provisioned and a welcome email was sent.');
   onRefresh();
  } catch (err) {
   showToast(err?.message || 'Signing failed. Please try again.', 'error');
  } finally {
   setActingId(null);
  }
 });

 return (
  <div className="space-y-stack-md">
   {toast.msg && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.type === 'success' ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text' : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast.msg}</p>
   )}

   {/* Sign confirmation dialog */}
   {confirmId && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
     <div className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white dark:bg-dark-surface p-6 shadow-2xl">
      <h3 className="mb-2 font-display text-headline-sm font-bold text-brand-dark dark:text-white">Confirm Contract Signing</h3>
      <p className="mb-1 text-body-sm text-ink dark:text-white">This will:</p>
      <ul className="mb-5 ml-4 list-disc space-y-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">
       <li>Mark the contract as fully signed</li>
       <li>Set the lead status to <strong>Converted</strong></li>
       <li>Provision a client portal account (sends welcome email)</li>
       <li>Notify the project manager to start onboarding</li>
      </ul>
      <div className="flex gap-3">
       <Button variant="primary" size="md" onClick={() => handleSign(confirmId)} className="flex-1">Yes, Sign &amp; Provision</Button>
       <Button variant="outline" size="md" onClick={() => setConfirmId(null)}>Cancel</Button>
      </div>
     </div>
    </div>
   )}

   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr><th className="px-stack-lg py-4">Deal</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Client Signed</th><th className="px-stack-lg py-4">Company Signed</th><th className="px-stack-lg py-4">Actions</th></tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {pagedContracts.map((c) => (
       <tr key={c.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Deal" className="px-stack-lg py-4 text-body-md text-brand-dark dark:text-white">{describe(c.proposal_id)}</td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={CONTRACT_STATUS_COLOR[c.status]}>{c.status}</StatusBadge></td>
        <td data-label="Client Signed" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.signed_by_client_at ? c.signed_by_client_at.slice(0, 10) : '—'}</td>
        <td data-label="Company Signed" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.signed_by_company_at ? c.signed_by_company_at.slice(0, 10) : '—'}</td>
        <td data-label="Actions" className="px-stack-lg py-4">
         {c.status === 'pending' && (
          <RowAction disabled={isPending && actingId === c.id} onClick={() => setConfirmId(c.id)}>
           {isPending && actingId === c.id ? 'Signing...' : 'Mark Signed'}
          </RowAction>
         )}
         {c.status === 'signed' && <span className="text-body-sm font-medium text-status-success-text">✓ Signed</span>}
        </td>
       </tr>
      ))}
      {!contracts.length && (
       <tr><td data-label="Deal" colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No contracts yet — generate one from an accepted proposal.</td></tr>
      )}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

const LEAD_FUNNEL_STAGES = [
 { label: 'New', value: 'new', color: '#6366f1' },
 { label: 'Contacted', value: 'contacted', color: '#8b5cf6' },
 { label: 'Qualified', value: 'requirement_gathering', color: '#3b82f6' },
 { label: 'Proposal Created', value: 'proposal_created', color: '#0ea5e9' },
 { label: 'Proposal Sent', value: 'proposal_sent', color: '#f59e0b' },
 { label: 'Proposal Approved', value: 'proposal_approved', color: '#10b981' },
 { label: 'Won', value: 'converted', color: '#059669' },
 { label: 'Lost', value: 'disqualified', color: '#ef4444' },
];

const PIPELINE_ACTIVE_STATUSES = ['new', 'contacted', 'requirement_gathering', 'proposal_created', 'proposal_sent', 'proposal_approved'];

function CrmDashboard({ leads, proposals, contracts }) {
 const openLeads = leads.filter((l) => PIPELINE_ACTIVE_STATUSES.includes(l.status)).length;
 const proposalsSent = proposals.filter((p) => ['sent', 'viewed'].includes(p.status)).length;
 const pipelineValue = leads
  .filter((l) => PIPELINE_ACTIVE_STATUSES.includes(l.status))
  .reduce((sum, l) => sum + Number(l.estimated_value || 0), 0);
 const signedContracts = contracts.filter((c) => c.status === 'signed').length;
 const winRate = proposals.length ? Math.round((signedContracts / proposals.length) * 100) : 0;

 const funnelData = LEAD_FUNNEL_STAGES.map((stage) => ({
  stage: stage.label,
  count: leads.filter((l) => l.status === stage.value).length,
  fill: stage.color,
 }));

 const recentActivity = (() => {
  const items = [];
  leads.forEach((l) => {
   if (l.status === 'proposal_sent' && l.converted_client_id) return;
   if (PIPELINE_ACTIVE_STATUSES.includes(l.status)) {
    items.push({
     type: 'lead',
     text: `Lead "${l.company || l.contact_name}" is in ${l.status.replace('_', ' ')} stage`,
     time: l.created_at,
    });
   }
  });
  proposals.forEach((p) => {
   if (p.status === 'accepted') {
    const lead = leads.find((l) => l.id === p.lead_id);
    items.push({
     type: 'proposal',
     text: `Proposal accepted by ${lead ? (lead.company || lead.contact_name) : 'unknown'}`,
     time: p.sent_at || p.created_at,
    });
   }
  });
  contracts.forEach((c) => {
   if (c.status === 'signed') {
    items.push({
     type: 'contract',
     text: `Contract signed (proposal ${c.proposal_id})`,
     time: c.signed_by_company_at || c.signed_by_client_at,
    });
   }
  });
  return items
   .filter((i) => i.time)
   .sort((a, b) => new Date(b.time) - new Date(a.time))
   .slice(0, 8);
 })();

 const timeAgo = (ts) => {
  const mins = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
 };

 const kpis = [
  { label: 'Open Leads', value: openLeads, icon: 'person_search' },
  { label: 'Proposals Sent', value: proposalsSent, icon: 'request_quote' },
  { label: 'Pipeline Value', value: `$${pipelineValue.toLocaleString()}`, icon: 'attach_money' },
  { label: 'Win Rate', value: `${winRate}%`, icon: 'trending_up' },
 ];

 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
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

   <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
    <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-white">Pipeline Funnel</h3>
    <div className="h-72">
     <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={funnelData} margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
       <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
       <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
       <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: '#64748b' }} />
       <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
       <Bar dataKey="count" radius={[0, 4, 4, 0]}>
        {funnelData.map((entry, index) => (
         <Cell key={`cell-${index}`} fill={entry.fill} />
        ))}
       </Bar>
      </BarChart>
     </ResponsiveContainer>
    </div>
   </div>

   <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
    <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-white">Recent Activity</h3>
    {recentActivity.length === 0 ? (
     <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">No recent activity to show.</p>
    ) : (
     <ul className="space-y-3">
      {recentActivity.map((activity, i) => (
       <li key={i} className="flex items-start gap-3 border-b border-outline-variant/50 pb-2 last:border-0 last:pb-0 dark:border-dark-outline-variant/50">
        <div className="mt-0.5 flex-shrink-0">
         <Icon name={activity.type === 'lead' ? 'person_search' : activity.type === 'proposal' ? 'request_quote' : 'gavel'}
          className="text-lg text-brand" />
        </div>
        <div className="flex-1">
         <p className="text-body-sm text-brand-dark dark:text-white">{activity.text}</p>
         <p className="text-body-xs text-ink-muted dark:text-dark-ink-muted">{timeAgo(activity.time)}</p>
        </div>
       </li>
      ))}
     </ul>
    )}
   </div>
  </div>
 );
}

function SalesClients({ clients }) {
 const [searchTerm, setSearchTerm] = useState('');
 const [industryFilter, setIndustryFilter] = useState('');
 const [page, setPage] = useState(1);

 const industries = [...new Set(clients.map((c) => c.industry).filter(Boolean))];
 const filtered = useMemo(() => clients.filter((c) => {
  const matchesSearch = !searchTerm ||
   (c.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
   (c.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase());
  const matchesIndustry = !industryFilter || c.industry === industryFilter;
  return matchesSearch && matchesIndustry;
 }), [clients, searchTerm, industryFilter]);

 // Search/filter changing must not leave pagination on a page number that
 // no longer exists in the filtered result set.
 useEffect(() => { setPage(1); }, [searchTerm, industryFilter]);

 const totalPages = Math.max(1, Math.ceil(filtered.length / CLIENT_PAGE_SIZE));
 const pagedClients = filtered.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);

 const statusColor = { active: 'success', inactive: 'neutral', on_hold: 'warning' };

 return (
  <div className="space-y-stack-md">
   <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div className="relative flex-1">
     <input type="text" placeholder="Search clients..." value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-2.5 pl-10 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
     <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-ink-muted dark:text-dark-ink-muted" />
    </div>
    <select value={industryFilter} onChange={(e) => setIndustryFilter(e.target.value)}
     className="rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-2.5 text-body-md text-brand-dark focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white">
     <option value="">All Industries</option>
     {industries.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
    </select>
   </div>
   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr>
       <th className="px-stack-lg py-4">Company</th>
       <th className="px-stack-lg py-4">Contact</th>
       <th className="px-stack-lg py-4">Industry</th>
       <th className="px-stack-lg py-4">Account Manager</th>
       <th className="px-stack-lg py-4">Status</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {pagedClients.map((c) => (
       <tr key={c.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Company" className="px-stack-lg py-4 text-body-md font-semibold text-brand-dark dark:text-white">{c.company_name || '—'}</td>
        <td data-label="Contact" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.contact_name || c.company_name || '—'}</td>
        <td data-label="Industry" className="px-stack-lg py-4 text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted">{c.industry?.replace('_', ' ') || '—'}</td>
        <td data-label="Account Manager" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.account_manager_id ? c.account_manager_id : 'Unassigned'}</td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={statusColor[c.status] || 'neutral'}>{c.status || 'active'}</StatusBadge></td>
       </tr>
      ))}
      {!filtered.length && (
       <tr><td data-label="Company" colSpan={5} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No clients found.</td></tr>
      )}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

const MEETING_STATUS_COLOR = { scheduled: 'info', completed: 'success', cancelled: 'error' };

function SalesMeetings({ meetings, clients, onRefresh }) {
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ title: '', client_id: '', scheduled_at: '', duration_minutes: 30, meeting_link: '' });
 const [errors, setErrors] = useState({});
 const [actingId, setActingId] = useState(null);
 const [toast, setToast] = useState('');
 const [page, setPage] = useState(1);
 const [recapId, setRecapId] = useState(null);
 const [recapForm, setRecapForm] = useState({ notes: '', recording_url: '' });
 const { run: runSubmit, isPending: submitting } = useAsyncAction();
 const { run: runRowAction, isPending: rowActionPending } = useAsyncAction();
 const { run: runRecap, isPending: recapPending } = useAsyncAction();

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const totalPages = Math.max(1, Math.ceil(meetings.length / CLIENT_PAGE_SIZE));
 const pagedMeetings = meetings.slice((page - 1) * CLIENT_PAGE_SIZE, page * CLIENT_PAGE_SIZE);
 useEffect(() => { if (page > totalPages) setPage(totalPages); }, [totalPages, page]);

 const clientName = (id) => {
  if (!id) return '—';
  const client = clients.find((c) => c.id === id);
  return client ? (client.company_name || '—') : id;
 };

 const handleCreate = (e) => {
  e.preventDefault();
  const clientErrors = validateNewMeeting(form);
  if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }
  setErrors({});
  runSubmit(async () => {
   try {
    const payload = {
     ...form,
     scheduled_at: form.scheduled_at,
     duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : 30,
     client_id: form.client_id || undefined,
    };
    await createMeeting(payload);
    setForm({ title: '', client_id: '', scheduled_at: '', duration_minutes: 30, meeting_link: '' });
    setShowForm(false);
    onRefresh();
    showToast('Meeting scheduled successfully.');
   } catch (err) {
    showToast(err?.message || 'Failed to schedule meeting.');
   }
  });
 };

 const handleComplete = (meetingId) => runRowAction(async () => {
  setActingId(meetingId);
  try {
   await updateMeeting(meetingId, { status: 'completed' });
   onRefresh();
  } catch (err) {
   showToast(err?.message || 'Action failed.');
  } finally {
   setActingId(null);
  }
 });

 const handleCancel = (meetingId) => runRowAction(async () => {
  setActingId(meetingId);
  try {
   await updateMeeting(meetingId, { status: 'cancelled' });
   onRefresh();
  } catch (err) {
   showToast(err?.message || 'Action failed.');
  } finally {
   setActingId(null);
  }
 });

 const openRecap = (m) => {
  setRecapId(m.id);
  setRecapForm({ notes: m.notes || '', recording_url: m.recording_url || '' });
 };

 const handleSaveRecap = (meetingId) => runRecap(async () => {
  try {
   await updateMeeting(meetingId, { notes: recapForm.notes || null, recording_url: recapForm.recording_url || null });
   setRecapId(null);
   onRefresh();
   showToast('Meeting notes saved.');
  } catch (err) {
   showToast(err?.message || 'Could not save meeting notes.');
  }
 });

 const now = new Date().toISOString().slice(0, 16);
 const upcoming = meetings.filter((m) => m.status === 'scheduled' && new Date(m.scheduled_at) >= new Date(now));

 return (
  <div className="space-y-stack-md">
   <div className="flex items-center justify-between">
    <div>
     <h3 className="font-display text-headline-sm text-brand-dark dark:text-white">Meetings & Demos</h3>
     <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{upcoming.length} upcoming</p>
    </div>
    <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>
     New Meeting
    </Button>
   </div>

   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('success') || toast.includes('scheduled')
      ? 'bg-status-success-bg0/10 border border-green-500/30 text-status-success-text'
      : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast}</p>
   )}

   {showForm && (
    <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
     <div className="grid gap-4 sm:grid-cols-2">
      <div>
       <input type="text" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
        className={`w-full rounded border bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:outline-none dark:text-white dark:placeholder-white/40 ${errors.title ? 'border-status-error focus:border-status-error' : 'border-outline-variant focus:border-brand dark:border-dark-outline-variant'}`} />
       {errors.title && <p className="mt-1 text-body-xs text-status-error">{errors.title}</p>}
      </div>
      <select value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}
       className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white">
       <option value="">Select client (optional)</option>
       {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name || c.id}</option>)}
      </select>
      <div>
       <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
        className={`w-full rounded border bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:outline-none dark:text-white dark:placeholder-white/40 ${errors.scheduled_at ? 'border-status-error focus:border-status-error' : 'border-outline-variant focus:border-brand dark:border-dark-outline-variant'}`} />
       {errors.scheduled_at && <p className="mt-1 text-body-xs text-status-error">{errors.scheduled_at}</p>}
      </div>
      <input type="number" min="15" max="240" step="15" placeholder="Duration (minutes)" value={form.duration_minutes}
       onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
       className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
     </div>
     <input type="url" placeholder="Meeting link / location" value={form.meeting_link} onChange={(e) => setForm({ ...form, meeting_link: e.target.value })}
      className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Scheduling...' : 'Schedule'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
     </div>
    </form>
   )}

   <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <table className="w-full text-left">
     <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
      <tr>
       <th className="px-stack-lg py-4">Title</th>
       <th className="px-stack-lg py-4">Client / Lead</th>
       <th className="px-stack-lg py-4">Date & Time</th>
       <th className="px-stack-lg py-4">Duration</th>
       <th className="px-stack-lg py-4">Status</th>
       <th className="px-stack-lg py-4">Actions</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
      {pagedMeetings.map((m) => (
       <Fragment key={m.id}>
       <tr className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
        <td data-label="Title" className="px-stack-lg py-4 text-body-md font-semibold text-brand-dark dark:text-white">{m.title}</td>
        <td data-label="Client / Lead" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{m.client_id ? clientName(m.client_id) : '—'}</td>
        <td data-label="Date & Time" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{m.scheduled_at ? new Date(m.scheduled_at).toLocaleString() : '—'}</td>
        <td data-label="Duration" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{m.duration_minutes}m</td>
        <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={MEETING_STATUS_COLOR[m.status]}>{m.status}</StatusBadge></td>
        <td data-label="Actions" className="px-stack-lg py-4">
         <div className="flex gap-2">
          {m.status === 'scheduled' && new Date(m.scheduled_at) >= new Date(now) && (
           <>
            <RowAction disabled={rowActionPending && actingId === m.id} onClick={() => handleComplete(m.id)}>Complete</RowAction>
            <RowAction variant="outline" disabled={rowActionPending && actingId === m.id} onClick={() => handleCancel(m.id)}>Cancel</RowAction>
           </>
          )}
          {m.status === 'completed' && (
           <RowAction variant="outline" onClick={() => openRecap(m)}>
            {m.notes || m.recording_url ? 'Edit Notes/Recording' : 'Add Notes/Recording'}
           </RowAction>
          )}
         </div>
        </td>
       </tr>
       {recapId === m.id && (
        <tr>
         <td colSpan={6} className="bg-surface-container px-stack-lg py-4 dark:bg-dark-surface-container">
          <div className="space-y-3">
           <textarea placeholder="Meeting notes (visible to the client)" value={recapForm.notes}
            onChange={(e) => setRecapForm({ ...recapForm, notes: e.target.value })} rows={3}
            className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
           <input type="url" placeholder="Recording URL (optional)" value={recapForm.recording_url}
            onChange={(e) => setRecapForm({ ...recapForm, recording_url: e.target.value })}
            className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
           <div className="flex gap-2">
            <Button size="md" variant="primary" disabled={recapPending} onClick={() => handleSaveRecap(m.id)}>
             {recapPending ? 'Saving...' : 'Save'}
            </Button>
            <Button size="md" variant="outline" onClick={() => setRecapId(null)}>Cancel</Button>
           </div>
          </div>
         </td>
        </tr>
       )}
       </Fragment>
      ))}
      {!meetings.length && (
       <tr><td data-label="Title" colSpan={6} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No meetings scheduled yet.</td></tr>
      )}
     </tbody>
    </table>
   </div>
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function SalesReports({ leads, proposals, contracts }) {
 const PIPELINE_STAGES = ['new', 'contacted', 'requirement_gathering', 'proposal_sent', 'proposal_approved', 'converted', 'disqualified'];

 const pipelineValueData = PIPELINE_STAGES.filter((s) => s !== 'disqualified').map((stage) => {
  const stageLeads = leads.filter((l) => l.status === stage);
  const value = stageLeads.reduce((sum, l) => sum + Number(l.estimated_value || 0), 0);
  return {
   stage: stage.replace('_', ' '),
   value: value,
   count: stageLeads.length,
   fill: stage === 'converted' ? '#10b981' : stage === 'disqualified' ? '#ef4444' : stage === 'proposal_sent' ? '#f59e0b' : stage === 'proposal_approved' ? '#3b82f6' : '#6366f1',
  };
 }).filter((s) => s.count > 0);

 const sourceCounts = {};
 leads.forEach((l) => {
  const src = l.source || 'other';
  sourceCounts[src] = (sourceCounts[src] || 0) + 1;
 });
 const sourceData = Object.entries(sourceCounts).map(([name, value]) => ({
  name: name.replace('_', ' '),
  value,
 }));

 const SOURCES_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
 const funnelData = [
  { stage: 'Leads', count: leads.length },
  { stage: 'Proposals', count: proposals.length },
  { stage: 'Contracts', count: contracts.length },
  { stage: 'Won', count: contracts.filter((c) => c.status === 'signed').length },
 ];

 const totalValue = pipelineValueData.reduce((sum, s) => sum + s.value, 0);
 const conversionRate = leads.length ? Math.round((contracts.filter((c) => c.status === 'signed').length / leads.length) * 100) : 0;

 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
    {[
     { label: 'Total Leads', value: leads.length, icon: 'person_search' },
     { label: 'Total Proposals', value: proposals.length, icon: 'request_quote' },
     { label: 'Signed Contracts', value: contracts.filter((c) => c.status === 'signed').length, icon: 'gavel' },
     { label: 'Conversion Rate', value: `${conversionRate}%`, icon: 'trending_up' },
    ].map((stat) => (
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
    <h3 className="mb-2 font-display text-headline-sm text-brand-dark dark:text-white">Pipeline Value by Stage</h3>
    <p className="mb-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">Total pipeline: ${totalValue.toLocaleString()}</p>
    {pipelineValueData.length === 0 ? (
     <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">No pipeline data available.</p>
    ) : (
     <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
       <BarChart data={pipelineValueData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} angle={-45} textAnchor="end" height={70} />
        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} formatter={(value) => [`$${value}`, 'Value']} />
        <Bar dataKey="value" name="Pipeline Value" radius={[4, 4, 0, 0]} />
       </BarChart>
      </ResponsiveContainer>
     </div>
    )}
   </div>

   <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
    <h3 className="mb-2 font-display text-headline-sm text-brand-dark dark:text-white">Lead Source Attribution</h3>
    {sourceData.length === 0 ? (
     <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">No source data available.</p>
    ) : (
     <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
       <PieChart>
        <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={90} innerRadius={50} label>
         {sourceData.map((_, i) => <Cell key={`cell-${i}`} fill={SOURCES_COLORS[i % SOURCES_COLORS.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
        <Legend layout="horizontal" verticalAlign="bottom" align="middle" iconSize={10} />
       </PieChart>
      </ResponsiveContainer>
     </div>
    )}
   </div>

   <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
    <h3 className="mb-2 font-display text-headline-sm text-brand-dark dark:text-white">Conversion Funnel</h3>
    <p className="mb-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">Leads → Proposals → Contracts → Won</p>
    <div className="h-52">
     <ResponsiveContainer width="100%" height="100%">
      <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
       <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
       <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
       <YAxis dataKey="stage" type="category" tick={{ fontSize: 12, fill: '#64748b' }} />
       <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
       <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
      </BarChart>
     </ResponsiveContainer>
    </div>
   </div>
  </div>
 );
}


export { CrmDashboard, ContactSubmissionsView, Leads, SalesClients, Proposals, Contracts, SalesMeetings, SalesReports };
