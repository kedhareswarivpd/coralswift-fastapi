import { Link } from 'react-router-dom';
import Badge from '../ui/Badge.jsx';
import StatusBadge from '../ui/StatusBadge.jsx';
import Icon from '../ui/Icon.jsx';

export default function BlogCard({ post }) {
 return (
  <article className="flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant bg-white transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface">
   <div className="flex h-full flex-col p-stack-lg">
    <div className="mb-3 flex items-center gap-2">
     <Badge className="bg-accent-cyan-pale text-label-caps text-brand">{post.category}</Badge>
    </div>
    <h3 className="mb-3 font-display text-headline-sm text-brand-dark dark:text-dark-brand">
     {post.slug ? <Link to={`/blog/${post.slug}`} className="hover:underline">{post.title}</Link> : post.title}
    </h3>
    <p className="mb-4 flex-1 text-body-md text-ink-muted dark:text-dark-ink-muted">{post.excerpt}</p>
    <div className="flex flex-col gap-2 border-t border-outline-variant pt-4 text-body-sm text-ink-muted dark:border-dark-outline-variant dark:text-dark-ink-muted sm:flex-row sm:items-center sm:gap-4">
     <div>
      <p className="font-semibold text-ink dark:text-dark-ink">{post.author}</p>
      <p className="text-label-caps">{post.role}</p>
     </div>
     <div className="flex flex-wrap items-center gap-3 text-label-caps uppercase sm:ml-auto">
      <span className="flex items-center gap-1">
       <Icon name="calendar_today" className="text-body-md leading-none" />
       {post.publishedAt}
      </span>
      <span className="flex items-center gap-1">
       <Icon name="schedule" className="text-body-md leading-none" />
       {post.readTime}
      </span>
     </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
     {post.tags.map((t) => (
      <StatusBadge key={t} variant="neutral">{t}</StatusBadge>
     ))}
    </div>
   </div>
  </article>
 );
}
