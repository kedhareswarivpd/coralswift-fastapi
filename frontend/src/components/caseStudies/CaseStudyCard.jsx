import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Icon from '../ui/Icon.jsx';

export default function CaseStudyCard({ study }) {
 return (
  <article className="flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant bg-white transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="flex h-full flex-col p-stack-lg">
    <div className="mb-3 flex items-center gap-2">
     <Badge className="bg-accent-cyan-pale text-label-caps text-brand">{study.industry}</Badge>
    </div>
    <h3 className="mb-3 font-display text-headline-sm text-brand-dark dark:text-dark-brand">
     {study.slug ? <Link to={`/case-studies/${study.slug}`} className="hover:underline">{study.title}</Link> : study.title}
    </h3>
    <p className="mb-4 flex-1 text-body-md text-ink-muted dark:text-dark-ink-muted">{study.description}</p>
    <div className="mb-4">
     <h4 className="mb-2 font-label-caps text-label-caps uppercase text-ink-muted dark:text-white/60">Key Results</h4>
     <ul className="space-y-1.5">
      {study.results.map((r) => (
       <li key={r} className="flex items-start gap-2 text-body-sm text-ink-muted dark:text-white/70">
        <Icon name="trending_up" className="flex-shrink-0 text-lg text-status-success-text" />
        <span>{r}</span>
       </li>
      ))}
     </ul>
    </div>
    <div className="flex flex-wrap gap-2 border-t border-outline-variant pt-4">
     {study.technologies.map((tech) => (
      <StatusBadge key={tech} variant="neutral">{tech}</StatusBadge>
     ))}
    </div>
   </div>
  </article>
 );
}
