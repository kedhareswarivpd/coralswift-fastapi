import { useState } from 'react';
import Reveal from '../ui/Reveal.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import JobCard from './JobCard.jsx';

const FILTERS = [
 { id: 'all', label: 'All Roles' },
 { id: 'full_time', label: 'Full-Time' },
 { id: 'part_time', label: 'Part-Time' },
 { id: 'contract', label: 'Contract' },
 { id: 'internship', label: 'Internships' },
];

export default function JobListings({ jobs }) {
 const [filter, setFilter] = useState('all');
 const filtered = filter === 'all' ? jobs : jobs.filter((j) => j.type === filter);

 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-6 flex flex-wrap gap-2">
     {FILTERS.map((f) => (
      <button
       key={f.id}
       onClick={() => setFilter(f.id)}
       className={`rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-colors ${
        filter === f.id ? 'bg-brand text-white' : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted'
       }`}
      >
       {f.label}
      </button>
     ))}
    </div>
    <p className="mb-6 text-body-md text-ink-muted dark:text-dark-ink-muted">{filtered.length} open position{filtered.length === 1 ? '' : 's'}</p>
    {filtered.length === 0 ? (
     <EmptyState icon="work_off" title="No matching positions" description="Try a different filter, or check back soon." />
    ) : (
     <div className="space-y-stack-md">
      {filtered.map((job, i) => (
       <Reveal key={job.slug} from="left" delay={i * 80}>
        <JobCard job={job} />
       </Reveal>
      ))}
     </div>
    )}
   </div>
  </section>
 );
}
