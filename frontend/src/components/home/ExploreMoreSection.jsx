import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

const CATEGORIES = [
  { icon: 'hub', title: 'Solutions', description: 'End-to-end solution blueprints for common enterprise transformation goals.', to: '/solutions' },
  { icon: 'factory', title: 'Industries', description: 'Deep domain expertise across 16 industries, from finance to healthcare.', to: '/industries' },
  { icon: 'inventory', title: 'Products', description: 'Reusable accelerators and platforms that shorten delivery timelines.', to: '/products' },
  { icon: 'memory', title: 'Technologies', description: 'The languages, frameworks, and cloud platforms our teams build with.', to: '/technologies' },
];

export default function ExploreMoreSection() {
  return (
    <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12">
      <SectionHeading align="center" eyebrow="Explore More" title="Solutions, industries, products & technologies" className="mx-auto mb-stack-xl" />
      <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat, i) => (
          <Reveal key={cat.title} from="up" delay={i * 80}>
            <Link
              to={cat.to}
              className="card-interactive group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-outline-variant/80 bg-white p-6 dark:border-dark-outline-variant/80 dark:bg-dark-surface"
            >
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-50 text-brand transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#FF5500] group-hover:to-[#E11D48] group-hover:text-white dark:bg-white/5 dark:text-orange-400">
                  <Icon name={cat.icon} className="text-2xl transition-transform duration-300" />
                </div>
                <h3 className="mb-2 font-display text-headline-sm font-semibold text-brand-dark transition-colors duration-200 group-hover:text-brand dark:text-dark-brand">
                  {cat.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">
                  {cat.description}
                </p>
              </div>
              <span className="mt-6 flex items-center gap-1.5 font-label-caps text-xs uppercase tracking-wider text-brand">
                <span>Explore</span>
                <Icon name="arrow_forward" className="text-sm transition-transform duration-300 group-hover:translate-x-1.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
