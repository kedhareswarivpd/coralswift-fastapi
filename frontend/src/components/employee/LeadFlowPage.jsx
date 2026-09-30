import { useState, useEffect, useCallback } from 'react';
import Icon from '../ui/Icon.jsx';
import Button from '../ui/Button.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { SkeletonTable } from '../ui/Skeleton.jsx';
import useAsyncAction from '../../hooks/useAsyncAction.js';
import { useAuth } from '../../context/AuthContext.jsx';
import {
 fetchLead, fetchLeadActivities, logLeadCall, markRequirementGathering, disqualifyLead,
 fetchProposals, createProposal, sendProposal, acceptProposal, rejectProposal,
 fetchContracts, createContract, signContract,
} from '../../api/crm.js';

// One-way pipeline — mirrors backend app/services/lead_pipeline.py. Shown as
// a stepper so staff can see exactly where a lead sits and what's left,
// instead of a free-form status dropdown they could set to anything.
const PIPELINE_STEPS = [
 { key: 'new', label: 'New' },
 { key: 'contacted', label: 'Contacted' },
 { key: 'requirement_gathering', label: 'Requirement Gathering' },
 { key: 'proposal_created', label: 'Proposal Created' },
 { key: 'proposal_sent', label: 'Proposal Sent' },
 { key: 'proposal_approved', label: 'Proposal Approved' },
 { key: 'converted', label: 'Converted' },
];
const LEAD_STATUS_COLOR = { new: 'neutral', contacted: 'info', requirement_gathering: 'info', proposal_created: 'info', proposal_sent: 'warning', proposal_approved: 'success', converted: 'success', disqualified: 'error' };
const ACTIVITY_ICON = {
 lead_created: 'person_add', call_log: 'call', requirement_gathering: 'fact_check',
 proposal_created: 'description', proposal_sent: 'send', proposal_approved: 'thumb_up',
 contract_generated: 'gavel', contract_signed_company: 'domain', contract_signed_client: 'person',
 disqualified: 'cancel', converted: 'verified',
};
const ACTIVITY_LABEL = {
 lead_created: 'Lead created', call_log: 'Call logged', requirement_gathering: 'Requirement gathering',
 proposal_created: 'Proposal created', proposal_sent: 'Proposal sent', proposal_approved: 'Proposal approved',
 contract_generated: 'Contract generated', contract_signed_company: 'Signed by company', contract_signed_client: 'Signed by client',
 disqualified: 'Disqualified', converted: 'Converted to client',
};

