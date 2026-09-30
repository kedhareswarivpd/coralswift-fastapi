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
    <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12">
      <SectionHeading align="center" eyebrow="Insights" title="From our blog" className="mx-auto mb-stack-xl" />
      <div className="grid gap-gutter md:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.slug} from="zoom" delay={i * 80}>
            <Link
              to={`/blog/${post.slug}`}
              className="card-interactive group flex h-full flex-col justify-between rounded-xl border border-outline-variant/80 bg-white p-6 dark:border-dark-outline-variant/80 dark:bg-dark-surface"
            >
              <div>
                <span className="font-label-caps text-xs uppercase tracking-wider text-brand">{post.category_name || post.category || 'Engineering'}</span>
                <h3 className="mt-2 font-display text-headline-sm font-semibold text-brand-dark transition-colors duration-200 group-hover:text-brand dark:text-dark-brand">
                  {post.title}
                </h3>
                {post.excerpt && <p className="mt-2 line-clamp-3 text-body-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">{post.excerpt}</p>}
              </div>
              <div className="mt-6 flex items-center gap-1.5 font-label-caps text-xs uppercase tracking-wider text-brand">
                <span>Read Article</span>
                <Icon name="arrow_forward" className="text-sm transition-transform duration-300 group-hover:translate-x-1.5" />
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-stack-xl flex justify-center">
        <Link to="/blog" className="group flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-3">
          Read More <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
