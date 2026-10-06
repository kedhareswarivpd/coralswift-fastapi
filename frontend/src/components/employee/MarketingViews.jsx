import { useState, useEffect, useCallback } from 'react';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import RowAction from '../ui/RowAction.jsx';
import Pagination from '../ui/Pagination.jsx';
import { SkeletonTable } from '../ui/Skeleton.jsx';
import useAsyncAction from '../../hooks/useAsyncAction.js';
import { fetchLeads, createLead, fetchContactSubmissions } from '../../api/crm.js';
import {
 fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
} from '../../api/admin.js';
import { validateConvertToLead } from '../../schemas/crm.schema.js';
import { validateNewTestimonial } from '../../schemas/marketing.schema.js';

const LEAD_STATUS_COLOR = { new: 'neutral', contacted: 'info', requirement_gathering: 'info', proposal_created: 'info', proposal_sent: 'warning', proposal_approved: 'success', converted: 'success', disqualified: 'error' };

// Reusable Convert-to-Lead modal (duplicated from SalesCrmViews.jsx rather than
// imported, so this marketing-only chunk doesn't have to pull in the much
// larger sales CRM bundle just for this small form).
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

// ---------- Marketing ----------
function MarketingLeadsView() {
 const [contacts, setContacts] = useState([]);
 const [leads, setLeads] = useState([]);
 const [loading, setLoading] = useState(true);
 const [convertTarget, setConvertTarget] = useState(null);
 const [toast, setToast] = useState({ msg: '', type: 'success' });
 const [activeTab, setActiveTab] = useState('contacts'); // 'contacts' | 'leads'
 const [contactsPage, setContactsPage] = useState(1);
 const [contactsTotalPages, setContactsTotalPages] = useState(1);
 const [leadsPage, setLeadsPage] = useState(1);
 const [leadsTotalPages, setLeadsTotalPages] = useState(1);
 const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 3500); };

 const load = useCallback(() => {
  setLoading(true);
  Promise.allSettled([
   fetchContactSubmissions({ status: 'in_progress', page: contactsPage, limit: 20 }),
   fetchLeads({ page: leadsPage, limit: 20 }),
  ]).then(([cRes, lRes]) => {
   if (cRes.status === 'fulfilled') {
    setContacts(cRes.value?.data || []);
    setContactsTotalPages(cRes.value?.meta?.total_pages || 1);
   }
   if (lRes.status === 'fulfilled') {
    setLeads(lRes.value?.data || []);
    setLeadsTotalPages(lRes.value?.meta?.total_pages || 1);
   }
  }).finally(() => setLoading(false));
 }, [contactsPage, leadsPage]);

 useEffect(() => { load(); }, [load]);

 const handleConverted = async (sub) => {
  setConvertTarget(null);
  showToast(`${sub.name} successfully converted to a CRM lead!`);
  load();
 };

 const inProgressContacts = contacts.filter((c) => c.status === 'in_progress' && !c.lead_id);

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

   {/* Tab switcher */}
   <div className="flex gap-1 border-b border-outline-variant dark:border-dark-outline-variant">
    {[
     { id: 'contacts', label: `Ready to Convert (${inProgressContacts.length})`, icon: 'person_add' },
     { id: 'leads', label: `All Leads (${leads.length})`, icon: 'person_search' },
    ].map((t) => (
     <button key={t.id} onClick={() => setActiveTab(t.id)}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 font-label-caps text-label-caps uppercase transition-colors ${
       activeTab === t.id ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-brand-dark dark:text-dark-ink-muted dark:text-white'
      }`}>
      <Icon name={t.icon} className="text-base" />{t.label}
     </button>
    ))}
   </div>

   {activeTab === 'contacts' && (
    <>
     {!inProgressContacts.length ? (
      <div className="rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-8 text-center dark:border-dark-outline-variant">
       <Icon name="inbox" className="mx-auto mb-3 text-4xl text-ink-muted dark:text-dark-ink-muted" />
       <p className="text-body-md font-semibold text-ink dark:text-white">No contacts ready yet</p>
       <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">When admin marks a contact submission as &ldquo;In Progress&rdquo;, it will appear here for you to convert to a lead.</p>
      </div>
     ) : (
      <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <table className="w-full text-left">
        <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
         <tr><th className="px-stack-lg py-4">Contact</th><th className="px-stack-lg py-4">Subject / Message</th><th className="px-stack-lg py-4">Company</th><th className="px-stack-lg py-4">Date</th><th className="px-stack-lg py-4">Action</th></tr>
        </thead>
        <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
         {inProgressContacts.map((s) => (
          <tr key={s.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
           <td data-label="Contact" className="px-stack-lg py-4">
            <p className="text-body-md font-semibold text-brand-dark dark:text-white">{s.name}</p>
            <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.email}</p>
            {s.phone && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.phone}</p>}
           </td>
           <td data-label="Subject / Message" className="max-w-xs px-stack-lg py-4">
            {s.subject && <p className="text-body-sm font-medium text-ink dark:text-white">{s.subject}</p>}
            <p className="line-clamp-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.message}</p>
           </td>
           <td data-label="Company" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.company || '—'}</td>
           <td data-label="Date" className="px-stack-lg py-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.created_at?.slice(0, 10) || '—'}</td>
           <td data-label="Action" className="px-stack-lg py-4">
            <RowAction onClick={() => setConvertTarget(s)}>Convert to Lead</RowAction>
           </td>
          </tr>
         ))}
        </tbody>
       </table>
       <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
        <Pagination page={contactsPage} totalPages={contactsTotalPages} onChange={setContactsPage} />
       </div>
      </div>
     )}
    </>
   )}

   {activeTab === 'leads' && (
    <div className="responsive-table overflow-x-auto rounded-lg border border-outline-variant bg-surface-container dark:border-dark-outline-variant dark:bg-dark-surface-container">
     <table className="w-full text-left">
      <thead className="bg-surface-container font-label-caps text-label-caps uppercase text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
       <tr><th className="px-stack-lg py-4">Company / Contact</th><th className="px-stack-lg py-4">Source</th><th className="px-stack-lg py-4">Status</th><th className="px-stack-lg py-4">Est. Value</th></tr>
      </thead>
      <tbody className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
       {leads.map((l) => (
        <tr key={l.id} className="transition-colors hover:bg-accent-cyan-pale dark:bg-blue-900/30">
         <td data-label="Company / Contact" className="px-stack-lg py-4">
          <p className="text-body-md font-semibold text-brand-dark dark:text-white">{l.company || '—'}</p>
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{l.contact_name}</p>
         </td>
         <td data-label="Source" className="px-stack-lg py-4 text-body-sm capitalize text-ink-muted dark:text-dark-ink-muted">{l.source?.replace('_', ' ')}</td>
         <td data-label="Status" className="px-stack-lg py-4"><StatusBadge variant={LEAD_STATUS_COLOR[l.status]}>{l.status?.replace('_', ' ')}</StatusBadge></td>
         <td data-label="Est. Value" className="px-stack-lg py-4 text-body-sm text-brand-dark dark:text-white">{l.estimated_value ? `$${Number(l.estimated_value).toLocaleString()}` : '—'}</td>
        </tr>
       ))}
       {!leads.length && <tr><td data-label="Company / Contact" colSpan={4} className="px-stack-lg py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No leads yet — convert a contact to create the first one.</td></tr>}
      </tbody>
     </table>
     <div className="border-t border-outline-variant p-stack-lg dark:border-dark-outline-variant">
      <Pagination page={leadsPage} totalPages={leadsTotalPages} onChange={setLeadsPage} />
     </div>
    </div>
   )}
  </div>
 );
}

function TestimonialModeration() {
 const [items, setItems] = useState([]);
 const [loading, setLoading] = useState(true);
 const [filter, setFilter] = useState('pending');
 const [toast, setToast] = useState('');
 const [showForm, setShowForm] = useState(false);
 const [form, setForm] = useState({ author_name: '', author_title: '', company_name: '', rating: 5, content: '' });
 const [errors, setErrors] = useState({});
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [pendingCount, setPendingCount] = useState(0);
 const [publishedCount, setPublishedCount] = useState(0);
 const { run: runCreate, isPending: creating } = useAsyncAction();
 const { run: runApprove, isPending: approving } = useAsyncAction();
 const { run: runUnpublish, isPending: unpublishing } = useAsyncAction();
 const { run: runRemove, isPending: removing } = useAsyncAction();

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

 const load = useCallback(() => {
  setLoading(true);
  const params = { page, limit: 20 };
  if (filter !== 'all') params.is_published = filter === 'published';
  Promise.allSettled([
   fetchTestimonials(params),
   fetchTestimonials({ limit: 1, is_published: false }),
   fetchTestimonials({ limit: 1, is_published: true }),
  ]).then(([listRes, pendingRes, publishedRes]) => {
   if (listRes.status === 'fulfilled') {
    setItems(listRes.value?.data || []);
    setTotalPages(listRes.value?.meta?.total_pages || 1);
   }
   if (pendingRes.status === 'fulfilled') setPendingCount(pendingRes.value?.meta?.total || 0);
   if (publishedRes.status === 'fulfilled') setPublishedCount(publishedRes.value?.meta?.total || 0);
  }).finally(() => setLoading(false));
 }, [filter, page]);

 useEffect(() => { load(); }, [load]);

 // Changing the moderation filter must not leave the view on a page number
 // that no longer exists in the filtered result set.
 useEffect(() => { setPage(1); }, [filter]);

 const handleCreate = (e) => {
  e.preventDefault();
  const clientErrors = validateNewTestimonial(form);
  if (Object.keys(clientErrors).length > 0) {
   setErrors(clientErrors);
   return;
  }
  setErrors({});
  runCreate(async () => {
   try {
    await createTestimonial({ ...form, is_published: false });
    setForm({ author_name: '', author_title: '', company_name: '', rating: 5, content: '' });
    setShowForm(false);
    showToast('Testimonial created successfully.');
    load();
   } catch (err) {
    showToast(err?.message || 'Failed to create testimonial.');
   }
  });
 };

 const approve = (id) => runApprove(async () => {
  try {
   await updateTestimonial(id, { is_published: true });
   showToast('Testimonial approved and published.');
   load();
  } catch (err) {
   showToast(err?.message || 'Action failed.');
  }
 });

 const unpublish = (id) => runUnpublish(async () => {
  try {
   await updateTestimonial(id, { is_published: false });
   showToast('Testimonial unpublished.');
   load();
  } catch (err) {
   showToast(err?.message || 'Action failed.');
  }
 });

 const remove = (id) => runRemove(async () => {
  try {
   await deleteTestimonial(id);
   showToast('Testimonial deleted.');
   load();
  } catch (err) {
   showToast(err?.message || 'Action failed.');
  }
 });

 const visible = items;
 const actingPending = approving || unpublishing || removing;

 const kpis = [
  { label: 'Pending Moderation', value: pendingCount, icon: 'rate_review' },
  { label: 'Published', value: publishedCount, icon: 'publish' },
  { label: 'Total Reviews', value: pendingCount + publishedCount, icon: 'reviews' },
 ];

 const stars = (rating) => Array.from({ length: 5 }, (_, i) => (
  <Icon key={i} name={i < (rating || 0) ? 'star' : 'star_outline'} className="text-base text-yellow-400" />
 ));

 if (loading) return <SkeletonTable rows={6} columns={3} />;
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

   <div className="flex flex-wrap items-center justify-between gap-3">
    <div className="flex flex-wrap items-center gap-3">
     <span className="font-label-caps text-label-caps uppercase text-brand-dark dark:text-white">Filter:</span>
     {['pending', 'published', 'all'].map((s) => (
      <button key={s} onClick={() => setFilter(s)}
       className={`rounded border px-3 py-1.5 font-label-caps text-label-caps uppercase transition-colors ${
        filter === s ? 'border-brand bg-brand text-white' : 'border-outline-variant text-ink-muted hover:border-brand hover:text-brand dark:border-dark-outline-variant dark:text-dark-ink-muted'
       }`}>{s}</button>
     ))}
    </div>
    <div className="flex items-center gap-3">
     <Button onClick={() => { setShowForm(!showForm); setErrors({}); }} variant="primary" size="md" icon={<Icon name="add" />}>New Testimonial</Button>
     <button onClick={load} className="flex items-center gap-1 font-label-caps text-body-sm uppercase text-brand hover:text-brand-dark dark:text-white">
      <Icon name="refresh" className="text-base" /> Refresh
     </button>
    </div>
   </div>

   {toast && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.includes('success') || toast.includes('published') || toast.includes('deleted')
      ? 'border border-green-200 bg-status-success-bg text-status-success-text'
      : 'border border-status-error/30 bg-red-50 text-red-700'
    }`}>{toast}</p>
   )}

   {showForm && (
    <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
     <div className="grid gap-4 sm:grid-cols-3">
      <div>
       <label className="mb-1 block font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Author Name *</label>
       <input type="text" value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })}
        className={`w-full rounded border bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:outline-none dark:text-white dark:placeholder-white/40 ${errors.author_name ? 'border-status-error focus:border-status-error' : 'border-outline-variant focus:border-brand dark:border-dark-outline-variant'}`}
        placeholder="John Doe" />
       {errors.author_name && <p className="mt-1 text-body-xs text-status-error">{errors.author_name}</p>}
      </div>
      <div>
       <label className="mb-1 block font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Title / Role</label>
       <input type="text" value={form.author_title} onChange={(e) => setForm({ ...form, author_title: e.target.value })}
        className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40"
        placeholder="CEO at Acme Inc." />
      </div>
      <div>
       <label className="mb-1 block font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Company</label>
       <input type="text" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })}
        className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40"
        placeholder="Acme Inc." />
      </div>
     </div>
     <div>
      <label className="mb-1 block font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Rating</label>
      <div className="flex items-center gap-1">
       {[1, 2, 3, 4, 5].map((r) => (
        <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}
         aria-label={`Rate ${r} star${r > 1 ? 's' : ''}`} aria-pressed={r === form.rating} className="cursor-pointer">
         <Icon name={r <= form.rating ? 'star' : 'star_outline'} className="text-2xl text-yellow-400" />
        </button>
       ))}
      </div>
     </div>
     <div>
      <label className="mb-1 block font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Testimonial *</label>
      <textarea rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })}
       className={`w-full rounded border bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:outline-none dark:text-white dark:placeholder-white/40 ${errors.content ? 'border-status-error focus:border-status-error' : 'border-outline-variant focus:border-brand dark:border-dark-outline-variant'}`}
       placeholder="Write the testimonial content..." />
      {errors.content && <p className="mt-1 text-body-xs text-status-error">{errors.content}</p>}
     </div>
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={creating}>{creating ? 'Saving...' : 'Save Testimonial'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => { setShowForm(false); setErrors({}); }}>Cancel</Button>
     </div>
    </form>
   )}

   <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
    {visible.map((t) => (
     <div key={t.id} className="flex flex-col rounded-xl border border-outline-variant bg-white dark:bg-dark-surface p-6 shadow-sm dark:border-dark-outline-variant">
      <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale dark:bg-blue-900/30">
       <Icon name="person" className="text-2xl text-brand" />
      </div>
      <p className="font-display text-body-md font-semibold text-brand-dark dark:text-white">{t.author_name}</p>
      <p className="mt-1 text-body-xs uppercase tracking-wide text-ink-muted dark:text-dark-ink-muted">{t.author_title}{t.company_name ? ` · ${t.company_name}` : ''}</p>
      <div className="mt-2 flex items-center gap-0.5">{stars(t.rating)}</div>
      <p className="mt-2 flex-1 text-body-sm italic text-ink-muted dark:text-dark-ink-muted">&ldquo;{t.content}&rdquo;</p>
      <div className="mt-4 flex items-center justify-between">
       <StatusBadge variant={t.is_published ? 'success' : 'warning'}>{t.is_published ? 'published' : 'pending'}</StatusBadge>
       <div className="flex items-center gap-2">
        {!t.is_published && <RowAction disabled={actingPending} onClick={() => approve(t.id)}>Approve</RowAction>}
        {t.is_published && <RowAction variant="outline" disabled={actingPending} onClick={() => unpublish(t.id)}>Unpublish</RowAction>}
        <RowAction variant="outline" disabled={actingPending} onClick={() => remove(t.id)}>Delete</RowAction>
       </div>
      </div>
     </div>
    ))}
    {!visible.length && <p className="col-span-full py-8 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">No testimonials to show.</p>}
   </div>

   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}


export { MarketingLeadsView, TestimonialModeration };
