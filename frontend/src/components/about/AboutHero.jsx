import Icon from '../ui/Icon.jsx';

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-surface-container/20 py-12 sm:py-16 lg:py-20 dark:from-dark-surface-container dark:via-dark-surface dark:to-dark-surface">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Header content matching Image 1 */}
        <div className="mb-12 max-w-4xl">
          <div className="mb-5 inline-flex items-center rounded-full bg-orange-100/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
            About CoralSwift Technologies
          </div>

          <h1 className="mb-6 font-display text-4xl font-extrabold tracking-tight text-ink dark:text-dark-ink sm:text-5xl lg:text-6xl">
            Engineering Mission-Critical Systems for the{' '}
            <span className="text-[#FF5500]">Global</span>{' '}
            <span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">
              Economy
            </span>
          </h1>

          <p className="font-body text-body-lg leading-relaxed text-ink-muted dark:text-dark-ink-muted sm:text-xl">
            CoralSwift is an enterprise software services consultancy specializing in high-concurrency distributed systems, multi-cloud modernization, and applied generative AI pipelines. We bridge theoretical computer science with resilient, production-grade reality.
          </p>
        </div>

        {/* Mission & Vision Cards matching Image 1 */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Our Mission */}
          <div className="group relative overflow-hidden rounded-3xl border border-outline-variant/70 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-3 hover:border-orange-400/80 hover:shadow-2xl hover:shadow-orange-500/15 dark:border-dark-outline-variant/80 dark:bg-dark-surface dark:hover:border-orange-600/80 sm:p-10">
            {/* Top Border Gradient Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-brand transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 dark:bg-orange-950/50">
              <Icon name="track_changes" className="text-2xl" />
            </div>
            <h2 className="mb-4 font-display text-headline-md font-bold text-ink transition-colors duration-300 group-hover:text-brand dark:text-dark-ink dark:group-hover:text-orange-400">
              Our Mission
            </h2>
            <p className="font-body text-body-md leading-relaxed text-ink-muted dark:text-dark-ink-muted">
              To empower forward-thinking global enterprises to out-innovate their competitors by designing, delivering, and operating ultra-resilient, deterministic software systems that never fail under pressure.
            </p>
          </div>

          {/* Our Vision */}
          <div className="group relative overflow-hidden rounded-3xl border border-outline-variant/70 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-3 hover:border-rose-400/80 hover:shadow-2xl hover:shadow-rose-500/15 dark:border-dark-outline-variant/80 dark:bg-dark-surface dark:hover:border-rose-600/80 sm:p-10">
            {/* Top Border Gradient Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 dark:bg-rose-950/50">
              <Icon name="public" className="text-2xl" />
            </div>
            <h2 className="mb-4 font-display text-headline-md font-bold text-ink transition-colors duration-300 group-hover:text-rose-500 dark:text-dark-ink dark:group-hover:text-rose-400">
              Our Vision
            </h2>
            <p className="font-body text-body-md leading-relaxed text-ink-muted dark:text-dark-ink-muted">
              To be the world&apos;s most trusted technical authority for mission-critical enterprise platforms, setting the global benchmark for architectural discipline, zero-downtime operations, and ethical AI engineering.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

