import Reveal from '../ui/Reveal.jsx';

export default function IndustriesHero() {
  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24 dark:bg-dark-surface">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
        <Reveal from="up" className="max-w-3xl">
          <div className="mb-4 inline-flex items-center rounded-full border border-orange-200/80 bg-orange-50/80 px-4 py-1.5 font-display text-xs font-semibold tracking-wide text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400">
            Sector Domain Expertise
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink dark:text-dark-ink sm:text-5xl lg:text-6xl leading-[1.12]">
            Deep Industry Knowledge,{' '}
            <span className="block mt-1">
              <span className="text-[#FF5500]">Precisely</span>{' '}
              <span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">
                Applied
              </span>
            </span>
          </h1>

          <p className="mt-6 max-w-2xl font-body text-base leading-relaxed text-ink-muted dark:text-dark-ink-muted sm:text-lg">
            We combine technical excellence with deep domain expertise across key industries, delivering solutions that address sector-specific challenges and regulatory requirements.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
