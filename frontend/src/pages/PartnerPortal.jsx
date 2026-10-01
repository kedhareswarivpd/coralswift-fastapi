import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import { SkeletonTable } from '../components/ui/Skeleton.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import { PortalTable } from '../components/ui/ResponsiveTable.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRoleGuard } from '../hooks/useRoleGuard.js';
import useAsyncAction from '../hooks/useAsyncAction.js';
import { useAuth } from '../context/AuthContext.jsx';
import { partnerPortalTabs } from '../data/portal.js';
import { fetchMyProfile, fetchMyFiles, fetchMyTickets, createTicket as createTicketApi } from '../api/partnerAccounts.js';
import { validateNewTicket } from '../schemas/client.schema.js';

const STATUS_VARIANTS = {
 open: 'info', in_progress: 'info', resolved: 'success', closed: 'neutral',
};

const formClass = 'w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink';

// The /partner-accounts/me/* endpoints these tables read from are
// self-service list routes capped at SELF_SERVICE_LIST_CAP (500) — not
// page_params-paginated, so there's no server-side page/limit/meta.total_pages
// contract to use. Each table below instead paginates client-side.
const PAGE_SIZE = 10;

function usePagedRows(rows) {
 const [page, setPage] = useState(1);
 const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
 useEffect(() => { if (page > totalPages) setPage(1); }, [rows.length, totalPages, page]);
 const start = (page - 1) * PAGE_SIZE;
 const pageRows = rows.slice(start, start + PAGE_SIZE);
 return { page, setPage, totalPages, pageRows };
}

// ─── Data normalizers (map backend schema → portal UI shape) ─────────────────
const normalizeProfile = (p) => ({
 company_name: p?.company_name || '', contact_name: p?.contact_name || '', email: p?.email || '',
 partnership_type: p?.partnership_type || '', industry: p?.industry || '', country: p?.country || '', website: p?.website || '',
});
const normalizeFile = (f) => ({
 id: f.id, name: f.name, category: f.category, file_url: f.file_url,
 size: f.size_bytes ? `${(f.size_bytes / 1024).toFixed(0)} KB` : '—',
 uploadedOn: f.created_at ? new Date(f.created_at).toLocaleDateString() : '—',
});
const normalizeFiles = (arr) => (Array.isArray(arr) ? arr.map(normalizeFile) : []);
const normalizeTicket = (t) => ({
 id: t.id, subject: t.subject, status: t.status, priority: t.priority,
 createdAt: t.created_at ? new Date(t.created_at).toLocaleDateString() : '—',
});
const normalizeTickets = (arr) => (Array.isArray(arr) ? arr.map(normalizeTicket) : []);

// ─── Overview ──────────────────────────────────────────────────────────────
function Overview({ profile, files, tickets }) {
 const stats = [
  { label: 'Shared Files', value: files.length, icon: 'folder_open' },
  { label: 'Open Tickets', value: tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length, icon: 'support' },
 ];
 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-4">
    {stats.map((s) => (
     <div key={s.label} className="rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-brand/10 text-brand"><Icon name={s.icon} /></div>
      <p className="text-stat-md font-stat text-brand-dark dark:text-dark-brand">{s.value}</p>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.label}</p>
     </div>
    ))}
   </div>
   <div className="rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
    <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Profile</h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
     <div><p className="text-body-sm text-ink-muted">Company</p><p className="font-semibold text-ink dark:text-white">{profile.company_name || '—'}</p></div>
     <div><p className="text-body-sm text-ink-muted">Contact</p><p className="font-semibold text-ink dark:text-white">{profile.contact_name || '—'}</p></div>
     <div><p className="text-body-sm text-ink-muted">Email</p><p className="font-semibold text-ink dark:text-white">{profile.email || '—'}</p></div>
     <div><p className="text-body-sm text-ink-muted">Partnership Type</p><p className="font-semibold text-ink dark:text-white">{profile.partnership_type || '—'}</p></div>
     <div><p className="text-body-sm text-ink-muted">Industry</p><p className="font-semibold text-ink dark:text-white">{profile.industry || '—'}</p></div>
     <div><p className="text-body-sm text-ink-muted">Country</p><p className="font-semibold text-ink dark:text-white">{profile.country || '—'}</p></div>
    </div>
   </div>
  </div>
 );
}

