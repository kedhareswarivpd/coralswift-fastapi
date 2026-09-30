import { useCallback, useState, useEffect, useMemo } from 'react';
import { projects as fallbackProjects } from '../../data/projects.js';
import { fetchProjects } from '../../api/projects.js';
import { fetchServices } from '../../api/services.js';
import { adaptProject, resolveProjectServiceCategories, serviceTaxonomyCategories } from '../../api/adapters.js';
import useApiResource from '../../hooks/useApiResource.js';
import ProjectCard from './ProjectCard.jsx';
import Reveal from '../ui/Reveal.jsx';
import { SkeletonCard } from '../ui/Skeleton.jsx';

const PAGE_SIZE = 6;

export default function ProjectGallery({ industry, activeServices = [] }) {
 const [visible, setVisible] = useState(PAGE_SIZE);

 // Fetch the full published set: service-category filtering happens
 // client-side across the whole collection, so a small page limit here
 // would silently exclude matching projects from the filters.
 const fetchFn = useCallback(() => fetchProjects({ industry, limit: 100 }), [industry]);

 const fallback =
  industry && industry !== 'All'
   ? fallbackProjects.filter((p) => p.industry === industry)
   : fallbackProjects;

 const { items: projects, loading, isFallback } = useApiResource(fetchFn, adaptProject, fallback, [industry]);

 // Backend projects carry at most a service_id (no service name). Build the
 // id -> portfolio-categories lookup once; the actual per-project resolution
 // lives in the adapter layer (resolveProjectServiceCategories) and is
 // recomputed whenever either dataset arrives, so late-loading services
 // still re-resolve every project.
 const [taxonomyByServiceId, setTaxonomyByServiceId] = useState({});
 useEffect(() => {
  let cancelled = false;
  fetchServices({ limit: 100 })
   .then((res) => {
    if (cancelled) return;
    const index = {};
    for (const s of res?.data || []) index[s.id] = serviceTaxonomyCategories(s);
    setTaxonomyByServiceId(index);
   })
   .catch(() => {});
  return () => { cancelled = true; };
 }, []);

 const enrichedProjects = useMemo(
  () => projects.map((p) => ({ ...p, services: resolveProjectServiceCategories(p, taxonomyByServiceId) })),
  [projects, taxonomyByServiceId],
 );

 useEffect(() => { setVisible(PAGE_SIZE); }, [industry, activeServices]);

 // Filter client-side on the resolved `services` categories.
 const filteredProjects =
  activeServices.length === 0
   ? enrichedProjects
   : enrichedProjects.filter((p) => (p.services || []).some((s) => activeServices.includes(s)));

 const visibleProjects = filteredProjects.slice(0, visible);
 const remaining = filteredProjects.length - visible;

 return (
  <section className="px-4 pb-stack-xl sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto max-w-container">
    {isFallback && !loading && (
     <p className="mb-6 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
      Showing sample projects — connect a live backend to see real portfolio data here.
     </p>
    )}
    {loading ? (
     <GallerySkeleton />
    ) : filteredProjects.length === 0 ? (
     <p className="py-16 text-center text-ink-muted dark:text-dark-ink-muted">
      No portfolio projects found for this category.
     </p>
    ) : (
     <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {visibleProjects.map((project, i) => (
       <Reveal key={project.slug || project.title} from="zoom" delay={i * 80}>
        <ProjectCard project={project} />
       </Reveal>
      ))}
     </div>
    )}
    {remaining > 0 && (
     <div className="mt-12 text-center">
      <Reveal from="up">
       <button
        onClick={() => setVisible((v) => v + PAGE_SIZE)}
        className="rounded-full border-2 border-brand px-8 py-3 font-label-caps text-label-caps uppercase text-brand transition-all hover:bg-brand hover:text-white active:scale-95"
       >
        View More Projects ({remaining} Remaining)
       </button>
      </Reveal>
     </div>
    )}
   </div>
  </section>
 );
}

function GallerySkeleton() {
 return (
  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
   {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
  </div>
 );
}
