import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Button from '../ui/Button.jsx';
import { SkeletonCard } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function DownloadsGrid({ downloads, categoryFilters }) {
 const [activeCategory, setActiveCategory] = useState('All');
 if (!downloads) {
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
 if (!downloads.length) return <EmptyState icon="download" title="No downloads available" description="No resources to download." />;

 const filtered = activeCategory === 'All'
  ? downloads
  : downloads.filter((d) => d.category === activeCategory);

 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-stack-lg flex flex-wrap gap-2">
     {categoryFilters.map((cat) => (
      <button
       key={cat}
       onClick={() => setActiveCategory(cat)}
       className={`rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
        activeCategory === cat
         ? 'bg-brand text-white'
         : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted dark:hover:bg-dark-outline-variant'
       }`}
      >
       {cat}
      </button>
     ))}
    </div>
    <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
     {filtered.map((d, i) => (
      <Reveal key={d.title} from="zoom" delay={i * 80}>
       <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-white p-stack-lg transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="mb-3 flex items-center gap-3">
         <div className="flex size-10 items-center justify-center rounded-lg bg-status-error-bg dark:bg-status-error-bg/20">
          <Icon name="description" className="text-xl text-status-error-text dark:text-status-error" />
         </div>
         <StatusBadge variant="neutral">{d.format}</StatusBadge>
        </div>
        <h3 className="mb-2 font-display text-headline-sm text-brand-dark dark:text-dark-brand">
         {d.id ? <Link to={`/download/${d.id}`} className="hover:underline">{d.title}</Link> : d.title}
        </h3>
        <p className="mb-4 flex-1 text-body-md text-ink-muted dark:text-dark-ink-muted">{d.description}</p>
        <div className="mb-4 flex items-center gap-4 border-t border-outline-variant pt-4 text-body-sm text-ink-muted dark:border-dark-outline-variant dark:text-dark-ink-muted">
         <span className="flex items-center gap-1">
          <Icon name="folder" className="text-lg text-brand" />
          {d.category}
         </span>
         <span>{d.fileSize}</span>
         <span className="ml-auto flex items-center gap-1">
          <Icon name="download" className="text-lg" />
          {d.downloadCount}
         </span>
        </div>
        <Button as="a" href={d.fileUrl} variant="primary" size="md" className="w-full" icon={<Icon name="download" />}>
         Download
        </Button>
       </div>
      </Reveal>
     ))}
    </div>
   </div>
  </section>
 );
}
