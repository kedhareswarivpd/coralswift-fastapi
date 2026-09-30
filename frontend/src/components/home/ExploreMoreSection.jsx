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
  <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
   <SectionHeading align="center" eyebrow="Explore More" title="Solutions, industries, products & technologies" className="mx-auto mb-stack-xl" />
   <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
    {CATEGORIES.map((cat, i) => (
     <Reveal key={cat.title} from="up" delay={i * 80}>
      <Link
       to={cat.to}
       className="flex h-full flex-col gap-3 rounded-lg border border-outline-variant bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface"
      >
       <div className="flex size-11 items-center justify-center rounded-lg bg-accent-cyan-pale">
        <Icon name={cat.icon} className="text-2xl text-brand" />
       </div>
       <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{cat.title}</h3>
       <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{cat.description}</p>
       <span className="mt-auto flex items-center gap-1 font-label-caps text-label-caps uppercase text-brand">
        Explore <Icon name="arrow_forward" className="text-base" />
       </span>
      </Link>
     </Reveal>
    ))}
   </div>
  </section>
 );
}
