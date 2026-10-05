export default function SolutionsHero() {
 return (
  <section className="relative overflow-hidden bg-white pb-section-padding pt-32 text-slate-900 dark:bg-[#070B14] dark:text-white">
   <div className="animate-float-slow pointer-events-none absolute right-10 top-10 size-64 rounded-full bg-orange-500/10 blur-3xl" />
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="max-w-3xl">
     <span className="animate-hero-1 block font-label-caps text-label-caps uppercase tracking-widest font-semibold text-[#FF5500] dark:text-orange-400">What We Deliver</span>
     <h1 className="animate-hero-2 mb-6 mt-4 font-display text-headline-lg font-extrabold text-slate-900 dark:text-white md:text-display-lg">
      Enterprise Solutions That Drive <span className="block mt-1 sm:inline"><span className="text-[#FF5500]">Digital</span> <span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">Transformation</span></span>
     </h1>
     <p className="animate-hero-3 max-w-2xl text-body-lg text-slate-600 dark:text-slate-300">
      From cloud migration to AI-powered analytics, our comprehensive suite of solutions helps enterprises
      modernize, secure, and scale their operations in an increasingly digital world.
     </p>
    </div>
   </div>
  </section>
 );
}
