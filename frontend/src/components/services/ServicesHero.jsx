import Badge from '../ui/Badge.jsx';
import Icon from '../ui/Icon.jsx';

export default function ServicesHero() {
 return (
  <section className="relative overflow-hidden bg-brand-dark px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
   <div className="animate-float-slow pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-accent-cyan/10 blur-3xl" />
   <div className="mx-auto grid max-w-container items-center gap-stack-lg md:grid-cols-2">
    <div className="flex flex-col gap-stack-md">
     <Badge className="animate-hero-1 w-fit bg-accent-cyan-pale text-brand">High-Performance Engineering</Badge>
     <h1 className="animate-hero-2 font-display text-display-lg-mobile text-white md:text-display-lg">Our Technology Offerings</h1>
     <p className="animate-hero-3 max-w-xl font-body text-body-lg text-white">
      Engineered for scale, security, and velocity. We bridge the gap between complex enterprise needs
      and cutting-edge digital implementation.
     </p>
    </div>
    <div className="animate-hero-panel hidden md:block">
     <div className="glass-panel-light animate-float flex flex-col gap-stack-md rounded-lg p-stack-lg">
      <div className="flex items-center justify-between border-b border-brand/20 pb-stack-sm">
       <span className="font-label-caps text-label-caps uppercase text-brand-dark">Real-time Delivery Metrics</span>
        <Icon name="bolt" className="text-brand" />
      </div>
      <div className="grid grid-cols-2 gap-stack-md">
       <div>
        <p className="font-display text-headline-lg text-brand-dark">
         99.9<span className="text-brand">%</span>
        </p>
        <p className="font-label-caps text-label-caps uppercase text-ink-muted">Uptime SLA</p>
       </div>
       <div>
        <p className="font-display text-headline-lg text-brand-dark">24/7</p>
        <p className="font-label-caps text-label-caps uppercase text-ink-muted">Global Monitoring</p>
       </div>
      </div>
     </div>
    </div>
   </div>
  </section>
 );
}
