import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../../api/projects.js';
import Icon from '../ui/Icon.jsx';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80';

export default function FeaturedCaseStudy() {
 const [project, setProject] = useState(undefined); // undefined = loading, null = none

 useEffect(() => {
  fetchProjects({ is_featured: true, is_published: true, limit: 1 })
   .then((res) => setProject(res?.data?.[0] || null))
   .catch(() => setProject(null));
 }, []);

 if (!project) return null; // still loading, or no featured project set — nothing to show yet

 return (
  <section className="bg-surface px-4 py-stack-xl dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto max-w-container">
    <div className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-white shadow-card dark:border-dark-outline-variant dark:bg-dark-surface lg:flex-row">
     <div className="group relative h-80 overflow-hidden lg:h-auto lg:w-3/5">
      <div className="absolute inset-0 z-10 bg-brand/40 transition-all group-hover:bg-brand/20" />
      <img className="size-full object-cover" alt={project.title} src={project.cover_image || FALLBACK_IMAGE} />
      <div className="absolute bottom-8 left-8 z-20 flex gap-4">
       {project.industry && (
        <span className="rounded bg-accent-cyan px-4 py-1 text-body-sm font-bold text-brand-dark">{project.industry}</span>
       )}
       {project.status && (
        <span className="rounded bg-white/90 px-4 py-1 text-body-sm capitalize text-brand backdrop-blur">{project.status.replace('_', ' ')}</span>
       )}
      </div>
     </div>
     <div className="flex flex-col justify-center gap-stack-md p-6 sm:p-8 lg:w-2/5 lg:p-12">
      <h2 className="font-display text-headline-md text-brand dark:text-accent-cyan">{project.title}</h2>
      <p className="font-body text-body-md text-ink-muted dark:text-white/80">{project.overview || project.challenge || ''}</p>
      {typeof project.progress_percent === 'number' && (
       <div className="my-4 grid grid-cols-2 gap-4">
        <div>
         <span className="mb-1 block font-label-caps text-label-caps uppercase text-outline">Progress</span>
         <span className="text-xl font-bold text-brand">{project.progress_percent}%</span>
        </div>
        {project.budget != null && (
         <div>
          <span className="mb-1 block font-label-caps text-label-caps uppercase text-outline">Budget</span>
          <span className="text-xl font-bold text-brand">${Number(project.budget).toLocaleString()}</span>
         </div>
        )}
       </div>
      )}
      {project.slug && (
       <Link
        to={`/portfolio/success/${project.slug}`}
        className="group flex w-fit items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:text-brand-dark"
       >
        Read Full Success Story
        <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
       </Link>
      )}
     </div>
    </div>
   </div>
  </section>
 );
}
