export default function CaseStudiesHero() {
 return (
  <section className="relative overflow-hidden bg-brand-dark pb-section-padding pt-32 text-white">
   <div className="animate-float-slow pointer-events-none absolute right-10 top-10 size-64 rounded-full bg-white/5 blur-3xl" />
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="max-w-3xl">
     <span className="animate-hero-1 block font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">Case Studies</span>
     <h1 className="animate-hero-2 mb-6 mt-4 font-display text-headline-lg text-white md:text-display-lg">
      Real Impact. Real Results.
     </h1>
     <p className="animate-hero-3 max-w-2xl text-body-lg text-white/80">
      Explore how we have helped enterprises across industries transform their technology
      infrastructure, reduce costs, and accelerate innovation.
     </p>
    </div>
   </div>
  </section>
 );
}
