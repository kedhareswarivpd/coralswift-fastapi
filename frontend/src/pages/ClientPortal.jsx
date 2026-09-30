import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Avatar from '../components/ui/Avatar.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import Button from '../components/ui/Button.jsx';
import LoadingSpinner from '../components/ui/LoadingSpinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { PortalTable } from '../components/ui/ResponsiveTable.jsx';
import { SkeletonTable } from '../components/ui/Skeleton.jsx';
import Pagination from '../components/ui/Pagination.jsx';
import Tabs from '../components/ui/Tabs.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { useRoleGuard } from '../hooks/useRoleGuard.js';
import useAsyncAction from '../hooks/useAsyncAction.js';
import { useAuth } from '../context/AuthContext.jsx';
import { clientPortalTabs } from '../data/portal.js';
import {
 fetchMyProfile, fetchMyProjects, fetchMyInvoices, fetchMyTickets, fetchMyPayments, fetchMyMeetings, fetchMyFiles, fetchMyReports,
 fetchMyProposals, acceptMyProposal, rejectMyProposal, createTicket as createTicketApi, fetchMyContracts,
 fetchMyProjectUpdates, fetchMyProjectMilestones, fetchMyProjectDeliverables,
 reviewDeliverable, approveProjectDelivery, requestProjectChanges,
} from '../api/clients.js';
import { validateNewTicket } from '../schemas/client.schema.js';

// The /clients/me/* endpoints these tables read from are self-service list
// routes capped at SELF_SERVICE_LIST_CAP (500) — not page_params-paginated,
// so there's no server-side page/limit/meta.total_pages contract to use.
// Each table below instead paginates the already-loaded array client-side.
const PAGE_SIZE = 10;

function usePagedRows(rows) {
 const [page, setPage] = useState(1);
 const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
 useEffect(() => { if (page > totalPages) setPage(1); }, [rows.length, totalPages, page]);
 const start = (page - 1) * PAGE_SIZE;
 const pageRows = rows.slice(start, start + PAGE_SIZE);
 return { page, setPage, totalPages, pageRows };
}

const STATUS_VARIANTS = {
 in_progress: 'info', completed: 'success', planning: 'warning', on_hold: 'neutral',
 paid: 'success', pending: 'warning', overdue: 'error', sent: 'info', draft: 'neutral',
 open: 'info', resolved: 'success', closed: 'neutral', cancelled: 'error',
 upcoming: 'info', accepted: 'success', rejected: 'error',
 project: 'info', financial: 'warning', annual: 'neutral',
};

