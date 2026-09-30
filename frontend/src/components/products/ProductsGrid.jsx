import Icon from '../ui/Icon.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import { SkeletonCard } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Reveal from '../ui/Reveal.jsx';

const STATUS_VARIANTS = {
 GA: 'success',
 Beta: 'warning',
 'Coming Soon': 'info',
};

export default function ProductsGrid({ products }) {
 if (!products) {
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
 if (!products.length) return <EmptyState icon="inventory_2" title="No products available" description="Products will appear here." />;
 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
     {products.map((p, i) => (
      <Reveal key={p.title} from="zoom" delay={i * 80}>
       <div className="flex h-full flex-col rounded-lg border border-outline-variant bg-white p-stack-lg transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="mb-4 flex items-start justify-between">
         <div className="flex size-12 items-center justify-center rounded-lg bg-accent-cyan-pale">
          <Icon name={p.icon} className="text-2xl text-brand" />
         </div>
         <StatusBadge variant={STATUS_VARIANTS[p.status] || 'neutral'} className="font-semibold">{p.status}</StatusBadge>
        </div>
        <h3 className="mb-1 flex min-h-16 items-center font-display text-headline-sm text-ink dark:text-white">{p.title}</h3>
        <p className="mb-3 text-label-caps uppercase text-ink-muted dark:text-white/70">{p.tagline}</p>
        <p className="mb-4 flex-1 text-body-md text-ink-muted dark:text-white/80">{p.description}</p>
        <ul className="space-y-2 border-t border-outline-variant pt-4 dark:border-dark-outline-variant">
         {p.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-body-sm text-ink-muted dark:text-white/70">
           <Icon name="check_circle" className="mt-0.5 flex-shrink-0 text-lg text-brand" />
           <span>{f}</span>
          </li>
         ))}
        </ul>
       </div>
      </Reveal>
     ))}
    </div>
   </div>
  </section>
 );
}
