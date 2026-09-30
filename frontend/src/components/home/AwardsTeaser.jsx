import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAwards } from '../../api/cms.js';
import SectionHeading from '../ui/SectionHeading.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function AwardsTeaser() {
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    fetchAwards({ limit: 4 })
      .then((res) => setAwards(res?.data || []))
      .catch(() => {});
  }, []);

  if (!awards.length) return null;

  return (
    <section className="bg-surface-container px-4 py-section-padding dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-container">
        <SectionHeading align="center" eyebrow="Recognition" title="Awards & certifications" className="mx-auto mb-stack-xl" />
        <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {awards.map((a, i) => (
            <Reveal key={a.id} from="up" delay={i * 80}>
              <div className="card-interactive group flex h-full flex-col items-center gap-3 rounded-xl border border-outline-variant/80 bg-white p-6 text-center dark:border-dark-outline-variant/80 dark:bg-dark-surface">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-brand transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#FF5500] group-hover:to-[#E11D48] group-hover:text-white dark:bg-white/5 dark:text-orange-400">
                  <Icon name="emoji_events" className="text-3xl transition-transform duration-300" />
                </div>
                <h3 className="font-display text-headline-sm font-semibold text-brand-dark transition-colors duration-200 group-hover:text-brand dark:text-dark-brand">
                  {a.title}
                </h3>
                {a.year && <span className="font-label-caps text-xs uppercase tracking-wider text-ink-muted dark:text-dark-ink-muted">{a.year}</span>}
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-stack-xl flex justify-center">
          <Link to="/awards" className="group flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-3">
            View All Awards <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
