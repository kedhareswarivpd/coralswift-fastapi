import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';

const MILESTONES = [
  {
    year: '2020',
    title: 'Founded in San Francisco',
    description: 'Established with a core squad of distributed systems architects.',
  },
  {
    year: '2022',
    title: 'Expanded Multi-Cloud Practice',
    description: 'Delivered zero-downtime migrations for Fortune 500 financial and retail enterprises.',
  },
  {
    year: '2024',
    title: 'Applied AI & LLM Center of Excellence',
    description: 'Pioneered deterministic RAG pipelines and enterprise GPU inference infrastructure.',
  },
  {
    year: '2026',
    title: 'Global Enterprise Scale',
    description: 'Over 100M+ daily transactions processed across client platforms with 99.999% verified uptime.',
  },
];

const TRUSTED_CLIENTS = [
  { name: 'Meridian Health Group', tag: 'Patient Portals & EHR' },
  { name: 'Vantage Retail Co', tag: 'Omnichannel Retail' },
  { name: 'Sterling Finance Corp', tag: 'Core Ledger Modernization' },
  { name: 'Northwind Logistics', tag: 'WMS & Supply Chain' },
  { name: 'Harbor Insurance Partners', tag: 'Claims Automation' },
  { name: 'Ridgeline Manufacturing', tag: 'IoT Predictive Maintenance' },
  { name: 'Apex Financial Global', tag: 'High-Frequency Core' },
  { name: 'VPD Technologies', tag: 'Strategic Partner' },
];

export default function JourneyMilestones() {
  const marqueeItems = [...TRUSTED_CLIENTS, ...TRUSTED_CLIENTS];

  return (
    <section className="bg-surface-container/20 py-16 sm:py-20 lg:py-24 dark:bg-dark-surface-container/20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Header */}
        <Reveal from="up" className="mb-12 text-center">
          <div className="mb-3 inline-flex items-center rounded-full border border-orange-200/80 bg-orange-50/80 px-4 py-1 text-xs font-semibold tracking-wide text-orange-600 dark:border-orange-800/80 dark:bg-orange-950/40 dark:text-orange-400">
            Our Evolution
          </div>
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-extrabold tracking-tight text-ink dark:text-dark-ink sm:text-4xl lg:text-5xl">
            Our Journey &amp; Milestones
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-body-md text-ink-muted dark:text-dark-ink-muted">
            A timeline of architectural breakthroughs and enterprise engineering impact.
          </p>
        </Reveal>

        {/* Milestones Stack with Timeline Line */}
        <div className="relative mx-auto max-w-3xl space-y-5">
          {/* Vertical Connecting Timeline Line */}
          <div className="absolute left-8 sm:left-[4.5rem] top-6 bottom-6 hidden w-0.5 bg-gradient-to-b from-orange-300 via-orange-200 to-slate-200 dark:from-orange-800 dark:via-orange-900/40 dark:to-slate-800 sm:block" />

          {MILESTONES.map((item, i) => (
            <Reveal key={item.year} from="up" delay={i * 80}>
              <div className="group relative overflow-hidden flex items-center justify-between gap-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/90 hover:bg-gradient-to-r hover:from-orange-50/60 hover:via-white hover:to-white hover:shadow-2xl hover:shadow-orange-500/15 dark:border-dark-outline-variant/80 dark:bg-dark-surface dark:hover:from-orange-950/20 dark:hover:via-dark-surface dark:hover:to-dark-surface sm:px-8 sm:py-6">
                {/* Left Border Gradient Accent Line (Visible ON HOVER) */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-3xl bg-gradient-to-b from-orange-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="flex items-center gap-6 z-10">
                  <span className="shrink-0 rounded-2xl border border-orange-200/80 bg-orange-50/80 px-4 py-2 font-display text-sm font-bold text-orange-600 shadow-xs transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-[#FF5500] group-hover:via-[#E11D48] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400 sm:px-5 sm:py-2.5">
                    {item.year}
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-ink transition-colors duration-300 group-hover:text-orange-600 dark:text-dark-ink dark:group-hover:text-orange-400 sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 font-body text-xs leading-relaxed text-ink-muted dark:text-dark-ink-muted sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="hidden shrink-0 h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50/80 text-slate-400 transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-[#FF5500] group-hover:via-[#E11D48] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30 group-hover:scale-110 group-hover:translate-x-1 dark:border-slate-800 dark:bg-dark-surface-container sm:flex">
                  <Icon name="arrow_forward" className="text-base" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Strategic Global Alliance Banner */}
        <Reveal from="up" delay={200} className="mt-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-outline-variant/70 bg-gradient-to-r from-orange-50/40 via-white to-orange-50/20 p-8 shadow-sm dark:border-dark-outline-variant/80 dark:bg-dark-surface md:flex-row md:items-center sm:p-10">
            <div>
              <span className="mb-2 block font-label-caps text-[11px] font-bold uppercase tracking-widest text-orange-600 dark:text-orange-400">
                Strategic Global Alliance
              </span>
              <h3 className="mb-2 font-display text-2xl font-bold text-ink dark:text-dark-ink">
                Officially Partnered by VPD Technologies
              </h3>
              <p className="max-w-2xl font-body text-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">
                CoralSwift is officially partnered with VPD Technologies to co-deliver accelerated enterprise modernization, resilient zero-trust platforms, and high-performance engineering infrastructure across international markets.
              </p>
            </div>

            <a
              href="/contact"
              className="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-brand px-6 py-2.5 font-display text-xs font-bold text-brand transition-all hover:bg-brand hover:text-white dark:border-orange-500 dark:text-orange-400 dark:hover:bg-orange-500 dark:hover:text-white"
            >
              Explore Partnership Solutions
            </a>
          </div>
        </Reveal>

        {/* Client Marquee Strip */}
        <div className="mt-16 overflow-hidden">
          <p className="mb-6 text-center font-label-caps text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Trusted by Engineering Leadership Across High-Concurrency Platforms
          </p>

          <div className="relative w-full overflow-hidden">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-surface-container/20 to-transparent dark:from-dark-surface-container/20" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-surface-container/20 to-transparent dark:from-dark-surface-container/20" />

            <div className="no-scrollbar overflow-x-auto py-2">
              <div className="flex gap-4 animate-marquee">
                {marqueeItems.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    className="flex shrink-0 items-center gap-2.5 rounded-xl border border-outline-variant/60 bg-white px-4 py-2 shadow-xs dark:border-dark-outline-variant/60 dark:bg-dark-surface"
                  >
                    <span className="size-2 rounded-full bg-brand" />
                    <span className="font-display text-xs font-bold text-ink dark:text-dark-ink">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-ink-muted dark:text-dark-ink-muted">
                      • {item.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