function Overview({ profile, projects, invoices, tickets }) {
 const activeProjects = projects.filter((p) => p.status === 'in_progress').length;
 return (
  <div className="space-y-stack-lg">
   <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
    {[
     { label: 'Active Projects', value: activeProjects, icon: 'folder' },
     { label: 'Open Invoices', value: invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').length, icon: 'receipt' },
     { label: 'Open Tickets', value: tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length, icon: 'support' },
     { label: 'Total Spend', value: `$${(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0) / 1000).toFixed(0)}K`, icon: 'payments' },
    ].map((stat) => (
     <div key={stat.label} className="flex flex-col rounded-xl border border-outline-variant bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent-cyan-pale">
       <Icon name={stat.icon} className="text-2xl text-brand" />
      </div>
      <p className="font-stat text-3xl font-bold text-brand-dark dark:text-white">{stat.value}</p>
      <p className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-white">{stat.label}</p>
     </div>
    ))}
   </div>
   <div className="rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface">
    <h3 className="mb-4 font-display text-headline-sm font-bold text-brand-dark dark:text-white">Profile</h3>
    <div className="grid gap-4 sm:grid-cols-2">
     {[
      { label: 'Company', value: profile.company_name },
      { label: 'Contact', value: profile.contact_name },
      { label: 'Email', value: profile.email },
      { label: 'Country', value: profile.country },
      { label: 'Industry', value: profile.industry },
     ].map((f) => (
      <div key={f.label}>
       <span className="font-label-caps text-label-caps font-semibold text-ink-muted dark:text-white">{f.label}</span>
       <p className="text-body-md font-semibold text-brand-dark dark:text-white">{f.value || '—'}</p>
      </div>
     ))}
    </div>
   </div>
  </div>
 );
}

function ProjectDetail({ project, onBack, onProjectUpdate }) {
 const [milestones, setMilestones] = useState([]);
 const [deliverables, setDeliverables] = useState([]);
 const [updates, setUpdates] = useState([]);
 const [loading, setLoading] = useState(true);
 const [actionError, setActionError] = useState('');
 const [changeReason, setChangeReason] = useState('');
 const [showChangeForm, setShowChangeForm] = useState(false);
 const { run, isPending } = useAsyncAction();

 useEffect(() => {
  setLoading(true);
  Promise.allSettled([
   fetchMyProjectMilestones(project.id).then(r => r?.data ?? []),
   fetchMyProjectDeliverables(project.id).then(r => r?.data ?? []),
   fetchMyProjectUpdates(project.id).then(r => r?.data ?? []),
  ]).then(([m, d, u]) => {
   if (m.status === 'fulfilled') setMilestones(m.value);
   if (d.status === 'fulfilled') setDeliverables(d.value);
   if (u.status === 'fulfilled') setUpdates(u.value);
  }).finally(() => setLoading(false));
 }, [project.id]);

 const handleReviewDeliverable = (deliverableId, approved, comment) => run(async () => {
  setActionError('');
  try {
   const res = await reviewDeliverable(project.id, deliverableId, { approved, client_comment: comment || null });
   if (res?.data) setDeliverables(prev => prev.map(d => d.id === deliverableId ? res.data : d));
  } catch (err) { setActionError(err?.message || 'Could not submit review.'); }
 });

 const handleApproveDelivery = () => run(async () => {
  setActionError('');
  try {
   const res = await approveProjectDelivery(project.id);
   if (res?.data && onProjectUpdate) onProjectUpdate(res.data);
  } catch (err) { setActionError(err?.message || 'Could not approve delivery.'); }
 });

 const handleRequestChanges = () => run(async () => {
  setActionError('');
  try {
   const res = await requestProjectChanges(project.id, changeReason);
   if (res?.data && onProjectUpdate) onProjectUpdate(res.data);
   setShowChangeForm(false);
  } catch (err) { setActionError(err?.message || 'Could not submit change request.'); }
 });

 const cardClass = 'rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface';

 return (
  <div className="space-y-stack-lg">
   <div className="flex items-center gap-3">
    <button onClick={onBack} className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-2 text-body-sm font-semibold text-ink-muted hover:bg-surface-container dark:border-dark-outline-variant dark:text-dark-ink-muted dark:hover:bg-dark-surface-container">
     <Icon name="arrow_back" className="text-base" /> Back
    </button>
    <div className="flex-1">
     <h2 className="font-display text-headline-sm font-bold text-brand-dark dark:text-white">{project.title}</h2>
     <div className="mt-1 flex flex-wrap items-center gap-3">
      <StatusBadge variant={STATUS_VARIANTS[project.status] || 'neutral'}>{project.status?.replace('_', ' ')}</StatusBadge>
      <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{project.progress}% complete</span>
      {project.deadline && project.deadline !== '—' && <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Due {project.deadline}</span>}
     </div>
    </div>
   </div>

   {/* Progress bar */}
   <div className={cardClass}>
    <div className="flex items-center justify-between mb-2">
     <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Overall Progress</span>
     <span className="font-stat text-2xl font-bold text-brand-dark dark:text-white">{project.progress}%</span>
    </div>
    <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container dark:bg-dark-surface-container">
     <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${project.progress}%` }} />
    </div>
   </div>

   {/* Final delivery approval panel */}
   {project.client_review_status === 'pending' && (
    <div className="rounded-xl border-2 border-brand bg-brand/5 p-6">
     <div className="flex items-start gap-3">
      <Icon name="task_alt" className="mt-0.5 text-2xl text-brand" />
      <div className="flex-1">
       <h3 className="font-display text-headline-sm font-bold text-brand-dark dark:text-white">Project Ready for Your Approval</h3>
       <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">The team has completed this project and submitted it for your final sign-off. Please review the deliverables below, then approve or request changes.</p>
       {actionError && <p className="mt-2 flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{actionError}</p>}
       {!showChangeForm && (
        <div className="mt-4 flex flex-wrap gap-3">
         <Button onClick={handleApproveDelivery} disabled={isPending} variant="primary" size="md" icon={<Icon name="check_circle" />}>
          {isPending ? 'Approving...' : 'Approve Delivery'}
         </Button>
         <Button onClick={() => setShowChangeForm(true)} disabled={isPending} variant="outline" size="md" icon={<Icon name="edit" />}>
          Request Changes
         </Button>
        </div>
       )}
       {showChangeForm && (
        <div className="mt-4 flex flex-col gap-2">
         <textarea
          value={changeReason} onChange={e => setChangeReason(e.target.value)} rows={3}
          placeholder="Describe what needs to be changed (optional)..."
          className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink"
         />
         <div className="flex gap-2">
          <Button onClick={handleRequestChanges} disabled={isPending} variant="primary" size="md">{isPending ? 'Submitting...' : 'Submit Change Request'}</Button>
          <Button onClick={() => setShowChangeForm(false)} disabled={isPending} variant="outline" size="md">Cancel</Button>
         </div>
        </div>
       )}
      </div>
     </div>
    </div>
   )}

   {project.client_review_status === 'approved' && (
    <div className="rounded-xl border border-status-success-border bg-status-success-bg p-4">
     <div className="flex items-center gap-2 text-status-success-text">
      <Icon name="verified" className="text-xl" />
      <span className="font-semibold">You approved the final delivery of this project.</span>
     </div>
    </div>
   )}

   {project.client_review_status === 'changes_requested' && (
    <div className="rounded-xl border border-status-warning-border bg-status-warning-bg p-4">
     <div className="flex items-center gap-2 text-status-warning-text">
      <Icon name="pending" className="text-xl" />
      <span className="font-semibold">Change request submitted — the team will follow up.</span>
     </div>
    </div>
   )}

   {loading ? <SkeletonTable rows={4} columns={3} /> : (
    <>
     {/* Milestones */}
     <div className={cardClass}>
      <h3 className="mb-4 font-display text-headline-sm font-bold text-brand-dark dark:text-white flex items-center gap-2"><Icon name="flag" className="text-brand" />Milestones</h3>
      {milestones.length === 0
       ? <EmptyState icon="flag" title="No milestones yet" description="Project milestones will appear here." />
       : (
        <div className="space-y-3">
         {milestones.map(m => (
          <div key={m.id} className="flex items-center gap-4 rounded-lg border border-outline-variant p-4 dark:border-dark-outline-variant">
           <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${m.status === 'completed' ? 'bg-status-success-bg' : 'bg-surface-container dark:bg-dark-surface-container'}`}>
            <Icon name={m.status === 'completed' ? 'check' : 'radio_button_unchecked'} className={`text-base ${m.status === 'completed' ? 'text-status-success-text' : 'text-ink-muted'}`} />
           </div>
           <div className="flex-1">
            <p className="font-semibold text-brand-dark dark:text-white">{m.title}</p>
            {m.due_date && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Due {m.due_date}</p>}
           </div>
           <StatusBadge variant={m.status === 'completed' ? 'success' : 'warning'}>{m.status}</StatusBadge>
          </div>
         ))}
        </div>
       )}
     </div>

     {/* Deliverables */}
     <div className={cardClass}>
      <h3 className="mb-4 font-display text-headline-sm font-bold text-brand-dark dark:text-white flex items-center gap-2"><Icon name="inventory_2" className="text-brand" />Deliverables</h3>
      {deliverables.length === 0
       ? <EmptyState icon="inventory_2" title="No deliverables shared yet" description="Deliverables shared by the team will appear here for your review." />
       : (
        <div className="space-y-4">
         {deliverables.map(d => (
          <DeliverableCard key={d.id} deliverable={d} projectId={project.id} onReview={handleReviewDeliverable} isPending={isPending} />
         ))}
        </div>
       )}
     </div>

     {/* Progress updates */}
     <div className={cardClass}>
      <h3 className="mb-4 font-display text-headline-sm font-bold text-brand-dark dark:text-white flex items-center gap-2"><Icon name="update" className="text-brand" />Progress Updates</h3>
      {updates.length === 0
       ? <EmptyState icon="update" title="No updates yet" description="Team progress updates will appear here." />
       : (
        <div className="space-y-3">
         {updates.map(u => (
          <div key={u.id} className="rounded-lg border border-outline-variant p-4 dark:border-dark-outline-variant">
           <div className="flex items-start justify-between gap-2">
            <p className="text-body-md text-ink dark:text-dark-ink">{u.update_text}</p>
            <span className="shrink-0 text-body-sm text-ink-muted dark:text-dark-ink-muted">{u.created_at?.slice(0, 10)}</span>
           </div>
           {u.author_name && <p className="mt-1 text-body-sm font-semibold text-brand dark:text-dark-brand">{u.author_name}</p>}
          </div>
         ))}
        </div>
       )}
     </div>
    </>
   )}
  </div>
 );
}

