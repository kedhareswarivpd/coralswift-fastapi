import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

export default function ServiceCard({ service }) {
  const iconName = service.icon || 'code';
  const categoryLabel = service.category || 'Engineering';
  const featuresList = (service.features || []).slice(0, 3);

  return (
    <div className="group relative overflow-hidden flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/90 hover:bg-gradient-to-r hover:from-orange-50/50 hover:via-white hover:to-white hover:shadow-2xl hover:shadow-orange-500/15 dark:border-dark-outline-variant/80 dark:bg-dark-surface dark:hover:from-orange-950/20 dark:hover:via-dark-surface dark:hover:to-dark-surface sm:p-8">
      {/* Top Border Gradient Accent Line (Visible ONLY on Hover) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div>
        {/* Top Header: Icon Box & Category Pill */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 text-slate-500 transition-all duration-300 group-hover:border-transparent group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-rose-500 group-hover:text-white group-hover:shadow-md group-hover:shadow-orange-500/30 dark:border-slate-800 dark:bg-dark-surface-container dark:text-slate-400">
            <Icon name={iconName} className="text-2xl" />
          </div>

          <span className="rounded-full border border-slate-200/80 bg-slate-50/80 px-3.5 py-1 font-display text-xs font-semibold text-slate-600 transition-colors duration-300 dark:border-slate-800 dark:bg-dark-surface-container dark:text-slate-300">
            {categoryLabel}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-3 font-display text-xl font-bold text-ink transition-colors duration-300 group-hover:text-orange-600 dark:text-dark-ink dark:group-hover:text-orange-400 sm:text-2xl">
          {service.title || service.name}
        </h3>

        {/* Description */}
        <p className="mb-6 font-body text-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">
          {service.description || service.overview}
        </p>

        {/* Features Checklist */}
        {featuresList.length > 0 && (
          <ul className="mb-6 space-y-2.5">
            {featuresList.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 font-body text-xs text-ink dark:text-dark-ink sm:text-sm">
                <Icon name="check_circle" className="mt-0.5 text-base shrink-0 text-emerald-500" />
                <span className="leading-snug">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bottom Link */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <Link
          to={`/services/${service.slug}`}
          className="inline-flex items-center gap-2 font-display text-xs font-bold text-orange-600 transition-all duration-300 group-hover:text-orange-600 dark:text-orange-400 sm:text-sm"
        >
          <span>Explore Deliverables &amp; RFC</span>
          <Icon name="arrow_forward" className="text-sm transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>
    </div>
  );
}
