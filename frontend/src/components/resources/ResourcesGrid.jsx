import { useState } from 'react';
import Badge from '../ui/Badge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Icon from '../ui/Icon.jsx';
import { SkeletonCard } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function ResourcesGrid({ resources, typeFilters }) {
 const [activeType, setActiveType] = useState('All');
 if (!resources) {
  return (
   <section className="py-section-padding">
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
     <div className="grid gap-gutter md:grid-cols-2">
      {Array.from({ length: 4 }, (_, i) => <SkeletonCard key={i} />)}
     </div>
    </div>
   </section>
  );
 }
 if (!resources.length) return <EmptyState icon="menu_book" title="No resources found" description="Resources will appear here." />;

 const filtered = activeType === 'All'
  ? resources
  : resources.filter((r) => r.resourceType === activeType);

 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-stack-lg flex flex-wrap gap-2">
     {typeFilters.map((t) => (
      <button
       key={t}
       onClick={() => setActiveType(t)}
       className={`rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
        activeType === t
         ? 'bg-brand text-white'
         : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted dark:hover:bg-dark-outline-variant'
       }`}
      >
       {t}
      </button>
     ))}
    </div>
    <div className="grid gap-gutter md:grid-cols-2">
     {filtered.map((r, i) => (
      <Reveal key={r.slug} from="zoom" delay={i * 80}>
       <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-white p-stack-lg transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="mb-3 flex items-start justify-between gap-3">
         <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent-cyan-pale">
          <Icon name="menu_book" className="text-xl text-brand" />
         </div>
         <div className="flex flex-wrap gap-2">
          {r.featured && <StatusBadge variant="warning">Featured</StatusBadge>}
          <Badge className="bg-accent-cyan-pale text-label-caps text-brand">{r.resourceType}</Badge>
         </div>
        </div>
        <h3 className="mb-2 font-display text-headline-sm text-brand-dark dark:text-dark-brand">{r.title}</h3>
        <p className="mb-4 flex-1 text-body-md text-ink-muted dark:text-dark-ink-muted">{r.description}</p>
        <div className="flex items-center gap-4 border-t border-outline-variant pt-4 text-body-sm text-ink-muted dark:border-dark-outline-variant dark:text-dark-ink-muted">
         <div className="flex items-center gap-1.5">
          <Icon name="person" className="text-lg text-brand" />
          <span>{r.author}</span>
         </div>
         <span className="flex items-center gap-1.5">
          <Icon name="schedule" className="text-lg text-brand" />
          {r.readTime}
         </span>
         <span className="ml-auto text-label-caps">{r.publishedAt}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
         {r.topics.map((t) => (
          <StatusBadge key={t} variant="neutral">{t}</StatusBadge>
         ))}
        </div>
       </div>
      </Reveal>
     ))}
    </div>
   </div>
  </section>
 );
}
