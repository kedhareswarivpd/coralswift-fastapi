import { Link } from 'react-router-dom';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';

export default function AboutTeaser() {
  return (
    <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12">
      <div className="grid items-center gap-stack-xl md:grid-cols-2">
        <Reveal from="left">
          <SectionHeading
            eyebrow="Who We Are"
            title="Engineering excellence, delivered globally"
            description="CoralSwift Technologies is a digital transformation company founded in 2020, delivering secure, scalable enterprise software globally from our corporate headquarters in Sheridan, Wyoming."
          />
          <Link
            to="/about"
            className="group mt-6 flex w-fit items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-3"
          >
            More About Us <Icon name="arrow_forward" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
        <Reveal from="right" className="grid grid-cols-2 gap-4">
          {[
            { icon: 'work_history', label: '430+ Projects' },
            { icon: 'groups', label: '285+ Employees' },
            { icon: 'business_center', label: '120+ Clients' },
            { icon: 'public', label: '18+ Countries' },
          ].map((item, idx) => (
            <div
              key={item.label}
              style={{ animationDelay: `${idx * 100}ms` }}
              className="card-interactive group flex min-w-0 flex-col items-center gap-3 rounded-xl border border-outline-variant/80 bg-white p-6 text-center shadow-sm dark:border-dark-outline-variant/80 dark:bg-dark-surface"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-orange-50 text-brand transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#FF5500] group-hover:to-[#E11D48] group-hover:text-white dark:bg-white/5 dark:text-orange-400">
                <Icon name={item.icon} className="text-2xl transition-transform duration-300" />
              </div>
              <span className="font-display text-headline-sm font-bold text-brand-dark transition-colors duration-200 group-hover:text-brand dark:text-dark-brand">
                {item.label}
              </span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
