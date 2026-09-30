import { Link } from 'react-router-dom';

export default function ProjectCard({ project }) {
 const Wrapper = project.slug ? Link : 'div';
 const wrapperProps = project.slug ? { to: `/portfolio/success/${project.slug}` } : {};

 return (
  <Wrapper {...wrapperProps} className="flex flex-col overflow-hidden rounded-lg border border-outline-variant bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="relative h-56 overflow-hidden">
    <img className="size-full object-cover" alt={`${project.title} mockup`} src={project.image} />
   </div>
   <div className="flex flex-col gap-4 p-6">
    <div className="flex items-start justify-between">
     <span className="rounded bg-accent-cyan-pale px-3 py-1 font-label-caps text-label-caps uppercase text-brand">
      {project.industry}
     </span>
     <span className="font-label-caps text-outline dark:text-white/50">{project.version}</span>
    </div>
    <h3 className="font-display text-lg text-brand dark:text-accent-cyan">{project.title}</h3>
    <p className="font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">{project.description}</p>
    <div className="flex flex-wrap gap-2 pt-2">
     {project.tags.map((tag) => (
      <span key={tag} className="rounded bg-surface-container px-2 py-1 font-label-caps text-ink-muted dark:bg-dark-surface-container dark:text-dark-ink-muted">
       {tag}
      </span>
     ))}
    </div>
   </div>
  </Wrapper>
 );
}
