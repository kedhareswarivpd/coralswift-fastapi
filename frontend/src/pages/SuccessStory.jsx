import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Icon from '../components/ui/Icon.jsx';
import Pulse, { SkeletonText, SkeletonCard } from '../components/ui/Skeleton.jsx';
import NotFound from './NotFound.jsx';
import { fetchProjectBySlug } from '../api/projects.js';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80';

export default function SuccessStory() {
 const { slug } = useParams();
 const [project, setProject] = useState(undefined); // undefined = loading, null = not found
 useDocumentTitle(project ? `${project.title} | CoralSwift Technologies` : 'Portfolio | CoralSwift Technologies');

 useEffect(() => {
  setProject(undefined);
  fetchProjectBySlug(slug)
   .then((res) => setProject(res?.data || null))
   .catch(() => setProject(null));
 }, [slug]);

 if (project === undefined) {
  return (
   <main className="min-h-screen bg-surface dark:bg-dark-surface">
    <Pulse className="h-80 w-full md:h-[420px]" rounded="rounded-none" />
    <div className="mx-auto flex max-w-container flex-col gap-stack-xl px-4 py-stack-xl sm:px-6 lg:px-10 xl:px-12 ">
     <SkeletonText lines={2} className="max-w-3xl" />
     <div className="grid gap-8 md:grid-cols-2">
      <SkeletonCard />
      <SkeletonCard />
     </div>
    </div>
   </main>
  );
 }
 if (!project) return <NotFound />;

 return (
  <main className="min-h-screen bg-surface dark:bg-dark-surface">
   {/* Hero */}
   <div className="relative h-80 overflow-hidden md:h-[420px]">
    <div className="absolute inset-0 z-10 bg-brand/60" />
    <img src={project.cover_image || FALLBACK_IMAGE} alt={project.title} className="size-full object-cover" />
    <div className="absolute inset-0 z-20 mx-auto flex max-w-container flex-col justify-end px-4 pb-10 sm:px-6 lg:px-10 xl:px-12 ">
     <div className="mb-4 flex gap-3">
      {project.industry && (
       <span className="rounded bg-accent-cyan px-4 py-1 text-body-sm font-bold text-brand-dark">{project.industry}</span>
      )}
      {project.status && (
       <span className="rounded bg-white/90 px-4 py-1 text-body-sm capitalize text-brand backdrop-blur">{project.status.replace('_', ' ')}</span>
      )}
     </div>
     <h1 className="max-w-3xl font-display text-headline-lg text-white">{project.title}</h1>
     <div className="mt-4 flex flex-wrap gap-6 text-body-sm text-white/80">
      {project.start_date && <span><strong className="text-white">Started:</strong> {project.start_date}</span>}
      {project.end_date && <span><strong className="text-white">Completed:</strong> {project.end_date}</span>}
     </div>
    </div>
   </div>

   <div className="mx-auto flex max-w-container flex-col gap-stack-xl px-4 py-stack-xl sm:px-6 lg:px-10 xl:px-12 ">
    {project.overview && (
     <p className="max-w-3xl font-body text-body-lg text-ink-muted dark:text-dark-ink-muted">{project.overview}</p>
    )}

    {(project.challenge || project.solution) && (
     <div className="grid gap-8 md:grid-cols-2">
      {project.challenge && (
       <div className="rounded-lg border border-outline-variant bg-white p-8 dark:border-dark-outline-variant dark:bg-dark-surface">
        <h2 className="mb-4 font-display text-headline-sm text-brand">The Challenge</h2>
        <p className="font-body text-body-md text-ink-muted dark:text-dark-ink-muted">{project.challenge}</p>
       </div>
      )}
      {project.solution && (
       <div className="rounded-lg border border-outline-variant bg-white p-8 dark:border-dark-outline-variant dark:bg-dark-surface">
        <h2 className="mb-4 font-display text-headline-sm text-brand">Our Solution</h2>
        <p className="font-body text-body-md text-ink-muted dark:text-dark-ink-muted">{project.solution}</p>
       </div>
      )}
     </div>
    )}

    {typeof project.progress_percent === 'number' && (
     <div>
      <h2 className="mb-4 font-display text-headline-sm text-brand">Progress</h2>
      <div className="h-3 w-full max-w-md overflow-hidden rounded-full bg-surface-container dark:bg-dark-surface-container">
       <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${project.progress_percent}%` }} />
      </div>
      <span className="mt-2 block text-body-sm text-ink-muted dark:text-dark-ink-muted">{project.progress_percent}% complete</span>
     </div>
    )}

    {!!project.technology_stack?.length && (
     <div>
      <h2 className="mb-4 font-display text-headline-sm text-brand">Technology Stack</h2>
      <div className="flex flex-wrap gap-3">
       {project.technology_stack.map((tech) => (
        <span key={tech} className="rounded-full bg-accent-cyan-pale px-4 py-2 font-label-caps text-body-sm text-brand">{tech}</span>
       ))}
      </div>
     </div>
    )}

    {!!project.team?.length && (
     <div>
      <h2 className="mb-4 font-display text-headline-sm text-brand">Project Team</h2>
      <div className="flex flex-wrap gap-3">
       {project.team.map((member) => (
        <span key={member.id} className="rounded-full border border-outline-variant px-4 py-2 text-body-sm text-ink-muted dark:border-dark-outline-variant dark:text-dark-ink-muted">
         {member.designation || 'Team Member'}
        </span>
       ))}
      </div>
     </div>
    )}

    {!!project.deliverables?.length && (
     <div>
      <h2 className="mb-4 font-display text-headline-sm text-brand">Deliverables</h2>
      <div className="grid gap-4 sm:grid-cols-2">
       {project.deliverables.map((d) => (
        <div key={d} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-white p-4 dark:border-dark-outline-variant dark:bg-dark-surface">
         <Icon name="check_circle" className="text-xl text-brand" />
         <span className="text-body-md text-ink dark:text-dark-ink">{d}</span>
        </div>
       ))}
      </div>
     </div>
    )}

    {!!project.gallery?.length && (
     <div>
      <h2 className="mb-4 font-display text-headline-sm text-brand">Gallery</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
       {project.gallery.map((src) => (
        <img key={src} src={src} alt="" className="aspect-video w-full rounded-lg object-cover" />
       ))}
      </div>
     </div>
    )}

    {!!project.downloads?.length && (
     <div>
      <h2 className="mb-4 font-display text-headline-sm text-brand">Downloads</h2>
      <div className="flex flex-wrap gap-4">
       {project.downloads.map((d) => (
        <a
         key={d.url}
         href={d.url}
         target="_blank"
         rel="noreferrer"
         className="inline-flex items-center gap-2 rounded-full border border-brand px-6 py-3 font-label-caps text-label-caps uppercase text-brand transition-colors hover:bg-brand hover:text-white"
        >
         <Icon name="download" /> {d.label || 'Download'}
        </a>
       ))}
      </div>
     </div>
    )}

    <Link
     to="/portfolio"
     className="flex w-fit items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:text-brand-dark"
    >
     <Icon name="arrow_back" />
     Back to Portfolio
    </Link>
   </div>
  </main>
 );
}
