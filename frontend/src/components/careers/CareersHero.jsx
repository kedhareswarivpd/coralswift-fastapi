import Icon from '../ui/Icon.jsx';

const CAREER_BENEFITS = [
  {
    icon: 'public',
    colorClass: 'bg-orange-100 text-orange-500 dark:bg-orange-950/50 dark:text-orange-400',
    title: 'Remote-First Culture',
    description: 'Work from anywhere with top-tier hardware and a $3,000 home office stipend.',
  },
  {
    icon: 'workspace_premium',
    colorClass: 'bg-rose-100 text-rose-500 dark:bg-rose-950/50 dark:text-rose-400',
    title: 'Principal-Level Impact',
    description: 'Collaborate directly with enterprise leadership and architect high-scale distributed backends.',
  },
  {
    icon: 'favorite',
    colorClass: 'bg-indigo-100 text-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-400',
    title: 'Comprehensive Benefits',
    description: '100% health/dental coverage, 401(k) matching, and unlimited PTO with mandatory minimums.',
  },
  {
    icon: 'school',
    colorClass: 'bg-emerald-100 text-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-400',
    title: 'Continuous Growth',
    description: '$5,000 annual budget for conferences, technical research, and certifications.',
  },
];

export default function CareersHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-surface-container/20 pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24 dark:from-dark-surface-container dark:via-dark-surface dark:to-dark-surface">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Header content matching screenshot */}
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex items-center rounded-full bg-orange-100/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
            We Are Hiring
          </div>

          <h1 className="mb-6 font-display text-4xl font-extrabold tracking-tight text-ink dark:text-dark-ink sm:text-5xl lg:text-6xl">
            Build Systems That Power{' '}
            <span className="block mt-1">
              <span className="text-[#FF5500]">Global</span>{' '}
              <span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">
                Commerce
              </span>
            </span>
          </h1>

          <p className="font-body text-body-lg leading-relaxed text-ink-muted dark:text-dark-ink-muted sm:text-xl">
            Join an elite consultancy of distributed systems architects, cloud platform engineers, and applied AI specialists. We tackle high-concurrency challenges with extreme architectural rigor.
          </p>
        </div>

        {/* 4 Value Cards Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CAREER_BENEFITS.map((item) => (
            <div
              key={item.title}
              className="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-outline-variant/70 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-3 hover:border-orange-400/80 hover:shadow-2xl hover:shadow-orange-500/15 dark:border-dark-outline-variant/80 dark:bg-dark-surface sm:p-8"
            >
              {/* Top Border Gradient Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              <div>
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.colorClass} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                  <Icon name={item.icon} className="text-2xl" />
                </div>
                <h3 className="mb-3 font-display text-lg font-bold text-ink transition-colors duration-300 group-hover:text-brand dark:text-dark-ink dark:group-hover:text-orange-400">
                  {item.title}
                </h3>
                <p className="font-body text-xs text-ink-muted leading-relaxed dark:text-dark-ink-muted sm:text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

