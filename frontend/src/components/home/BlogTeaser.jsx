import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../api/client.js';
import { posts as fallbackPosts } from '../../data/blog.js';
import SectionHeading from '../ui/SectionHeading.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function BlogTeaser() {
 const [posts, setPosts] = useState([]);

 useEffect(() => {
  apiRequest('/blogs?limit=3')
   .then((res) => setPosts(res?.data?.length ? res.data : fallbackPosts.slice(0, 3)))
   .catch(() => setPosts(fallbackPosts.slice(0, 3)));
 }, []);

 if (!posts.length) return null;

 return (
  <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
   <SectionHeading align="center" eyebrow="Insights" title="From our blog" className="mx-auto mb-stack-xl" />
   <div className="grid gap-gutter md:grid-cols-3">
    {posts.map((post, i) => (
     <Reveal key={post.slug} from="zoom" delay={i * 80}>
      <Link
       to={`/blog/${post.slug}`}
       className="flex h-full flex-col gap-2 rounded-lg border border-outline-variant bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface"
      >
       <span className="font-label-caps text-label-caps uppercase text-brand">{post.category_name || post.category || 'Blog'}</span>
       <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{post.title}</h3>
       {post.excerpt && <p className="line-clamp-3 text-body-sm text-ink-muted dark:text-dark-ink-muted">{post.excerpt}</p>}
      </Link>
     </Reveal>
    ))}
   </div>
   <div className="mt-stack-xl flex justify-center">
    <Link to="/blog" className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-3">
     Read More <Icon name="arrow_forward" />
    </Link>
   </div>
  </section>
 );
}
