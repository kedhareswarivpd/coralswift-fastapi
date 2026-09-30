import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function TechGrid({ categories }) {
 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="space-y-stack-lg">
     {categories.map((cat, i) => (
      <Reveal key={cat.name} from="left" delay={i * 80}>
       <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
        <div className="flex items-center gap-3 border-b border-outline-variant bg-surface-container px-stack-lg py-4 dark:border-dark-outline-variant dark:bg-dark-surface-container">
         <Icon name={cat.icon} className="text-2xl text-brand" />
         <h3 className="font-display text-headline-sm font-bold tracking-wide text-brand-dark dark:text-dark-brand">{cat.name}</h3>
        </div>
        <div className="divide-y divide-outline-variant dark:divide-dark-outline-variant">
         {cat.technologies.map((tech) => (
          <div key={tech.name} className="flex items-center justify-between gap-4 px-stack-lg py-4">
           <div className="flex-1">
            <span className="font-body text-body-md font-semibold text-brand-dark dark:text-dark-brand">{tech.name}</span>
            <p className="mt-0.5 text-body-sm text-ink-muted dark:text-dark-ink-muted">{tech.description}</p>
           </div>
           <div className="flex flex-shrink-0 items-center gap-2">
            <div className="hidden h-2 w-24 overflow-hidden rounded-full bg-surface-container dark:bg-dark-surface-low sm:block">
             <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${tech.proficiency}%` }}
             />
            </div>
            <span className="w-10 text-right font-display text-body-sm font-semibold text-brand-dark dark:text-dark-brand sm:w-12 sm:text-body-lg">
             {tech.proficiency}%
            </span>
           </div>
          </div>
         ))}
        </div>
       </div>
      </Reveal>
     ))}
    </div>
   </div>
  </section>
 );
}
