import { useState } from 'react';
import { SkeletonCard } from '../ui/Skeleton.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';
import BlogCard from './BlogCard.jsx';

export default function BlogGrid({ posts, categories }) {
 const [activeCategory, setActiveCategory] = useState('All');
 const [query, setQuery] = useState('');
 if (!posts) {
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
 if (!posts.length) return <EmptyState icon="article" title="No blog posts yet" description="Stay tuned!" />;

 const byCategory = activeCategory === 'All'
  ? posts
  : posts.filter((p) => p.category === activeCategory);

 const q = query.trim().toLowerCase();
 const filtered = q
  ? byCategory.filter((p) =>
    p.title?.toLowerCase().includes(q) ||
    p.excerpt?.toLowerCase().includes(q) ||
    p.tags?.some((t) => t.toLowerCase().includes(q)))
  : byCategory;

 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-stack-lg flex justify-center">
     <div className="relative w-full max-w-md">
      <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted dark:text-dark-ink-muted" />
      <input
       type="search"
       value={query}
       onChange={(e) => setQuery(e.target.value)}
       placeholder="Search articles..."
       aria-label="Search blog posts"
       className="w-full rounded-full border border-outline-variant bg-white py-3 pl-12 pr-4 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink"
      />
     </div>
    </div>
    <div className="mb-stack-lg flex flex-wrap gap-2">
     {categories.map((cat) => (
      <button
       key={cat}
       onClick={() => setActiveCategory(cat)}
       className={`rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
        activeCategory === cat
         ? 'bg-brand text-white'
         : 'bg-brand-dark text-white hover:bg-brand dark:bg-dark-surface-container dark:text-white dark:hover:bg-dark-outline-variant'
       }`}
      >
       {cat}
      </button>
     ))}
    </div>
    {filtered.length === 0 ? (
     <EmptyState icon="search_off" title="No matching posts" description="Try a different search term or category." />
    ) : (
     <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((post, i) => (
       <Reveal key={post.slug} from="zoom" delay={i * 80}>
        <BlogCard post={post} />
       </Reveal>
      ))}
     </div>
    )}
   </div>
  </section>
 );
}
