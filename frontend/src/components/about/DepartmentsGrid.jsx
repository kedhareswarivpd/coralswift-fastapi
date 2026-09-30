import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

const DEPARTMENTS = [
 { name: 'Engineering', icon: 'code', description: 'Software, cloud, and platform engineers building every product we ship.' },
 { name: 'Design', icon: 'palette', description: 'Product and UX designers turning complex workflows into intuitive interfaces.' },
 { name: 'Sales', icon: 'handshake', description: 'Building long-term partnerships with enterprise clients across every region.' },
 { name: 'Marketing', icon: 'campaign', description: 'Telling the CoralSwift story and generating demand for our services.' },
 { name: 'Human Resources', icon: 'groups', description: 'Hiring, developing, and supporting the people behind every engagement.' },
 { name: 'Finance', icon: 'account_balance', description: 'Managing billing, budgeting, and financial operations across the company.' },
 { name: 'Quality Assurance', icon: 'fact_check', description: 'Independent testing and quality gates before anything reaches production.' },
 { name: 'DevOps', icon: 'sync_alt', description: 'CI/CD pipelines, infrastructure automation, and production reliability.' },
 { name: 'Customer Support', icon: 'support_agent', description: '24×7 helpdesk and escalation support for every client engagement.' },
 { name: 'Management', icon: 'business_center', description: 'Leadership and project management steering delivery end-to-end.' },
];

export default function DepartmentsGrid() {
 return (
  <section className="bg-surface-container py-section-padding dark:bg-dark-surface-container">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-16 text-center">
     <span className="font-label-caps text-label-caps uppercase tracking-widest text-brand">Org Structure</span>
     <h2 className="mt-4 font-display text-headline-md text-brand-dark dark:text-dark-brand">Departments</h2>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-gutter lg:grid-cols-5">
     {DEPARTMENTS.map((dept, i) => (
      <Reveal key={dept.name} from="zoom" delay={i * 60} className="flex flex-col items-center gap-3 rounded-lg border border-outline-variant bg-white p-6 text-center dark:border-dark-outline-variant dark:bg-dark-surface">
       <div className="flex size-11 items-center justify-center rounded-lg bg-accent-cyan-pale">
        <Icon name={dept.icon} className="text-2xl text-brand" />
       </div>
       <h3 className="mb-3 flex min-h-16 items-center justify-center text-center font-display text-headline-sm text-brand-dark dark:text-dark-brand">{dept.name}</h3>
       <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{dept.description}</p>
      </Reveal>
     ))}
    </div>
   </div>
  </section>
 );
}
