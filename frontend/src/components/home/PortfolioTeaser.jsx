import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects } from '../../api/projects.js';
import SectionHeading from '../ui/SectionHeading.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function PortfolioTeaser() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects({ limit: 3, is_published: true })
      .then((res) => setProjects(res?.data || []))
      .catch(() => {});
  }, []);

  if (!projects.length) return null;

  return (
    <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12">
      <SectionHeading align="center" eyebrow="Our Work" title="Recent projects & portfolio" className="mx-auto mb-stack-xl" />
      <div className="grid gap-gutter md:grid-cols-3">
        {projects.map((p, i) => (
          <Reveal key={p.id} from="zoom" delay={i * 80}>
            <Link
              to={`/portfolio/success/${p.slug}`}
              className="card-interactive group flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant/80 bg-white transition-all duration-300 dark:border-dark-outline-variant/80 dark:bg-dark-surface"
            >
              {p.cover_image && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={p.cover_image}
                    alt={p.title}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  {p.industry && <span className="font-label-caps text-xs uppercase tracking-wider text-brand">{p.industry}</span>}
                  <h3 className="mt-1 font-display text-headline-sm font-semibold text-brand-dark transition-colors duration-200 group-hover:text-brand dark:text-dark-brand">
                    {p.title}
                  </h3>
                  {p.overview && <p className="mt-2 line-clamp-2 text-body-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">{p.overview}</p>}
                </div>
                <div className="mt-6 flex items-center gap-1.5 font-label-caps text-xs uppercase tracking-wider text-brand">
                  <span>View Case Study</span>
                  <Icon name="arrow_forward" className="text-sm transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
      <div className="mt-stack-xl flex justify-center gap-6">
        <Link to="/portfolio" className="group flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-3">
          View Portfolio <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
