import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import Badge from '../ui/Badge.jsx';
import ApplyForm from './ApplyForm.jsx';

export default function JobCard({ job }) {
 const [showApply, setShowApply] = useState(false);
 const canApply = Boolean(job.id);

 return (
  <div className="rounded-lg border border-outline-variant bg-white p-stack-lg transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="mb-3 flex items-start justify-between gap-4">
    <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{job.title}</h3>
    <Badge className="whitespace-nowrap bg-accent-cyan-pale text-label-caps text-brand">{job.department}</Badge>
   </div>
   <div className="mb-4 flex flex-wrap gap-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">
    <span className="flex items-center gap-1.5">
     <Icon name="location_on" className="text-body-md leading-none" />
     {job.location}
    </span>
    <span className="flex items-center gap-1.5">
     <Icon name="work_history" className="text-body-md leading-none" />
     {job.type}
    </span>
    <span className="flex items-center gap-1.5">
     <Icon name="school" className="text-body-md leading-none" />
     {job.experience}
    </span>
   </div>
   <p className="mb-4 text-body-md text-ink-muted dark:text-dark-ink-muted">{job.description}</p>
   <details className="group" aria-label={job.title}>
    <summary className="flex cursor-pointer list-none items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-colors hover:text-brand-dark">
     <span>View Details</span>
     <Icon name="expand_more" className="text-lg transition-transform group-open:rotate-180" />
    </summary>
    <div className="mt-4 space-y-4">
     <div>
      <h4 className="mb-2 font-label-caps text-label-caps uppercase text-ink dark:text-dark-ink">Responsibilities</h4>
      <ul className="space-y-1.5">
       {job.responsibilities.map((r) => (
        <li key={r} className="flex items-start gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
         <Icon name="check_circle" className="mt-0.5 flex-shrink-0 text-lg text-brand" />
         <span>{r}</span>
        </li>
       ))}
      </ul>
     </div>
     <div>
      <h4 className="mb-2 font-label-caps text-label-caps uppercase text-ink dark:text-dark-ink">Requirements</h4>
      <ul className="space-y-1.5">
       {job.requirements.map((r) => (
        <li key={r} className="flex items-start gap-2 text-body-sm text-ink-muted dark:text-dark-ink-muted">
         <Icon name="chevron_right" className="mt-0.5 flex-shrink-0 text-lg text-brand" />
         <span>{r}</span>
        </li>
       ))}
      </ul>
     </div>
    </div>
   </details>
   <button
    type="button"
    onClick={() => setShowApply(true)}
    disabled={!canApply}
    title={canApply ? `Apply for ${job.title}` : 'Applications are temporarily unavailable'}
    className="mt-5 inline-flex items-center gap-2 rounded bg-brand px-6 py-2.5 font-label-caps text-label-caps font-semibold uppercase tracking-wide text-white transition-all hover:bg-brand-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
   >
    <Icon name="send" className="text-lg leading-none" />
    Apply Now
   </button>
   {showApply && canApply && <ApplyForm job={job} onClose={() => setShowApply(false)} />}
  </div>
 );
}
