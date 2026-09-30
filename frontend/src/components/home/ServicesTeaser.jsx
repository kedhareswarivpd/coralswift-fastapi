import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices } from '../../api/services.js';
import { services as demoServices } from '../../data/services.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

const FALLBACK_SERVICES = demoServices.map(({ slug, icon, category, themeColor, title, description }) => ({
  slug,
  icon,
  category: category || 'Engineering',
  themeColor: themeColor || 'orange',
  name: title,
  overview: description,
}));

const ICON_THEMES = {
  orange: {
    bg: 'bg-orange-50/80 dark:bg-orange-950/30',
    border: 'border-orange-200/60 dark:border-orange-900/40',
    icon: 'text-[#FF5500]',
    hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-[#FF5500] group-hover:to-orange-600 group-hover:text-white',
  },
  rose: {
    bg: 'bg-rose-50/80 dark:bg-rose-950/30',
    border: 'border-rose-200/60 dark:border-rose-900/40',
    icon: 'text-rose-500',
    hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-rose-500 group-hover:to-pink-600 group-hover:text-white',
  },
  emerald: {
    bg: 'bg-emerald-50/80 dark:bg-emerald-950/30',
    border: 'border-emerald-200/60 dark:border-emerald-900/40',
    icon: 'text-emerald-500',
    hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-white',
  },
  blue: {
    bg: 'bg-blue-50/80 dark:bg-blue-950/30',
    border: 'border-blue-200/60 dark:border-blue-900/40',
    icon: 'text-blue-500',
    hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-indigo-600 group-hover:text-white',
  },
  amber: {
    bg: 'bg-amber-50/80 dark:bg-amber-950/30',
    border: 'border-amber-200/60 dark:border-amber-900/40',
    icon: 'text-amber-500',
    hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-amber-500 group-hover:to-orange-500 group-hover:text-white',
  },
  purple: {
    bg: 'bg-purple-50/80 dark:bg-purple-950/30',
    border: 'border-purple-200/60 dark:border-purple-900/40',
    icon: 'text-purple-500',
    hoverBg: 'group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-violet-600 group-hover:text-white',
  },
};

export default function ServicesTeaser() {
  const [services, setServices] = useState(FALLBACK_SERVICES);

  useEffect(() => {
    fetchServices({ limit: 6 })
      .then((res) => {
        if (res?.data?.length) {
          // Merge API data with category metadata
          const merged = res.data.map((item, idx) => ({
            ...FALLBACK_SERVICES[idx % FALLBACK_SERVICES.length],
            ...item,
          }));
          setServices(merged);
        }
      })
      .catch(() => {});
  }, []);

  if (!services.length) return null;

  return (
    <section className="bg-slate-50/60 px-4 py-16 dark:bg-[#0B0F19] sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section Header matching coralswift.com */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/90 px-3.5 py-1 text-xs font-semibold text-[#FF5500] dark:border-orange-500/30 dark:bg-orange-950/40 dark:text-orange-400">
              Software Services & Capabilities
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Enterprise Software Capabilities
            </h2>
            <p className="mt-2.5 max-w-2xl text-base text-slate-600 dark:text-slate-400">
              End-to-end engineering excellence across modern cloud, artificial intelligence, and distributed architectures.
            </p>
          </div>
          <Link
            to="/services"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#FF5500] transition-colors hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300"
          >
            <span>Explore All Capabilities</span>
            <Icon name="arrow_forward" className="text-base transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>

        {/* 6 Capabilities Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const theme = ICON_THEMES[s.themeColor] || ICON_THEMES.orange;
            return (
              <Reveal key={s.slug || i} from="up" delay={i * 60}>
                <Link
                  to={`/services/${s.slug}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300/80 hover:shadow-[0_20px_40px_-15px_rgba(255,85,0,0.14)] dark:border-slate-800 dark:bg-[#111827] dark:hover:border-orange-500/40 dark:hover:shadow-[0_20px_40px_-15px_rgba(255,85,0,0.25)]"
                >
                  {/* Glowing Top Gradient Bar on hover */}
                  <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div>
                    {/* Top Row: Squircle Icon + Category Pill */}
                    <div className="mb-5 flex items-center justify-between">
                      <div
                        className={`flex size-14 items-center justify-center rounded-2xl border ${theme.border} ${theme.bg} ${theme.icon} ${theme.hoverBg} shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md`}
                      >
                        <Icon name={s.icon || 'apps'} className="text-2xl transition-transform duration-300" />
                      </div>
                      <span className="rounded-full border border-slate-100 bg-slate-100/90 px-3 py-1 text-xs font-medium text-slate-600 transition-colors duration-200 group-hover:border-slate-200 group-hover:bg-slate-200/80 group-hover:text-slate-800 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 dark:group-hover:bg-slate-700 dark:group-hover:text-slate-200">
                        {s.category || 'Capability'}
                      </span>
                    </div>

                    {/* Card Title */}
                    <h3 className="mb-2.5 font-display text-xl font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-[#FF5500] dark:text-white dark:group-hover:text-orange-400">
                      {s.name}
                    </h3>

                    {/* Card Description */}
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                      {s.overview}
                    </p>
                  </div>

                  {/* Bottom Subtitle / Feature hint */}
                  <div className="mt-6 flex items-center gap-1 text-xs font-medium text-slate-400 opacity-0 transition-all duration-300 group-hover:opacity-100 dark:text-slate-500">
                    <span className="text-[#FF5500] font-semibold">Explore architecture</span>
                    <Icon name="chevron_right" className="text-sm text-[#FF5500] transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
