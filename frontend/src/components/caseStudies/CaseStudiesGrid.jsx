import Reveal from '../ui/Reveal.jsx';
import CaseStudyCard from './CaseStudyCard.jsx';

export default function CaseStudiesGrid({ studies }) {
 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
     {studies.map((s, i) => (
      <Reveal key={s.slug} from="zoom" delay={i * 80}>
       <CaseStudyCard study={s} />
      </Reveal>
     ))}
    </div>
   </div>
  </section>
 );
}
