import Icon from '../ui/Icon.jsx';
import SectionHeading from '../ui/SectionHeading.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function CultureSection({ values, benefits }) {
 return (
  <>
   <section className="bg-surface-container py-section-padding dark:bg-dark-surface-container">
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
     <SectionHeading
      eyebrow="Our Culture"
      title="Life at CoralSwift"
      description="We believe great technology comes from great teams. Here is what makes working with us unique."
      align="center"
      className="mb-stack-lg"
     />
     <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-4">
      {values.map((v, i) => (
       <Reveal key={v.title} from="zoom" delay={i * 80} className="h-full">
        <div className="flex h-full flex-col items-center rounded-lg border border-outline-variant bg-white p-stack-lg text-center dark:border-dark-outline-variant dark:bg-dark-surface">
         <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-accent-cyan-pale">
          <Icon name={v.icon} className="text-2xl text-brand" />
         </div>
         <h3 className="mb-2 flex min-h-16 items-center font-display text-headline-sm text-brand-dark dark:text-dark-brand">{v.title}</h3>
         <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{v.description}</p>
        </div>
       </Reveal>
      ))}
     </div>
    </div>
   </section>

   <section className="py-section-padding">
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
     <SectionHeading
      eyebrow="Benefits"
      title="We Invest in Our People"
      description="Comprehensive benefits designed to support your growth, well-being, and future."
      align="center"
      className="mb-stack-lg"
     />
     <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
      {benefits.map((b, i) => (
       <Reveal key={b.title} from="left" delay={i * 80}>
        <div className="flex items-start gap-4 rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
         <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent-cyan-pale">
          <Icon name={b.icon} className="text-xl text-brand" />
         </div>
         <div>
          <h3 className="mb-1 font-body text-body-md font-semibold text-brand-dark dark:text-dark-brand">{b.title}</h3>
          <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{b.description}</p>
         </div>
        </div>
       </Reveal>
      ))}
     </div>
    </div>
   </section>
  </>
 );
}
