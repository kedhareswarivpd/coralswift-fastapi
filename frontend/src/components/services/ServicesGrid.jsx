import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { services as fallbackServices } from '../../data/services.js';
import { fetchServices } from '../../api/services.js';
import { adaptService } from '../../api/adapters.js';
import useApiResource from '../../hooks/useApiResource.js';
import ServiceCard from './ServiceCard.jsx';
import Reveal from '../ui/Reveal.jsx';
import { SkeletonCard } from '../ui/Skeleton.jsx';

const CATEGORIES = [
  { id: 'all', label: 'All Services' },
  {
    id: 'software-development',
    label: 'Software Development',
    keywords: ['software', 'custom', 'web', 'mobile', 'api', 'qa', 'ui', 'erp', 'crm', 'engineering', 'distributed', 'app'],
  },
  {
    id: 'cloud-infrastructure',
    label: 'Cloud & Infrastructure',
    keywords: ['cloud', 'infrastructure', 'devops', 'migration', 'architecture'],
  },
  {
    id: 'ai-solutions',
    label: 'AI & Automation',
    keywords: ['ai', 'artificial', 'machine learning', 'automation', 'ml'],
  },
  {
    id: 'cyber-security',
    label: 'Cybersecurity',
    keywords: ['cyber', 'security', 'trust', 'governance', 'defense'],
  },
  {
    id: 'data-analytics',
    label: 'Data & Analytics',
    keywords: ['data', 'analytics', 'intelligence', 'bi', 'lakehouse'],
  },
];

export default function ServicesGrid() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const { items: services, loading, isFallback } = useApiResource(fetchServices, adaptService, fallbackServices);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (activeCategory === 'all') return services;

    const catObj = CATEGORIES.find((c) => c.id === activeCategory);
    if (!catObj) return services;

    return services.filter((s) => {
      const textToSearch = [
        s.category,
        s.title,
        s.name,
        s.slug,
        s.description,
        s.overview,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return catObj.keywords.some((kw) => textToSearch.includes(kw));
    });
  }, [services, activeCategory]);

  const handleCategoryChange = (catId) => {
    if (catId === 'all') {
      searchParams.delete('category');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: catId });
    }
  };

  return (
    <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12">
      <div className="mb-10 text-center">
        <p className="mx-auto max-w-2xl font-body text-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted sm:text-base">
          Select any service to view architectural specifications, delivery stages, and engagement prerequisites.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-2.5">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`rounded-full px-5 py-2 font-display text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:border-orange-400 hover:text-orange-600 dark:bg-dark-surface dark:text-slate-300 dark:border-slate-800 dark:hover:border-orange-500'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {isFallback && !loading && (
        <p className="mb-6 text-center text-body-sm text-ink-muted dark:text-dark-ink-muted">
          Showing sample services — connect a live backend to see real service data here.
        </p>
      )}

      {loading ? (
        <ServicesGridSkeleton />
      ) : filteredServices.length === 0 ? (
        <div className="py-12 text-center text-ink-muted dark:text-dark-ink-muted">
          No services found matching this category.
        </div>
      ) : (
        <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service, i) => (
            <Reveal key={service.slug || service.title} style={{ transitionDelay: `${i * 60}ms` }}>
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function ServicesGridSkeleton() {
  return (
    <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

