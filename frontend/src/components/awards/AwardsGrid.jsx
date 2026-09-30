import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { SkeletonCard } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function AwardsGrid({ awards, yearFilters }) {
 const [activeYear, setActiveYear] = useState('All');
 if (!awards) {
  return (
   <section className="py-section-padding">
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
     <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
     </div>
    </div>
   </section>
  );
 }
 if (!awards.length) return <EmptyState icon="trophy" title="No awards found" description="No awards to display." />;

 const filtered = activeYear === 'All'
  ? awards
  : awards.filter((a) => a.year === activeYear);

 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-stack-lg flex flex-wrap gap-2">
     {yearFilters.map((y) => (
      <button
       key={y}
       onClick={() => setActiveYear(y)}
       className={`rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
        activeYear === y
         ? 'bg-brand text-white'
         : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted dark:hover:bg-dark-outline-variant'
       }`}
      >
       {y}
      </button>
     ))}
    </div>
    <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
     {filtered.map((award, i) => (
      <Reveal key={award.title} from="zoom" delay={i * 80}>
       <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-white p-stack-lg transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="mb-3 flex items-start justify-between">
         <div className="flex size-12 items-center justify-center rounded-lg bg-status-warning-bg">
          <Icon name="trophy" className="text-2xl text-status-warning-text" />
         </div>
         <span className="font-stat text-stat-lg text-brand">{award.year}</span>
        </div>
        <h3 className="mb-2 font-display text-headline-sm text-brand-dark dark:text-dark-brand">{award.title}</h3>
        <p className="mb-3 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{award.issuedBy}</p>
        <p className="flex-1 text-body-md text-ink-muted dark:text-dark-ink-muted">{award.description}</p>
        <div className="mt-4 border-t border-outline-variant pt-4">
         <StatusBadge variant="warning">{award.category}</StatusBadge>
        </div>
       </div>
      </Reveal>
     ))}
    </div>
   </div>
  </section>
 );
}
