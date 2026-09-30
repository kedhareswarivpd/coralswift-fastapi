import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices } from '../../api/services.js';
import { services as demoServices } from '../../data/services.js';
import SectionHeading from '../ui/SectionHeading.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

const FALLBACK_SERVICES = demoServices.map(({ slug, icon, title, description }) => ({
  slug,
  icon,
  name: title,
  overview: description,
}));

export default function ServicesTeaser() {
  const [services, setServices] = useState(FALLBACK_SERVICES);

  useEffect(() => {
    fetchServices({ limit: 6 })
      .then((res) => {
        if (res?.data?.length) setServices(res.data);
      })
      .catch(() => {});
  }, []);

  if (!services.length) return null;

  return (
    <section className="bg-surface-container px-4 py-section-padding dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-container">
        <SectionHeading align="center" eyebrow="What We Do" title="Services built for enterprise scale" className="mx-auto mb-stack-xl" />
        <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} from="zoom" delay={i * 60}>
              <Link
                to={`/services/${s.slug}`}
                className="card-interactive group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-outline-variant/80 bg-white p-6 dark:border-dark-outline-variant/80 dark:bg-dark-surface"
              >
                <div>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-50 text-brand transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#FF5500] group-hover:to-[#E11D48] group-hover:text-white dark:bg-white/5 dark:text-orange-400">
                    <Icon name={s.icon || 'apps'} className="text-2xl transition-transform duration-300" />
                  </div>
                  <h3 className="mb-2 font-display text-headline-sm font-semibold text-brand-dark transition-colors duration-200 group-hover:text-brand dark:text-dark-brand">
                    {s.name}
                  </h3>
                  <p className="text-body-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">
                    {s.overview}
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-1.5 font-label-caps text-xs uppercase tracking-wider text-brand">
                  <span>Learn More</span>
                  <Icon name="arrow_forward" className="text-sm transition-transform duration-300 group-hover:translate-x-1.5" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-stack-xl flex justify-center">
          <Link to="/services" className="group flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-3">
            View All Services <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
