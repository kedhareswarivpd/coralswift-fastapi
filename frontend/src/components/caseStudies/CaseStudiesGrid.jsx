import Reveal from '../ui/Reveal.jsx';
import CaseStudyCard from './CaseStudyCard.jsx';

export default function CaseStudiesGrid({ studies }) {
  return (
    <section className="bg-surface-container/20 py-16 sm:py-20 lg:py-24 dark:bg-dark-surface-container/20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {studies.map((s, i) => (
            <Reveal key={s.slug || s.title} from="up" delay={i * 60}>
              <CaseStudyCard study={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
