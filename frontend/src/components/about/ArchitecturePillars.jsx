import Reveal from '../ui/Reveal.jsx';

const PILLARS = [
  {
    number: '01',
    title: 'Architectural Rigor',
    description: 'We believe that architectural shortcuts create exponential downstream debt. Every system we design is documented in formal RFCs and verified with stress benchmarks.',
  },
  {
    number: '02',
    title: 'Zero-Downtime Guarantee',
    description: 'We engineer migrations and systems with active-active topologies and canary routing so that enterprise operations remain completely uninterrupted.',
  },
  {
    number: '03',
    title: 'Transparent Collaboration',
    description: 'Our principal architects embed directly with client engineering squads, providing transparent Git commits, architecture reviews, and knowledge transfer.',
  },
  {
    number: '04',
    title: 'Security & Privacy Sovereignty',
    description: 'From zero-trust network policies to strict data isolation, defense-in-depth is our non-negotiable default for every layer of the technology stack.',
  },
];

export default function ArchitecturePillars() {
  return (
    <section className="bg-surface-container/40 py-16 sm:py-20 lg:py-24 dark:bg-dark-surface-container/40">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
        <Reveal from="up" className="mb-14 text-center">
          <div className="mb-3 inline-flex items-center rounded-full border border-indigo-200/80 bg-indigo-50/70 px-4 py-1 text-xs font-semibold tracking-wide text-indigo-600 dark:border-indigo-800/80 dark:bg-indigo-950/40 dark:text-indigo-400">
            Engineering Principles
          </div>
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-extrabold tracking-tight text-ink dark:text-dark-ink sm:text-4xl lg:text-5xl">
            Core Pillars That Guide Our Architecture
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((pillar, i) => (
            <Reveal key={pillar.number} from="up" delay={i * 80}>
              <div className="group relative overflow-hidden flex h-full flex-col justify-between rounded-3xl border border-outline-variant/70 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-3 hover:border-orange-400/80 hover:shadow-2xl hover:shadow-orange-500/15 dark:border-dark-outline-variant/80 dark:bg-dark-surface">
                {/* Top Border Gradient Accent Line (Visible ONLY on Hover) */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-brand to-amber-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div>
                  <div className="mb-6">
                    <span className="inline-flex rounded-full bg-orange-100/80 px-3.5 py-1 text-xs font-bold text-orange-600 transition-transform duration-300 group-hover:scale-105 dark:bg-orange-950/60 dark:text-orange-400">
                      {pillar.number}
                    </span>
                  </div>

                  <h3 className="mb-3 font-display text-xl font-bold text-ink transition-colors duration-300 group-hover:text-orange-600 dark:text-dark-ink dark:group-hover:text-orange-400">
                    {pillar.title}
                  </h3>

                  <p className="font-body text-body-md leading-relaxed text-ink-muted dark:text-dark-ink-muted">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
