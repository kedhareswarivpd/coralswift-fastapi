import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

export default function CaseStudyCard({ study }) {
  const resultsList = (study.results || []).slice(0, 3);
  const techList = study.technologies || [];

  return (
    <article className="group relative overflow-hidden flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/90 hover:bg-gradient-to-r hover:from-orange-50/50 hover:via-white hover:to-white hover:shadow-2xl hover:shadow-orange-500/15 dark:border-dark-outline-variant/80 dark:bg-dark-surface dark:hover:from-orange-950/20 dark:hover:via-dark-surface dark:hover:to-dark-surface sm:p-8">
      {/* Top Border Gradient Accent Line (Visible ONLY on Hover) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div>
        {/* Industry Pill Badge */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <span className="rounded-2xl border border-orange-200/80 bg-orange-50/80 px-4 py-1.5 font-display text-xs font-bold text-orange-600 transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-rose-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400">
            {study.industry}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-3 font-display text-xl font-bold text-ink transition-colors duration-300 group-hover:text-orange-600 dark:text-dark-ink dark:group-hover:text-orange-400 sm:text-2xl">
          {study.slug ? (
            <Link to={`/case-studies/${study.slug}`} className="hover:underline">
              {study.title}
            </Link>
          ) : (
            study.title
          )}
        </h3>

        {/* Description */}
        <p className="mb-6 font-body text-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">
          {study.description}
        </p>

        {/* Key Results Checklist */}
        {resultsList.length > 0 && (
          <div className="mb-6">
            <h4 className="mb-2.5 font-label-caps text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Key Results &amp; Impact
            </h4>
            <ul className="space-y-2">
              {resultsList.map((r) => (
                <li key={r} className="flex items-start gap-2.5 font-body text-xs text-ink dark:text-dark-ink sm:text-sm">
                  <Icon name="check_circle" className="mt-0.5 text-base shrink-0 text-emerald-500" />
                  <span className="leading-snug">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tech Stack Pills */}
        {techList.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-1.5">
            {techList.map((tech) => (
              <span
                key={tech}
                className="rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-dark-surface-container dark:text-slate-400"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <Link
          to={`/case-studies/${study.slug}`}
          className="inline-flex items-center gap-2 font-display text-xs font-bold text-orange-600 transition-all duration-300 group-hover:text-orange-600 dark:text-orange-400 sm:text-sm"
        >
          <span>Read Full Case Study</span>
          <Icon name="arrow_forward" className="text-sm transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>
    </article>
  );
}
