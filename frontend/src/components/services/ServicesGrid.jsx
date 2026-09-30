import { services as fallbackServices } from '../../data/services.js';
import { fetchServices } from '../../api/services.js';
import { adaptService } from '../../api/adapters.js';
import useApiResource from '../../hooks/useApiResource.js';
import ServiceCard from './ServiceCard.jsx';
import Reveal from '../ui/Reveal.jsx';
import { SkeletonCard } from '../ui/Skeleton.jsx';

export default function ServicesGrid() {
 const { items: services, loading, isFallback } = useApiResource(fetchServices, adaptService, fallbackServices);

 return (
  <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mb-stack-xl flex flex-col items-center gap-4 text-center">
    <h2 className="font-display text-headline-md text-brand-dark dark:text-dark-brand">Full-Stack Digital Transformation</h2>
    <div className="h-1 w-20 rounded-full bg-brand" />
   </div>
   {isFallback && !loading && (
    <p className="mb-6 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
     Showing sample services — connect a live backend to see real service data here.
    </p>
   )}
   {loading ? (
    <ServicesGridSkeleton />
   ) : (
    <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
     {services.map((service, i) => (
      <Reveal key={service.title} style={{ transitionDelay: `${i * 100}ms` }}>
       <ServiceCard service={service} />
      </Reveal>
     ))}
    </div>
   )}
  </section>
 );
}

function ServicesGridSkeleton() {
 return (
  <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
   {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
  </div>
 );
}
