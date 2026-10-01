import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

export default function JobCard({ job }) {
  const targetUrl = `/careers/${job.slug || job.id}`;

  return (
    <div className="group relative overflow-hidden flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-300 hover:-translate-y-2 hover:border-orange-400/90 hover:shadow-2xl hover:shadow-orange-500/15 dark:border-dark-outline-variant/80 dark:bg-dark-surface sm:p-8">
      {/* Top Border Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-4">
          <h3 className="font-display text-xl font-bold text-ink transition-colors duration-300 group-hover:text-orange-600 dark:text-dark-ink dark:group-hover:text-orange-400 sm:text-2xl">
            <Link to={targetUrl} className="hover:underline">
              {job.title}
            </Link>
          </h3>
          <span className="whitespace-nowrap rounded-full border border-orange-200/80 bg-orange-50/80 px-3.5 py-1 font-display text-xs font-semibold text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-400">
            {job.department}
          </span>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 text-xs font-medium text-ink-muted dark:text-dark-ink-muted sm:text-sm">
          <span className="flex items-center gap-1.5">
            <Icon name="location_on" className="text-base text-orange-500" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="work_history" className="text-base text-orange-500" />
            {job.type}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon name="school" className="text-base text-orange-500" />
            {job.experience}
          </span>
        </div>

        <p className="mb-6 font-body text-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">
          {job.description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Link
          to={targetUrl}
          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wide text-white transition-all hover:bg-orange-600 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-orange-500 dark:hover:text-white"
        >
          <Icon name="send" className="text-base leading-none" />
          Apply Now
        </Link>

        <Link
          to={targetUrl}
          className="inline-flex items-center gap-1.5 font-display text-xs font-bold text-orange-600 transition-all hover:translate-x-1 dark:text-orange-400"
        >
          <span>View Details</span>
          <Icon name="arrow_forward" className="text-sm" />
        </Link>
      </div>
    </div>
  );
}
