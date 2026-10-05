import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function IndustriesGrid({ industries }) {
  return (
    <section className="bg-surface-container/20 py-16 sm:py-20 lg:py-24 dark:bg-dark-surface-container/20">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <Reveal key={ind.title} from="up" delay={i * 60}>
              <div className="group relative overflow-hidden flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/90 hover:bg-gradient-to-r hover:from-orange-50/50 hover:via-white hover:to-white hover:shadow-2xl hover:shadow-orange-500/15 dark:border-dark-outline-variant/80 dark:bg-dark-surface dark:hover:from-orange-950/20 dark:hover:via-dark-surface dark:hover:to-dark-surface sm:p-8">
                {/* Top Border Gradient Accent Line (Visible ONLY on Hover) */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div>
                  {/* Icon Box */}
                  <div className="mb-6 flex size-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 text-slate-500 transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-[#FF5500] group-hover:via-[#E11D48] group-hover:to-[#8B5CF6] group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30 dark:border-slate-800 dark:bg-dark-surface-container dark:text-slate-400">
                    <Icon name={ind.icon || 'business'} className="text-2xl" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-3 font-display text-xl font-bold text-ink transition-colors duration-300 group-hover:text-orange-600 dark:text-dark-ink dark:group-hover:text-orange-400 sm:text-2xl">
                    {ind.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-6 font-body text-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">
                    {ind.description}
                  </p>

                  {/* Challenges List */}
                  {ind.challenges && ind.challenges.length > 0 && (
                    <div className="mb-6">
                      <h4 className="mb-2.5 font-label-caps text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Key Challenges Addressed
                      </h4>
                      <ul className="space-y-2">
                        {ind.challenges.map((c) => (
                          <li key={c} className="flex items-start gap-2.5 font-body text-xs text-ink dark:text-dark-ink sm:text-sm">
                            <Icon name="check_circle" className="mt-0.5 text-base shrink-0 text-emerald-500" />
                            <span className="leading-snug">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Impact Stat Footer */}
                {ind.stats && (
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="flex items-center gap-2 font-display text-xs font-bold text-orange-600 dark:text-orange-400">
                      <Icon name="trending_up" className="text-sm shrink-0" />
                      <span>{ind.stats}</span>
                    </p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
