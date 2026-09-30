import { whyChooseUs } from '../../data/home.js';
import Icon from '../ui/Icon.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-container bg-white px-4 pb-section-padding pt-stack-xl dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12">
      <SectionHeading
        align="center"
        eyebrow="Why CoralSwift"
        title="Engineering excellence, proven at scale"
        description="High-performance systems engineered for global enterprises that require zero downtime."
        className="mx-auto mb-stack-xl"
      />
      <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {whyChooseUs.map((item, i) => (
          <Reveal key={item.title} from="zoom" delay={i * 80}>
            <div className="card-interactive group relative flex h-full flex-col rounded-xl border border-outline-variant/80 bg-white p-stack-lg dark:border-dark-outline-variant/80 dark:bg-dark-surface">
              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-50 text-brand transition-all duration-300 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-[#FF5500] group-hover:to-[#E11D48] group-hover:text-white dark:bg-white/5 dark:text-orange-400">
                <Icon name={item.icon} className="text-2xl transition-transform duration-300" />
              </div>
              <h3 className="mb-2 font-display text-headline-sm font-semibold text-brand-dark transition-colors duration-200 group-hover:text-brand dark:text-white">
                {item.title}
              </h3>
              <p className="text-body-sm leading-relaxed text-ink-muted dark:text-white/70">
                {item.description}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