// ─── Files ─────────────────────────────────────────────────────────────────
function Files({ files }) {
 const { page, setPage, totalPages, pageRows } = usePagedRows(files);
 const columns = [
  {
   key: 'name', label: 'Name',
   render: (_v, f) => <div className="flex items-center gap-2"><Icon name="description" className="text-lg text-brand" />{f.name}</div>,
  },
  { key: 'category', label: 'Category', render: (v) => <Badge className="text-label-caps">{v}</Badge> },
  { key: 'size', label: 'Size', className: 'text-body-md text-ink-muted dark:text-white' },
  { key: 'uploadedOn', label: 'Uploaded', className: 'text-body-md text-ink-muted dark:text-white' },
  {
   key: 'actions', label: '',
   render: (_v, f) => f.file_url && (
    <a href={f.file_url} target="_blank" rel="noreferrer" aria-label={`Open ${f.name}`} className="text-brand hover:text-brand-dark" title="Open file">
     <Icon name="open_in_new" className="text-xl" />
    </a>
   ),
  },
 ];
 return (
  <div className="space-y-stack-md">
   <PortalTable columns={columns} rows={pageRows} emptyMessage="No files yet. Shared files will appear here." />
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

// ─── Tickets ───────────────────────────────────────────────────────────────
function Tickets({ tickets, onNewTicket }) {
 const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
 const [showForm, setShowForm] = useState(false);
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending } = useAsyncAction();
 const { page, setPage, totalPages, pageRows } = usePagedRows(tickets);

 const handleSubmit = (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateNewTicket(newTicket);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  run(async () => {
   try {
    await onNewTicket(newTicket.subject, newTicket.description);
    setNewTicket({ subject: '', description: '' });
    setShowForm(false);
   } catch (err) {
    setError(err?.message || 'Could not submit the ticket. Please try again.');
   }
  });
 };

 return (
  <div className="space-y-stack-md">
   <div className="flex justify-end">
    <Button onClick={() => setShowForm(!showForm)} variant="primary" size="md" icon={<Icon name="add" />}>New Ticket</Button>
   </div>
   {showForm && (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
     {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
     <div>
      <input type="text" placeholder="Subject" value={newTicket.subject}
       onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} className={formClass} />
      {fieldErrors.subject && <p className="mt-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.subject}</p>}
     </div>
     <div>
      <textarea placeholder="Describe your request..." value={newTicket.description}
       onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })} rows={3} className={formClass} />
      {fieldErrors.description && <p className="mt-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.description}</p>}
     </div>
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={isPending}>{isPending ? 'Submitting...' : 'Submit'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
     </div>
    </form>
   )}
   <PortalTable
    columns={[
     { key: 'subject', label: 'Subject', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
     { key: 'priority', label: 'Priority', render: (v) => <Badge className="text-label-caps">{v}</Badge> },
     { key: 'createdAt', label: 'Created', className: 'text-body-md text-ink-muted dark:text-white' },
     { key: 'status', label: 'Status', render: (v) => <StatusBadge variant={STATUS_VARIANTS[v] || 'neutral'}>{v}</StatusBadge> },
    ]}
    rows={pageRows}
    emptyMessage="No tickets yet. Submit a ticket to get support."
   />
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

export default function PartnerPortal() {
 useDocumentTitle('Partner Portal | CoralSwift Technologies');
 const { user, initializing, logout } = useAuth();
 const { denied } = useRoleGuard('partner', '/login');
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('overview');
 const [loading, setLoading] = useState(true);
 const initialLoadDone = useRef(false);
 const [profile, setProfile] = useState({ contact_name: '', email: '', company_name: '' });
 const [files, setFiles] = useState([]);
 const [tickets, setTickets] = useState([]);

 useEffect(() => {
  if (!user) { setLoading(false); return; }
  if (!initialLoadDone.current) setLoading(true);
  Promise.allSettled([
   fetchMyProfile().then((res) => res?.data),
   fetchMyFiles().then((res) => res?.data),
   fetchMyTickets().then((res) => res?.data),
  ]).then(([p, f, t]) => {
   if (p.status === 'fulfilled' && p.value) setProfile(normalizeProfile(p.value));
   if (f.status === 'fulfilled' && f.value) setFiles(normalizeFiles(f.value));
   if (t.status === 'fulfilled' && t.value) setTickets(normalizeTickets(t.value));
  }).finally(() => { initialLoadDone.current = true; setLoading(false); });
 }, [user]);

 const handleNewTicket = async (subject, description) => {
  if (!user) return;
  const res = await createTicketApi({ subject, description: description || subject, priority: 'medium' });
  const d = res?.data;
  if (d) setTickets((prev) => [normalizeTicket(d), ...prev]);
 };

 // useRoleGuard already redirects both the unauthenticated case (to
 // /login?returnTo=..., preserving destination) and the wrong-role case —
 // this gate just withholds rendering while that redirect is in flight.
 if (initializing || !user || denied) return <div className="bg-surface py-section-padding dark:bg-dark-surface"><LoadingSpinner /></div>;
 if (loading) return <div className="bg-surface py-section-padding dark:bg-dark-surface"><SkeletonTable rows={6} columns={4} /></div>;

  return (
   <div className="flex h-dvh flex-col bg-surface dark:bg-dark-surface">
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-outline-variant bg-white px-4 py-3 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface sm:gap-4 sm:px-6 lg:px-10 xl:px-12">
     <div className="flex min-w-0 items-center gap-3 sm:gap-4">
      <img src="/logo-icon.png" alt="CoralSwift Emblem" className="h-9 w-auto shrink-0 object-contain" />
      <div className="hidden h-7 w-px bg-outline-variant sm:block dark:bg-dark-outline-variant" />
      <Avatar name={profile.contact_name || 'Partner'} size="md" />
      <div className="min-w-0">
       <h1 className="max-w-[40vw] truncate font-display text-headline-sm font-bold text-brand-dark sm:max-w-none dark:text-white">{profile.contact_name || 'Partner'}</h1>
       <p className="hidden truncate text-body-sm text-ink-muted sm:block dark:text-dark-ink-muted">{profile.email || ''} &middot; <span className="font-semibold text-brand">{profile.company_name}</span></p>
      </div>
     </div>
     <Button variant="primary" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
      Sign Out
     </Button>
    </div>

   <div className="flex min-h-0 flex-1">
    <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-outline-variant bg-white md:block dark:border-dark-outline-variant dark:bg-dark-surface">
     <nav aria-label="Portal navigation" className="flex flex-col gap-1.5 p-3">
      {partnerPortalTabs.map((tab) => (
       <button key={tab.id} onClick={() => setActiveTab(tab.id)}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-label-caps text-label-caps uppercase transition-all ${
         activeTab === tab.id ? 'bg-brand font-bold text-white shadow-sm' : 'font-semibold text-ink-muted hover:bg-brand/10 hover:text-brand dark:text-dark-ink-muted dark:hover:bg-dark-surface-container dark:hover:text-dark-brand'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </nav>
    </aside>

    <div className="flex min-h-0 flex-1 flex-col">
     <Tabs
      tabs={partnerPortalTabs.map((tab) => ({ key: tab.id, label: tab.label, icon: <Icon name={tab.icon} className="text-lg" /> }))}
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

     <div className="min-w-0 flex-1 overflow-y-auto bg-surface px-4 py-stack-lg sm:px-6 lg:px-10 xl:px-12 dark:bg-dark-surface">
      {activeTab === 'overview' && <Overview profile={profile} files={files} tickets={tickets} />}
      {activeTab === 'files' && <Files files={files} />}
      {activeTab === 'tickets' && <Tickets tickets={tickets} onNewTicket={handleNewTicket} />}
     </div>
    </div>
   </div>
  </div>
 );
}
