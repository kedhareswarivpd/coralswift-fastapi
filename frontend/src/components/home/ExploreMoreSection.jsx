import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

const NAV_EXPLORE_CATEGORIES = [
  {
    icon: 'layers',
    title: 'Services',
    description: 'Architectural specifications, multi-cloud practices, and software engineering.',
    to: '/services',
  },
  {
    icon: 'factory',
    title: 'Industries',
    description: 'Deep domain expertise across 16 key sectors, from financial services to healthcare.',
    to: '/industries',
  },
  {
    icon: 'analytics',
    title: 'Case Studies',
    description: 'Verified production outcomes and engineering transformation success stories.',
    to: '/case-studies',
  },
  {
    icon: 'work',
    title: 'Careers',
    description: 'Join an elite squad of distributed systems architects and cloud specialists.',
    to: '/careers',
  },
];

export default function ExploreMoreSection() {
  return (
    <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12">
      <SectionHeading
        align="center"
        eyebrow="Explore Core Expertise"
        title="Services, Industries, Case Studies &amp; Careers"
        className="mx-auto mb-stack-xl"
      />
      <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {NAV_EXPLORE_CATEGORIES.map((cat, i) => (
          <Reveal key={cat.title} from="up" delay={i * 80}>
            <Link
              to={cat.to}
              className="card-interactive group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-outline-variant/80 bg-white p-6 transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/80 hover:shadow-xl dark:border-dark-outline-variant/80 dark:bg-dark-surface"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div>
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-rose-500 group-hover:text-white dark:bg-orange-950/40 dark:text-orange-400">
                  <Icon name={cat.icon} className="text-2xl" />
                </div>
                <h3 className="mb-2 font-display text-headline-sm font-semibold text-ink transition-colors duration-200 group-hover:text-orange-600 dark:text-dark-ink dark:group-hover:text-orange-400">
                  {cat.title}
                </h3>
                <p className="text-body-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">
                  {cat.description}
                </p>
              </div>
              <span className="mt-6 flex items-center gap-1.5 font-label-caps text-xs uppercase tracking-wider text-orange-600 dark:text-orange-400">
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