function DeliverableCard({ deliverable: d, onReview, isPending }) {
 const [showRejectForm, setShowRejectForm] = useState(false);
 const [comment, setComment] = useState('');

 return (
  <div className="rounded-lg border border-outline-variant p-4 dark:border-dark-outline-variant">
   <div className="flex flex-wrap items-start justify-between gap-2">
    <div>
     <p className="font-semibold text-brand-dark dark:text-white">{d.title}</p>
     {d.description && <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">{d.description}</p>}
     {d.client_comment && <p className="mt-2 rounded bg-surface-container px-3 py-2 text-body-sm text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">Your comment: {d.client_comment}</p>}
    </div>
    <StatusBadge variant={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'error' : 'info'}>{d.status}</StatusBadge>
   </div>
   {d.file_url && (
    <a href={d.file_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-body-sm font-semibold text-brand hover:underline">
     <Icon name="description" className="text-base" /> View file
    </a>
   )}
   {d.status === 'submitted' && (
    <div className="mt-3">
     {!showRejectForm
      ? (
       <div className="flex flex-wrap gap-2">
        <Button onClick={() => onReview(d.id, true, null)} disabled={isPending} variant="primary" size="md" icon={<Icon name="thumb_up" />}>Approve</Button>
        <Button onClick={() => setShowRejectForm(true)} disabled={isPending} variant="outline" size="md" icon={<Icon name="thumb_down" />}>Request Revision</Button>
       </div>
      )
      : (
       <div className="flex flex-col gap-2">
        <textarea
         value={comment} onChange={e => setComment(e.target.value)} rows={2}
         placeholder="What needs to be revised? (optional)"
         className="w-full rounded border border-outline-variant bg-white px-4 py-2 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink"
        />
        <div className="flex gap-2">
         <Button onClick={() => { onReview(d.id, false, comment); setShowRejectForm(false); setComment(''); }} disabled={isPending} variant="primary" size="md">Submit</Button>
         <Button onClick={() => setShowRejectForm(false)} disabled={isPending} variant="outline" size="md">Cancel</Button>
        </div>
       </div>
      )
     }
    </div>
   )}
  </div>
 );
}

function Projects({ projects, onSelectProject }) {
 const { page, setPage, totalPages, pageRows } = usePagedRows(projects);
 if (projects.length === 0) {
  return (
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
    <EmptyState icon="folder" title="No projects yet" description="Your projects will appear here." />
   </div>
  );
 }
 return (
  <div className="space-y-stack-md">
  <PortalTable
   columns={[
    { key: 'title', label: 'Project', className: 'font-body text-body-md text-brand-dark dark:text-dark-brand' },
    {
     key: 'progress', label: 'Progress',
     render: (_val, row) => (
      <div className="flex items-center gap-3">
       <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-container dark:bg-dark-surface-container">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${row.progress}%` }} />
       </div>
       <span className="text-body-sm text-ink-muted dark:text-white">{row.progress}%</span>
      </div>
     ),
    },
    { key: 'deadline', label: 'Deadline', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'budget', label: 'Budget', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
    {
     key: 'status', label: 'Status',
     render: (val) => <StatusBadge variant={STATUS_VARIANTS[val] || 'neutral'}>{val.replace('_', ' ')}</StatusBadge>,
    },
    {
     key: 'id', label: '',
     render: (_val, row) => (
      <button
       onClick={() => onSelectProject(row)}
       className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-body-sm font-semibold text-brand hover:bg-brand/10 dark:hover:bg-dark-brand/10"
      >
       <Icon name="open_in_new" className="text-base" /> View
      </button>
     ),
    },
   ]}
   rows={pageRows}
  />
  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function ProposalCard({ proposal, contract, onAccept, onReject }) {
 const { run, isPending } = useAsyncAction();
 const [showRejectForm, setShowRejectForm] = useState(false);
 const [reason, setReason] = useState('');
 const [error, setError] = useState('');
 const isSent = proposal.status === 'sent';

 const handleAccept = () => run(async () => {
  setError('');
  try {
   await onAccept(proposal.id);
  } catch (err) {
   setError(err?.message || 'Could not accept the proposal. Please try again.');
  }
 });

 const handleReject = () => run(async () => {
  setError('');
  try {
   await onReject(proposal.id, reason);
   setShowRejectForm(false);
   setReason('');
  } catch (err) {
   setError(err?.message || 'Could not reject the proposal. Please try again.');
  }
 });

 return (
  <div className="rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="flex flex-wrap items-start justify-between gap-3">
    <div>
     <div className="flex items-center gap-2">
      <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">Proposal v{proposal.version}</h3>
      <StatusBadge variant={STATUS_VARIANTS[proposal.status] || 'neutral'}>{proposal.status}</StatusBadge>
     </div>
     <p className="mt-1 text-body-sm text-ink-muted dark:text-dark-ink-muted">Sent {proposal.sentAt || '—'}</p>
    </div>
    <p className="font-stat text-2xl font-bold text-brand-dark dark:text-white">${proposal.price.toLocaleString()}</p>
   </div>
   <p className="mt-4 whitespace-pre-line text-body-md text-ink-muted dark:text-dark-ink-muted">{proposal.scopeSummary}</p>
   {proposal.fileUrl && (
    <a href={proposal.fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-body-sm font-semibold text-brand hover:underline">
     <Icon name="description" className="text-base" /> View full proposal document
    </a>
   )}
   {proposal.rejectionReason && (
    <p className="mt-3 rounded bg-status-error-bg p-3 text-body-sm text-status-error-text">Rejection reason: {proposal.rejectionReason}</p>
   )}
   {contract && (
    <div className="mt-4 rounded-lg border border-outline-variant bg-surface-container p-4 dark:border-dark-outline-variant dark:bg-dark-surface-container">
     <div className="flex items-center gap-2">
      <Icon name="gavel" className="text-base text-brand" />
      <span className="text-body-sm font-semibold text-brand-dark dark:text-white">Contract</span>
      <StatusBadge variant={contract.status === 'signed' ? 'success' : 'warning'}>{contract.status}</StatusBadge>
     </div>
     <div className="mt-2 grid grid-cols-2 gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
      <span>Signed by us: {contract.signedByCompanyAt ? new Date(contract.signedByCompanyAt).toLocaleDateString() : 'Pending'}</span>
      <span>Signed by you: {contract.signedByClientAt ? new Date(contract.signedByClientAt).toLocaleDateString() : 'Pending'}</span>
     </div>
     {contract.documentUrl && (
      <a href={contract.documentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-body-sm font-semibold text-brand hover:underline">
       <Icon name="description" className="text-base" /> View contract document
      </a>
     )}
    </div>
   )}
   {error && <p className="mt-3 flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
   {isSent && (
    <div className="mt-5 flex flex-wrap items-center gap-3">
     <Button onClick={handleAccept} disabled={isPending} variant="primary" size="md" icon={<Icon name="check" />}>
      {isPending ? 'Working...' : 'Accept Proposal'}
     </Button>
     <Button onClick={() => setShowRejectForm((v) => !v)} disabled={isPending} variant="outline" size="md" icon={<Icon name="close" />}>
      Reject
     </Button>
    </div>
   )}
   {showRejectForm && (
    <div className="mt-4 flex flex-col gap-2">
     <textarea
      value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
      placeholder="Let us know why (optional) so we can revise the proposal..."
      className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink"
     />
     <div className="flex gap-2">
      <Button onClick={handleReject} disabled={isPending} variant="primary" size="md">{isPending ? 'Working...' : 'Confirm Rejection'}</Button>
      <Button onClick={() => setShowRejectForm(false)} disabled={isPending} variant="outline" size="md">Cancel</Button>
     </div>
    </div>
   )}
  </div>
 );
}

function Proposals({ proposals, contracts, onAccept, onReject }) {
 const { page, setPage, totalPages, pageRows } = usePagedRows(proposals);
 if (proposals.length === 0) {
  return (
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
    <EmptyState icon="description" title="No proposals yet" description="Proposals from your account team will appear here for review." />
   </div>
  );
 }
 return (
  <div className="space-y-stack-md">
   {pageRows.map((p) => (
    <ProposalCard key={p.id} proposal={p} contract={contracts?.find((c) => c.proposalId === p.id)} onAccept={onAccept} onReject={onReject} />
   ))}
   <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Invoices({ invoices }) {
 const { page, setPage, totalPages, pageRows } = usePagedRows(invoices);
 if (invoices.length === 0) {
  return (
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
    <EmptyState icon="receipt" title="No invoices yet" description="Your invoices will appear here." />
   </div>
  );
 }
 return (
  <div className="space-y-stack-md">
  <PortalTable
   columns={[
    { key: 'id', label: 'Invoice', className: 'font-body text-body-md text-brand-dark dark:text-dark-brand' },
    { key: 'amount', label: 'Amount', className: 'text-body-md text-brand-dark dark:text-dark-brand', render: (val) => `$${val.toLocaleString()}` },
    { key: 'issueDate', label: 'Issued', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'dueDate', label: 'Due', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge variant={STATUS_VARIANTS[val] || 'neutral'}>{val}</StatusBadge> },
   ]}
   rows={pageRows}
  />
  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Tickets({ tickets, onNewTicket }) {
 const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
 const [showForm, setShowForm] = useState(false);
 const [error, setError] = useState('');
 const [fieldErrors, setFieldErrors] = useState({});
 const { run, isPending: submitting } = useAsyncAction();
 const { page, setPage, totalPages, pageRows } = usePagedRows(tickets);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  const clientErrors = validateNewTicket(newTicket);
  if (Object.keys(clientErrors).length > 0) {
   setFieldErrors(clientErrors);
   setError('Please fix the errors below.');
   return;
  }
  setFieldErrors({});
  await run(async () => {
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
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-outline-variant bg-white dark:bg-dark-surface p-stack-lg">
     {error && (
      <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>
     )}
     <div>
      <input type="text" placeholder="Subject" value={newTicket.subject}
       onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
       className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink" />
      {fieldErrors.subject && <p className="mt-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.subject}</p>}
     </div>
     <div>
      <textarea placeholder="Describe your issue..." value={newTicket.description}
       onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
       rows={3} className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink" />
      {fieldErrors.description && <p className="mt-1 text-body-xs font-semibold text-status-error-text">{fieldErrors.description}</p>}
     </div>
     <div className="flex gap-2">
      <Button type="submit" variant="primary" size="md" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</Button>
      <Button type="button" variant="outline" size="md" onClick={() => setShowForm(false)}>Cancel</Button>
     </div>
    </form>
   )}
   {tickets.length === 0
    ? (
     <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
      <EmptyState icon="support" title="No tickets yet" description="Submit a ticket to get support." />
     </div>
    )
    : (
     <>
     <PortalTable
      columns={[
       { key: 'id', label: 'ID', className: 'font-label-caps text-label-caps text-brand' },
       { key: 'subject', label: 'Subject', className: 'text-body-md text-brand-dark dark:text-dark-brand' },
       { key: 'priority', label: 'Priority', render: (val) => <Badge className="text-label-caps">{val}</Badge> },
       { key: 'createdAt', label: 'Created', className: 'text-body-md text-ink-muted dark:text-white' },
       { key: 'status', label: 'Status', render: (val) => <StatusBadge variant={STATUS_VARIANTS[val] || 'neutral'}>{val}</StatusBadge> },
      ]}
      rows={pageRows}
     />
     <Pagination page={page} totalPages={totalPages} onChange={setPage} />
     </>
    )}
  </div>
 );
}

function Payments({ payments }) {
 const { page, setPage, totalPages, pageRows } = usePagedRows(payments);
 if (payments.length === 0) {
  return (
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
    <EmptyState icon="payments" title="No payments yet" description="Your payment history will appear here." />
   </div>
  );
 }
 return (
  <div className="space-y-stack-md">
  <PortalTable
   columns={[
    { key: 'id', label: 'Payment ID', className: 'font-label-caps text-label-caps text-brand' },
    { key: 'invoice', label: 'Invoice', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'amount', label: 'Amount', className: 'text-body-md text-brand-dark dark:text-dark-brand', render: (val) => `$${val.toLocaleString()}` },
    { key: 'method', label: 'Method', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'date', label: 'Date', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge variant={STATUS_VARIANTS[val] || 'neutral'}>{val}</StatusBadge> },
   ]}
   rows={pageRows}
  />
  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Files({ files }) {
 const { page, setPage, totalPages, pageRows } = usePagedRows(files);
 if (files.length === 0) {
  return (
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
    <EmptyState icon="folder_open" title="No files yet" description="Shared files will appear here." />
   </div>
  );
 }
 return (
  <div className="space-y-stack-md">
  <PortalTable
   columns={[
    {
     key: 'name', label: 'Name',
     render: (val, row) => (
      <div className="flex items-center gap-2">
       <Icon name="description" className="text-lg text-brand" />
       <span className="text-body-md font-semibold text-brand-dark dark:text-dark-brand">{row.name}</span>
      </div>
     ),
    },
    { key: 'category', label: 'Category', render: (val) => <Badge className="text-label-caps">{val}</Badge> },
    { key: 'size', label: 'Size', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'uploadedOn', label: 'Uploaded', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'uploadedBy', label: 'By', className: 'text-body-md text-ink-muted dark:text-white' },
    {
     key: 'file_url', label: '',
     render: (val, row) => (
      row.file_url ? (
       <a href={row.file_url} target="_blank" rel="noreferrer" aria-label={`Open ${row.name}`} className="text-brand hover:text-brand-dark" title="Open file">
        <Icon name="open_in_new" className="text-xl" />
       </a>
      ) : (
       <span className="text-ink-muted/40" title="No file attached"><Icon name="open_in_new" className="text-xl" /></span>
      )
     ),
    },
   ]}
   rows={pageRows}
  />
  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Meetings({ meetings }) {
 const { page, setPage, totalPages, pageRows } = usePagedRows(meetings);
 if (meetings.length === 0) {
  return (
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
    <EmptyState icon="video_call" title="No meetings scheduled" description="Upcoming meetings will appear here." />
   </div>
  );
 }
 return (
  <div className="space-y-stack-md">
  <PortalTable
   columns={[
    { key: 'title', label: 'Meeting', className: 'font-body text-body-md text-brand-dark dark:text-dark-brand' },
    {
     key: 'date', label: 'Date & Time', className: 'text-body-md text-ink-muted dark:text-white',
     render: (_val, row) => `${row.date} ${row.time}`,
    },
    { key: 'duration', label: 'Duration', className: 'text-body-md text-ink-muted dark:text-white' },
    {
     key: 'attendees', label: 'Attendees', className: 'text-body-sm text-ink-muted dark:text-white',
     render: (val) => (val ?? []).join(', ') || '—',
    },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge variant={STATUS_VARIANTS[val] || 'neutral'}>{val}</StatusBadge> },
    {
     key: 'meeting_link', label: 'Action',
     render: (val, row) => (
      row.status === 'upcoming' && row.meeting_link ? (
       <a href={row.meeting_link} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-1 rounded bg-brand px-3 py-1.5 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark">
        <Icon name="videocam" className="text-base" /> Join
       </a>
      ) : (row.notes || row.recording_url) ? (
       <div className="max-w-xs space-y-1 text-body-sm text-ink-muted dark:text-white">
        {row.notes && <p className="line-clamp-2">{row.notes}</p>}
        {row.recording_url && (
         <a href={row.recording_url} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1 text-brand hover:underline">
          <Icon name="play_circle" className="text-base" /> Recording
         </a>
        )}
       </div>
      ) : '—'
     ),
    },
   ]}
   rows={pageRows}
  />
  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

function Reports({ reports }) {
 const { page, setPage, totalPages, pageRows } = usePagedRows(reports);
 if (reports.length === 0) {
  return (
   <div className="responsive-table overflow-hidden rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
    <EmptyState icon="bar_chart" title="No reports yet" description="Generated reports will appear here." />
   </div>
  );
 }
 return (
  <div className="space-y-stack-md">
  <PortalTable
   columns={[
    {
     key: 'title', label: 'Report',
     render: (_val, row) => (
      <div className="flex items-center gap-2">
       <Icon name="bar_chart" className="text-lg text-brand" />
       <span className="text-body-md text-brand-dark dark:text-dark-brand">{row.title}</span>
      </div>
     ),
    },
    { key: 'type', label: 'Type', render: (val) => <Badge className="text-label-caps">{val}</Badge> },
    { key: 'period', label: 'Period', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'generatedOn', label: 'Generated', className: 'text-body-md text-ink-muted dark:text-white' },
    { key: 'size', label: 'Size', className: 'text-body-md text-ink-muted dark:text-white' },
    {
     key: 'file_url', label: '',
     render: (val, row) => (
      row.file_url
       ? <a href={row.file_url} target="_blank" rel="noreferrer" aria-label={`Download ${row.title}`} className="text-brand hover:text-brand-dark"><Icon name="download" className="text-xl" /></a>
       : <span className="text-ink-muted/40"><Icon name="download" className="text-xl" /></span>
     ),
    },
   ]}
   rows={pageRows}
  />
  <Pagination page={page} totalPages={totalPages} onChange={setPage} />
  </div>
 );
}

// ─── Data normalizers (map backend schema → portal UI shape) ─────────────────
const normalizeProject = (p) => ({
 id: p.id, title: p.title, status: p.status,
 progress: p.progress_percent ?? p.progress ?? 0,
 deadline: p.end_date ?? p.deadline ?? '—',
 budget: p.budget ? `$${Number(p.budget).toLocaleString()}` : 'TBD',
 client_review_status: p.client_review_status ?? null,
});
const normalizeProjects = (arr) => (Array.isArray(arr) ? arr.map(normalizeProject) : []);


const normalizeProposal = (p) => ({
 id: p.id, version: p.version, status: p.status,
 price: Number(p.price ?? 0), scopeSummary: p.scope_summary,
 sentAt: p.sent_at?.slice(0, 10), fileUrl: p.file_url,
 rejectionReason: p.rejection_reason,
});
const normalizeProposals = (arr) => (Array.isArray(arr) ? arr.map(normalizeProposal) : []);

const normalizeContract = (c) => ({
 id: c.id, proposalId: c.proposal_id, status: c.status,
 signedByCompanyAt: c.signed_by_company_at, signedByClientAt: c.signed_by_client_at,
 documentUrl: c.document_url,
});
const normalizeContracts = (arr) => (Array.isArray(arr) ? arr.map(normalizeContract) : []);

const normalizeInvoice = (i) => ({
 id: i.invoice_number ?? i.id, amount: Number(i.total_amount ?? i.amount ?? 0),
 status: i.status, issueDate: i.issue_date ?? i.issueDate, dueDate: i.due_date ?? i.dueDate,
});
const normalizeInvoices = (arr) => (Array.isArray(arr) ? arr.map(normalizeInvoice) : []);

const normalizeTicket = (t) => ({
 id: t.ticket_number ?? t.id, subject: t.subject, status: t.status,
 priority: t.priority, createdAt: t.created_at?.slice(0, 10) ?? t.createdAt,
});
const normalizeTickets = (arr) => (Array.isArray(arr) ? arr.map(normalizeTicket) : []);

const normalizePayment = (p) => ({
 id: p.id, invoice: p.invoice_number ?? p.invoice ?? '—',
 amount: Number(p.amount ?? 0),
 method: (p.method ?? p.payment_method ?? '').replace('_', ' '),
 date: p.paid_at?.slice(0, 10) ?? p.date, status: p.status,
});
const normalizePayments = (arr) => (Array.isArray(arr) ? arr.map(normalizePayment) : []);

const normalizeMeeting = (m) => ({
 id: m.id, title: m.title,
 date: m.scheduled_at?.slice(0, 10) ?? m.date,
 time: m.scheduled_at ? new Date(m.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (m.time ?? '—'),
 duration: m.duration_minutes ? `${m.duration_minutes} min` : (m.duration ?? '—'),
 type: m.meeting_link ? 'Video Call' : (m.type ?? 'On-site'),
 meeting_link: m.meeting_link,
 attendees: m.attendees ?? [],
 status: m.status === 'scheduled' ? 'upcoming' : (m.status ?? 'upcoming'),
 notes: m.notes,
 recording_url: m.recording_url,
});
const normalizeMeetings = (arr) => (Array.isArray(arr) ? arr.map(normalizeMeeting) : []);

const normalizeFile = (f) => ({
 id: f.id, name: f.name, category: f.category,
 size: f.size_bytes ? `${(f.size_bytes / 1024).toFixed(0)} KB` : (f.size ?? '—'),
 uploadedOn: f.created_at?.slice(0, 10) ?? f.uploadedOn,
 uploadedBy: f.uploaded_by ?? f.uploadedBy ?? 'CoralSwift Team',
 file_url: f.file_url,
});
const normalizeFiles = (arr) => (Array.isArray(arr) ? arr.map(normalizeFile) : []);

const normalizeReport = (r) => ({
 id: r.id, title: r.title, type: r.report_type ?? r.type,
 period: r.period,
 generatedOn: r.created_at?.slice(0, 10) ?? r.generatedOn,
 size: r.size_bytes ? `${(r.size_bytes / 1024).toFixed(0)} KB` : (r.size ?? '—'),
 file_url: r.file_url,
});
const normalizeReports = (arr) => (Array.isArray(arr) ? arr.map(normalizeReport) : []);

export default function ClientPortal() {
 useDocumentTitle('Client Portal | CoralSwift Technologies');
 const { user, initializing, logout } = useAuth();
 const { denied } = useRoleGuard('client', '/login');
 const navigate = useNavigate();
 const [activeTab, setActiveTab] = useState('overview');
 const [loading, setLoading] = useState(true);
 const [tabLoading, setTabLoading] = useState(false);
 const initialLoadDone = useRef(false);
 const [profile, setProfile] = useState({ contact_name: '', email: '', company_name: '', industry: '', country: '' });
 const [projects, setProjects] = useState([]);
 const [selectedProject, setSelectedProject] = useState(null);
 const [proposals, setProposals] = useState([]);
 const [contracts, setContracts] = useState([]);
 const [invoices, setInvoices] = useState([]);
 const [tickets, setTickets] = useState([]);
 const [payments, setPayments] = useState([]);
 const [files, setFiles] = useState([]);
 const [meetings, setMeetings] = useState([]);
 const [reports, setReports] = useState([]);

 useEffect(() => {
  if (!user) { setLoading(false); return; }
  if (!initialLoadDone.current) setLoading(true);
  Promise.allSettled([
   fetchMyProfile().then((res) => res?.data),
   fetchMyProjects().then((res) => res?.data),
   fetchMyProposals().then((res) => res?.data),
   fetchMyContracts().then((res) => res?.data),
   fetchMyInvoices().then((res) => res?.data),
   fetchMyTickets().then((res) => res?.data),
   fetchMyPayments().then((res) => res?.data),
   fetchMyMeetings().then((res) => res?.data),
   fetchMyFiles().then((res) => res?.data),
   fetchMyReports().then((res) => res?.data),
  ]).then(([p, pr, prop, con, inv, t, pay, m, f, r]) => {
   if (p.status === 'fulfilled' && p.value) setProfile(p.value);
   if (pr.status === 'fulfilled' && pr.value) setProjects(normalizeProjects(pr.value));
   if (prop.status === 'fulfilled' && prop.value) setProposals(normalizeProposals(prop.value));
   if (con.status === 'fulfilled' && con.value) setContracts(normalizeContracts(con.value));
   if (inv.status === 'fulfilled' && inv.value) setInvoices(normalizeInvoices(inv.value));
   if (t.status === 'fulfilled' && t.value) setTickets(normalizeTickets(t.value));
   if (pay.status === 'fulfilled' && pay.value) setPayments(normalizePayments(pay.value));
   if (m.status === 'fulfilled' && m.value) setMeetings(normalizeMeetings(m.value));
   if (f.status === 'fulfilled' && f.value) setFiles(normalizeFiles(f.value));
   if (r.status === 'fulfilled' && r.value) setReports(normalizeReports(r.value));
  }).finally(() => { initialLoadDone.current = true; setLoading(false); });
 }, [user]);

 const fetchTab = async (tabId) => {
  if (!user) return;
  const fetchers = {
   proposals: () => Promise.all([
    fetchMyProposals().then((res) => { if (res?.data) setProposals(normalizeProposals(res.data)); }),
    fetchMyContracts().then((res) => { if (res?.data) setContracts(normalizeContracts(res.data)); }),
   ]),
   payments: () => fetchMyPayments().then((res) => { if (res?.data) setPayments(normalizePayments(res.data)); }),
   files: () => fetchMyFiles().then((res) => { if (res?.data) setFiles(normalizeFiles(res.data)); }),
   meetings: () => fetchMyMeetings().then((res) => { if (res?.data) setMeetings(normalizeMeetings(res.data)); }),
   reports: () => fetchMyReports().then((res) => { if (res?.data) setReports(normalizeReports(res.data)); }),
  };
  if (!fetchers[tabId]) return;
  setTabLoading(true);
  try {
   await fetchers[tabId]();
  } finally {
   setTabLoading(false);
  }
 };

 const handleTabChange = (tabId) => {
  setActiveTab(tabId);
  setSelectedProject(null);
  fetchTab(tabId);
 };

 const handleSelectProject = (project) => {
  // Re-fetch the project raw data to include client_review_status etc.
  // The normalizeProject above only keeps display fields; we pass the raw
  // project from the projects array matching the id so the detail panel
  // has the full shape including client_review_status.
  const raw = projects.find(p => p.id === project.id) || project;
  setSelectedProject(raw);
 };

 const handleProjectUpdate = (updated) => {
  const normalized = { ...normalizeProject(updated), client_review_status: updated.client_review_status, id: updated.id };
  setProjects(prev => prev.map(p => p.id === updated.id ? normalized : p));
  setSelectedProject(normalized);
 };

 const handleNewTicket = async (subject, description) => {
  if (!user) return;
  const res = await createTicketApi({ subject, description: description || subject, priority: 'medium' });
  const d = res?.data;
  setTickets((prev) => [normalizeTicket(d), ...prev]);
 };

 const handleAcceptProposal = async (proposalId) => {
  const res = await acceptMyProposal(proposalId);
  const d = res?.data;
  if (d) setProposals((prev) => prev.map((p) => (p.id === proposalId ? normalizeProposal(d) : p)));
 };

 const handleRejectProposal = async (proposalId, reason) => {
  const res = await rejectMyProposal(proposalId, reason);
  const d = res?.data;
  if (d) setProposals((prev) => prev.map((p) => (p.id === proposalId ? normalizeProposal(d) : p)));
 };

 // useRoleGuard already redirects both the unauthenticated case (to
 // /login?returnTo=..., preserving destination) and the wrong-role case —
 // no separate effect needed here. This gate just withholds rendering while
 // that redirect is in flight.
 if (initializing || !user || denied) return <div className="bg-surface-container py-section-padding dark:bg-dark-surface-container"><LoadingSpinner /></div>;
 if (loading) return <div className="bg-surface-container py-section-padding dark:bg-dark-surface-container"><SkeletonTable rows={6} columns={5} /></div>;

  return (
   <div className="flex h-dvh flex-col bg-surface-container dark:bg-dark-surface-container">
    <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-outline-variant bg-brand-dark px-4 py-3 sm:gap-4 sm:px-6 lg:px-10 xl:px-12 ">
     <div className="flex min-w-0 items-center gap-2 sm:gap-4">
      <Avatar name={profile.contact_name || 'Client'} size="lg" />
      <div className="min-w-0">
       <h1 className="max-w-[40vw] truncate font-display text-headline-md font-bold text-white sm:max-w-none">{profile.contact_name || 'Client'}</h1>
       <p className="hidden truncate text-body-sm text-white/70 sm:block">{profile.email || ''} &middot; {profile.company_name}</p>
      </div>
     </div>
     <Button variant="outline-light" size="md" onClick={() => { logout(); navigate('/login', { replace: true }); }} icon={<Icon name="logout" />}>
      Sign Out
     </Button>
    </div>

   <div className="flex min-h-0 flex-1">
    <aside className="hidden w-56 shrink-0 overflow-y-auto border-r border-outline-variant bg-brand-dark md:block">
     <nav aria-label="Portal navigation" className="flex flex-col gap-1 p-3">
      {clientPortalTabs.map((tab) => (
       <button key={tab.id} onClick={() => handleTabChange(tab.id)}
        className={`flex items-center gap-3 rounded-lg px-4 py-3 text-left font-label-caps text-label-caps uppercase transition-colors ${
         activeTab === tab.id ? 'bg-brand/20 font-bold text-white' : 'text-white/70 hover:bg-white/15 hover:text-white'
        }`}>
        <Icon name={tab.icon} className="text-lg" />{tab.label}
       </button>
      ))}
     </nav>
    </aside>

    <div className="flex min-h-0 flex-1 flex-col">
     <Tabs
      tabs={clientPortalTabs.map((tab) => ({ key: tab.id, label: tab.label, icon: <Icon name={tab.icon} className="text-lg" /> }))}
      active={activeTab}
      onChange={handleTabChange}
      variant="underline"
      ariaLabel="Portal navigation"
      tabClassName={(selected) =>
       `flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 font-label-caps text-label-caps uppercase transition-colors ${
        selected ? 'border-white font-bold text-white' : 'border-transparent font-semibold text-white/70 hover:border-white/40 hover:text-white'
       }`
      }
      className="scrollbar-hide mb-stack-lg flex gap-1 overflow-x-auto border-b border-outline-variant bg-brand-dark px-4 py-2 sm:px-6 md:hidden lg:px-10 xl:px-12"
     />

     <div className="min-w-0 flex-1 overflow-y-auto px-4 py-stack-lg sm:px-6 lg:px-10 xl:px-12 ">
      {tabLoading && ['proposals', 'payments', 'files', 'meetings', 'reports'].includes(activeTab)
       ? <SkeletonTable rows={6} columns={5} />
       : (
        <>
         {activeTab === 'overview' && <Overview profile={profile} projects={projects} invoices={invoices} tickets={tickets} />}
         {activeTab === 'projects' && (
          selectedProject
           ? <ProjectDetail project={selectedProject} onBack={() => setSelectedProject(null)} onProjectUpdate={handleProjectUpdate} />
           : <Projects projects={projects} onSelectProject={handleSelectProject} />
         )}
         {activeTab === 'proposals' && <Proposals proposals={proposals} contracts={contracts} onAccept={handleAcceptProposal} onReject={handleRejectProposal} />}
         {activeTab === 'invoices' && <Invoices invoices={invoices} />}
         {activeTab === 'payments' && <Payments payments={payments} />}
         {activeTab === 'files' && <Files files={files} />}
         {activeTab === 'meetings' && <Meetings meetings={meetings} />}
         {activeTab === 'reports' && <Reports reports={reports} />}
         {activeTab === 'tickets' && <Tickets tickets={tickets} onNewTicket={handleNewTicket} />}
        </>
       )}
     </div>
    </div>
   </div>
  </div>
 );
}
