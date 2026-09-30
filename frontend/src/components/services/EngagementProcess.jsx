import { engagementProcess } from '../../data/services.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function EngagementProcess() {
 return (
  <section className="relative overflow-hidden bg-brand-dark px-4 py-section-padding text-white sm:px-6 lg:px-10 xl:px-12 ">
   <div className="animate-float-slow pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-white/5 blur-3xl" />
   <div className="relative z-10 mx-auto max-w-container">
    <Reveal className="mb-16 text-center">
     <h2 className="mb-4 font-display text-headline-md text-accent-cyan">Our Engineering Lifecycle</h2>
     <p className="mx-auto max-w-2xl font-body text-white">
      A rigorous, transparent framework designed for predictability and excellence at every stage.
     </p>
    </Reveal>
    <div className="relative">
     <div className="process-line absolute left-0 top-1/2 z-0 hidden h-[2px] w-full -translate-y-1/2 opacity-20 md:block" />
     <div className="relative z-10 grid gap-stack-lg md:grid-cols-5">
      {engagementProcess.map((step, i) => (
       <Reveal key={step.step} from="up" delay={i * 100}>
        <div className="group flex flex-col items-center text-center">
         <div className="mb-stack-md flex size-16 items-center justify-center rounded-full border-2 border-accent-cyan bg-brand-dark transition-transform group-hover:scale-110">
          <Icon name={step.icon} className="text-accent-cyan" />
         </div>
         <h4 className="mb-2 font-display text-body-lg font-semibold text-white">
          {step.step} {step.title}
         </h4>
         <p className="text-body-sm text-white">{step.description}</p>
        </div>
       </Reveal>
      ))}
     </div>
    </div>
   </div>
  </section>
 );
}