export default function LeadFlowPage({ leadId, onBack, onRefresh }) {
 const { user } = useAuth();
 const [lead, setLead] = useState(null);
 const [activities, setActivities] = useState([]);
 const [proposals, setProposals] = useState([]);
 const [contracts, setContracts] = useState([]);
 const [loading, setLoading] = useState(true);
 const [toast, setToast] = useState({ msg: '', type: 'success' });
 const [callNotes, setCallNotes] = useState('');
 const [rgNotes, setRgNotes] = useState('');
 const [proposalForm, setProposalForm] = useState({ scope_summary: '', price: '' });
 const [disqualifyReason, setDisqualifyReason] = useState('');
 const [rejectReason, setRejectReason] = useState('');
 const { run, isPending } = useAsyncAction();

 const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast({ msg: '', type: 'success' }), 3500); };

 const load = useCallback(() => {
  setLoading(true);
  Promise.all([fetchLead(leadId), fetchLeadActivities(leadId), fetchProposals({ lead_id: leadId })])
   .then(([leadRes, activitiesRes, proposalsRes]) => {
    setLead(leadRes?.data || null);
    setActivities(activitiesRes?.data || []);
    const props = proposalsRes?.data || [];
    setProposals(props);
    const accepted = props.find((p) => p.status === 'accepted');
    if (accepted) {
     fetchContracts({ proposal_id: accepted.id }).then((r) => setContracts(r?.data || [])).catch(() => {});
    } else {
     setContracts([]);
    }
   })
   .catch(() => showToast('Failed to load lead.', 'error'))
   .finally(() => setLoading(false));
 }, [leadId]);

 useEffect(() => { load(); }, [load]);

 const refreshAll = () => { load(); onRefresh?.(); };

 const doAction = (fn, successMsg) => run(async () => {
  try {
   await fn();
   showToast(successMsg);
   refreshAll();
  } catch (err) {
   showToast(err?.message || 'Action failed.', 'error');
  }
 });

 if (loading) return <SkeletonTable rows={6} columns={1} />;
 if (!lead) return <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Lead not found.</p>;

 const isTerminal = lead.status === 'converted' || lead.status === 'disqualified';
 const stepIndex = PIPELINE_STEPS.findIndex((s) => s.key === lead.status);
 const draftProposal = proposals.find((p) => p.status === 'draft' || p.status === 'pm_approved');
 const sentProposal = proposals.find((p) => p.status === 'sent' || p.status === 'viewed');
 const acceptedProposal = proposals.find((p) => p.status === 'accepted');
 const contract = contracts[0] || null;
 // Once a proposal is approved the only valid next step is converting to a
 // client — disqualifying from here is blocked server-side too.
 const canDisqualify = !isTerminal && lead.status !== 'proposal_approved';

 return (
  <div className="space-y-stack-md">
   <div className="flex items-center justify-between">
    <button onClick={onBack} className="flex items-center gap-1 text-body-sm font-medium text-brand hover:underline">
     <Icon name="arrow_back" className="text-base" /> Back to Leads
    </button>
    {lead.status === 'disqualified' && <StatusBadge variant="error">Disqualified</StatusBadge>}
   </div>

   {toast.msg && (
    <p className={`rounded-lg px-4 py-2 text-body-sm ${
     toast.type === 'success' ? 'border border-green-500/30 bg-status-success-bg0/10 text-status-success-text' : 'border border-status-error/30 bg-red-500/10 text-red-800'
    }`}>{toast.msg}</p>
   )}

   <div className="rounded-xl border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <div className="flex flex-wrap items-start justify-between gap-3">
     <div>
      <p className="text-headline-sm font-bold text-brand-dark dark:text-white">{lead.company || lead.contact_name}</p>
      <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{lead.contact_name} · {lead.email}{lead.phone ? ` · ${lead.phone}` : ''}</p>
     </div>
     <div className="text-right">
      <StatusBadge variant={LEAD_STATUS_COLOR[lead.status]}>{lead.status?.replace('_', ' ')}</StatusBadge>
      {lead.estimated_value != null && <p className="mt-1 text-body-sm text-brand-dark dark:text-white">${Number(lead.estimated_value).toLocaleString()}</p>}
     </div>
    </div>

    {lead.status !== 'disqualified' && (
     <div className="mt-6 flex items-center overflow-x-auto">
      {PIPELINE_STEPS.map((step, i) => {
       // The last step (Converted) is a completed end-state, not an
       // "in progress, waiting on the next one" step like the others — once
       // reached it should show as done (checkmark), not just highlighted
       // with its bare number, since there is no further step to move to.
       const isDone = i < stepIndex || (i === stepIndex && step.key === 'converted');
       return (
       <div key={step.key} className="flex flex-shrink-0 items-center">
        <div className="flex flex-col items-center gap-1">
         <div className={`flex h-8 w-8 items-center justify-center rounded-full text-body-xs font-bold ${
          isDone ? 'bg-brand text-white' : i === stepIndex ? 'bg-brand-dark text-white ring-4 ring-brand/20' : 'bg-surface-container text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted'
         }`}>{isDone ? <Icon name="check" className="text-base" /> : i + 1}</div>
         <span className="max-w-[90px] text-center text-body-xs text-ink-muted dark:text-dark-ink-muted">{step.label}</span>
        </div>
        {i < PIPELINE_STEPS.length - 1 && <div className={`mx-1 h-0.5 w-8 flex-shrink-0 ${i < stepIndex ? 'bg-brand' : 'bg-outline-variant dark:bg-dark-outline-variant'}`} />}
       </div>
       );
      })}
     </div>
    )}
    {lead.rejection_reason && (
     <p className="mt-4 rounded-lg border border-status-error/30 bg-red-500/10 px-4 py-2 text-body-sm text-red-800">Reason: {lead.rejection_reason}</p>
    )}
   </div>

   <div className="grid gap-4 lg:grid-cols-2">
    {/* Timeline */}
    <div className="rounded-xl border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container">
     <p className="mb-4 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Activity Timeline</p>
     {!activities.length && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">No activity recorded yet.</p>}
     <ol className="space-y-4">
      {activities.map((a) => (
       <li key={a.id} className="flex gap-3">
        <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-accent-cyan-pale text-brand-dark dark:bg-blue-900/30 dark:text-white">
         <Icon name={ACTIVITY_ICON[a.activity_type] || 'circle'} className="text-sm" />
        </div>
        <div>
         <p className="text-body-sm font-semibold text-brand-dark dark:text-white">{ACTIVITY_LABEL[a.activity_type] || a.activity_type}</p>
         {a.description && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{a.description}</p>}
         <p className="text-body-xs text-ink-muted dark:text-dark-ink-muted">{new Date(a.created_at).toLocaleString()}</p>
        </div>
       </li>
      ))}
     </ol>
    </div>

    {/* Next step actions */}
    <div className="space-y-4">
     {!isTerminal && (
      <div className="rounded-xl border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <p className="mb-3 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Log Call</p>
       <textarea rows={2} placeholder="What was discussed..." value={callNotes} onChange={(e) => setCallNotes(e.target.value)}
        className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
       <Button type="button" variant="outline" size="md" className="mt-2" disabled={isPending || !callNotes.trim()}
        onClick={() => doAction(async () => { await logLeadCall(lead.id, callNotes); setCallNotes(''); }, 'Call logged.')}>
        Save Call Log
       </Button>
      </div>
     )}

     {(lead.status === 'new' || lead.status === 'contacted') && (
      <div className="rounded-xl border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <p className="mb-3 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Next Step — Requirement Gathering</p>
       <textarea rows={2} placeholder="Requirements discussed / demo notes..." value={rgNotes} onChange={(e) => setRgNotes(e.target.value)}
        className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
       <Button type="button" variant="primary" size="md" className="mt-2" disabled={isPending}
        onClick={() => doAction(async () => { await markRequirementGathering(lead.id, rgNotes); setRgNotes(''); }, 'Moved to requirement gathering.')}>
        Move to Requirement Gathering
       </Button>
      </div>
     )}

     {lead.status === 'requirement_gathering' && (
      <div className="rounded-xl border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <p className="mb-3 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Next Step — Create Proposal</p>
       <textarea rows={3} placeholder="Scope summary *" value={proposalForm.scope_summary} onChange={(e) => setProposalForm({ ...proposalForm, scope_summary: e.target.value })}
        className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
       <input type="number" min="0" placeholder="Price ($) *" value={proposalForm.price} onChange={(e) => setProposalForm({ ...proposalForm, price: e.target.value })}
        className="mt-2 w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-md text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
       <Button type="button" variant="primary" size="md" className="mt-2" disabled={isPending || !proposalForm.scope_summary.trim() || !proposalForm.price}
        onClick={() => doAction(async () => {
         await createProposal({ lead_id: lead.id, scope_summary: proposalForm.scope_summary, price: Number(proposalForm.price), currency: 'USD' });
         setProposalForm({ scope_summary: '', price: '' });
        }, 'Proposal created.')}>
        Create Proposal
       </Button>
      </div>
     )}

     {lead.status === 'proposal_created' && draftProposal && (
      <div className="rounded-xl border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <p className="mb-3 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Next Step — Send Proposal</p>
       <p className="mb-3 text-body-sm text-ink-muted dark:text-dark-ink-muted">v{draftProposal.version} · {draftProposal.currency} {Number(draftProposal.price).toLocaleString()} · {draftProposal.scope_summary}</p>
       <Button type="button" variant="primary" size="md" disabled={isPending}
        onClick={() => doAction(async () => { await sendProposal(draftProposal.id); }, 'Proposal sent to the client.')}>
        Send Proposal
       </Button>
      </div>
     )}

     {lead.status === 'proposal_sent' && sentProposal && (
      <div className="rounded-xl border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <p className="mb-3 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Awaiting Client Response</p>
       <p className="mb-3 text-body-sm text-ink-muted dark:text-dark-ink-muted">v{sentProposal.version} · {sentProposal.currency} {Number(sentProposal.price).toLocaleString()} — record the outcome once the client responds (by call/email outside the portal, or their own Client Portal action).</p>
       <div className="flex gap-2">
        <Button type="button" variant="primary" size="md" disabled={isPending}
         onClick={() => doAction(async () => { await acceptProposal(sentProposal.id); }, 'Proposal marked approved.')}>
         Mark Approved
        </Button>
        <Button type="button" variant="outline" size="md" disabled={isPending}
         onClick={() => doAction(async () => { await rejectProposal(sentProposal.id, rejectReason); }, 'Proposal marked rejected.')}>
         Mark Rejected
        </Button>
       </div>
       <input type="text" placeholder="Rejection reason (optional)" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
        className="mt-2 w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-sm text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
      </div>
     )}

     {lead.status === 'proposal_approved' && acceptedProposal && !contract && (
      <div className="rounded-xl border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <p className="mb-3 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Next Step — Generate Contract</p>
       <p className="mb-3 text-body-sm text-ink-muted dark:text-dark-ink-muted">v{acceptedProposal.version} · {acceptedProposal.currency} {Number(acceptedProposal.price).toLocaleString()} — draft the contract for signature. Signing happens manually (offline/DocuSign); record each signature here once it's done.</p>
       <Button type="button" variant="primary" size="md" disabled={isPending}
        onClick={() => doAction(async () => { await createContract(acceptedProposal.id); }, 'Contract drafted.')}>
        Generate Contract
       </Button>
      </div>
     )}

     {lead.status === 'proposal_approved' && contract && contract.status !== 'signed' && (
      <div className="rounded-xl border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <p className="mb-3 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Next Step — Contract Signatures</p>
       <p className="mb-3 text-body-sm text-ink-muted dark:text-dark-ink-muted">Record each signature once it happens outside the portal (offline / DocuSign). The client account and credentials are created automatically the moment both are recorded.</p>
       <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-outline-variant p-3 dark:border-dark-outline-variant">
         <span className="text-body-sm text-brand-dark dark:text-white">Signed by Company</span>
         {contract.signed_by_company_at ? (
          <span className="flex items-center gap-1 text-body-sm text-status-success-text"><Icon name="check_circle" className="text-base" /> {new Date(contract.signed_by_company_at).toLocaleString()}</span>
         ) : (
          <Button type="button" variant="outline" size="sm" disabled={isPending}
           onClick={() => doAction(async () => { await signContract(contract.id, { company_signed: true, client_signed: false }); }, 'Recorded company signature.')}>
           Mark Signed
          </Button>
         )}
        </div>
        <div className="flex items-center justify-between rounded-lg border border-outline-variant p-3 dark:border-dark-outline-variant">
         <span className="text-body-sm text-brand-dark dark:text-white">Signed by Client</span>
         {contract.signed_by_client_at ? (
          <span className="flex items-center gap-1 text-body-sm text-status-success-text"><Icon name="check_circle" className="text-base" /> {new Date(contract.signed_by_client_at).toLocaleString()}</span>
         ) : (
          <Button type="button" variant="outline" size="sm" disabled={isPending}
           onClick={() => doAction(async () => { await signContract(contract.id, { client_signed: true, company_signed: false }); }, 'Recorded client signature.')}>
           Mark Signed
          </Button>
         )}
        </div>
       </div>
      </div>
     )}

     {canDisqualify && (
      <div className="rounded-xl border border-status-error/30 bg-white p-6 dark:bg-dark-surface-container">
       <p className="mb-3 font-label-caps text-label-caps uppercase text-status-error">Disqualify Lead</p>
       <input type="text" placeholder="Reason *" value={disqualifyReason} onChange={(e) => setDisqualifyReason(e.target.value)}
        className="w-full rounded border border-outline-variant bg-white dark:bg-dark-surface px-4 py-3 text-body-sm text-brand-dark placeholder-ink-muted focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:text-white dark:placeholder-white/40" />
       <Button type="button" variant="outline" size="md" className="mt-2" disabled={isPending || !disqualifyReason.trim()}
        onClick={() => doAction(async () => { await disqualifyLead(lead.id, disqualifyReason); setDisqualifyReason(''); }, 'Lead disqualified.')}>
        Disqualify
       </Button>
      </div>
     )}
    </div>
   </div>
  </div>
 );
}
