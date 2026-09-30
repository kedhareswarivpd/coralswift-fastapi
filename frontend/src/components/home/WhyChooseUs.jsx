import { whyChooseUs } from '../../data/home.js';
import Icon from '../ui/Icon.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function WhyChooseUs() {
 return (
  <section className="mx-auto max-w-container bg-white px-4 pb-section-padding pt-stack-xl dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12 ">
   <SectionHeading
    align="center"
    eyebrow="Why CoralSwift"
    title="Engineering excellence, proven at scale"
    description="Five years of high-performance delivery for enterprises that can't afford downtime."
    className="mx-auto mb-stack-xl"
   />
   <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
    {whyChooseUs.map((item, i) => (
     <Reveal key={item.title} from="zoom" delay={i * 80} className="flex flex-col rounded-lg bg-white p-stack-lg transition-shadow hover:shadow-card-hover dark:border dark:border-dark-outline-variant dark:bg-dark-surface">
      <div className="mb-stack-md flex size-12 items-center justify-center rounded-md border border-outline-variant bg-white shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface-container">
       <Icon name={item.icon} className="text-3xl leading-none text-brand" />
      </div>
      <h3 className="mb-2 min-h-16 font-display text-headline-sm text-brand-dark dark:text-white">{item.title}</h3>
      <p className="text-body-sm text-ink-muted dark:text-white/70">{item.description}</p>
     </Reveal>
    ))}
   </div>
  </section>
 );
}
