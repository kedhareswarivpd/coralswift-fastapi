import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';

const IMPACTS = [
 { value: '285', label: 'Employees', icon: 'groups', desc: 'A deep bench of AI, cloud, cybersecurity, and enterprise architecture experts.' },
 { value: '430', label: 'Projects', icon: 'rocket_launch', desc: 'Enterprise-grade solutions shipped on time and on budget across industries.' },
 { value: '120', label: 'Clients', icon: 'business_center', desc: 'Long-term partnerships with organizations that can\'t afford downtime.' },
 { value: '35', label: 'Partners', icon: 'handshake', desc: 'A global ecosystem of technology and delivery partners.' },
 { value: '18', label: 'Countries', icon: 'public', desc: 'Delivery hubs and client engagements spanning six continents.' },
 { value: '5', label: 'Years', icon: 'emoji_events', desc: 'Founded in 2020. ISO 9001 & 27001 certified since 2022.' },
 { value: '98%', label: 'Success Rate', icon: 'verified', desc: 'Projects delivered on scope, on budget, and on schedule.' },
];

export default function ImpactStats() {
 return (
  <section id="our-impact" className="bg-surface-low py-section-padding dark:bg-dark-surface-low">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <Reveal from="up" className="mb-stack-xl text-center">
     <span className="mb-3 block font-label-caps text-label-caps uppercase text-brand">Our Impact</span>
     <h2 className="font-display text-headline-md text-brand-dark dark:text-dark-brand">
      Numbers that define our journey
     </h2>
     <p className="mx-auto mt-4 max-w-2xl text-body-lg text-ink-muted dark:text-dark-ink-muted">
      Five years of high-performance delivery for enterprises that can&apos;t afford downtime.
     </p>
    </Reveal>
    <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
     {IMPACTS.map((item, i) => (
      <Reveal key={item.label} from="zoom" delay={i * 80}>
       <div className="group flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2.5 hover:border-brand/40 hover:shadow-xl dark:border-slate-800 dark:bg-dark-surface dark:hover:border-brand/40 dark:hover:shadow-black/50 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-xl bg-accent-cyan-pale transition-transform duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-white">
          <Icon name={item.icon} className="text-2xl text-brand transition-colors duration-300 group-hover:text-white" />
        </div>
        <div className="font-stat text-4xl font-extrabold text-brand-dark transition-colors duration-300 group-hover:text-brand dark:text-dark-brand">{item.value}</div>
        <div>
         <p className="mb-1 font-display text-headline-sm font-bold text-brand-dark dark:text-dark-brand">{item.label}</p>
         <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{item.desc}</p>
        </div>
       </div>
      </Reveal>
     ))}
    </div>
   </div>
  </section>
 );
}
