export default function PortfolioHero() {
 return (
  <section className="relative overflow-hidden bg-brand px-4 py-stack-xl sm:px-6 lg:px-10 xl:px-12 ">
   <div className="animate-float-slow pointer-events-none absolute -right-16 -top-16 size-72 rounded-full bg-white/5 blur-3xl" />
   <div className="relative z-10 mx-auto grid max-w-container items-center gap-stack-lg md:grid-cols-2">
    <div className="flex flex-col gap-stack-md">
     <span className="animate-hero-1 font-label-caps text-label-caps uppercase text-accent-cyan">Project Portfolio</span>
     <h1 className="animate-hero-2 font-display text-headline-lg-mobile text-white md:text-headline-lg">
      Success Delivered: 430+ Projects Globally
     </h1>
     <p className="animate-hero-3 max-w-xl font-body text-body-lg text-surface-dim opacity-90">
      We engineer high-performance digital ecosystems for global leaders, transforming complex
      challenges into elegant technological triumphs.
     </p>
     <div className="animate-hero-4 mt-4 flex gap-4">
      <div className="flex flex-col">
       <span className="font-stat text-4xl text-white">18+</span>
       <span className="font-label-caps text-label-caps uppercase text-surface-dim opacity-70">
        Countries Served
       </span>
      </div>
      <div className="mx-4 h-12 w-px self-center bg-white/20" />
      <div className="flex flex-col">
       <span className="font-stat text-4xl text-white">98%</span>
       <span className="font-label-caps text-label-caps uppercase text-surface-dim opacity-70">
        Client Retention
       </span>
      </div>
     </div>
    </div>
    <div className="animate-hero-panel hidden justify-end md:flex">
     <div className="glass-panel animate-float w-full max-w-md rounded-lg p-8">
      <div className="mb-6 flex items-center justify-between">
       <span className="font-label-caps text-label-caps uppercase text-white">Real-time Pipeline</span>
       <span className="flex items-center gap-2 text-sm font-bold text-accent-cyan">
        <span className="size-2 animate-ping rounded-full bg-accent-cyan" /> LIVE
       </span>
      </div>
      <div className="space-y-4">
       <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="shimmer-bar h-full rounded-full bg-accent-cyan" />
       </div>
       <div className="flex justify-between font-label-caps text-label-caps uppercase text-surface-dim">
        <span>Active Deployments</span>
        <span>24 Units</span>
       </div>
       <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-accent-cyan/70" style={{ animation: 'shimmer-bar 1.4s cubic-bezier(0.22,1,0.36,1) 0.9s both', width: 0 }} />
       </div>
       <div className="flex justify-between font-label-caps text-label-caps uppercase text-surface-dim">
        <span>Security Audits</span>
        <span>12 Secured</span>
       </div>
      </div>
     </div>
    </div>
   </div>
  </section>
 );
}
