import { homeStats } from '../../data/home.js';
import Reveal from '../ui/Reveal.jsx';
import useCountUp from '../../hooks/useCountUp.js';

function AnimatedStat({ value, label }) {
  const [ref, display] = useCountUp(value);
  return (
    <div
      ref={ref}
      className="card-interactive group rounded-xl border border-transparent p-4 transition-all duration-300 hover:border-outline-variant/60 hover:bg-surface-container/50 dark:hover:border-dark-outline-variant/60 dark:hover:bg-dark-surface-container/40"
    >
      <div className="font-stat text-stat-lg text-brand transition-transform duration-300 group-hover:scale-105">
        {display}
      </div>
      <div className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted transition-colors duration-200 group-hover:text-brand-dark dark:text-dark-ink-muted dark:group-hover:text-white">
        {label}
      </div>
    </div>
  );
}

export default function StatsBar({ stats }) {
  const fallback = Object.fromEntries(homeStats.map((s) => [s.label, s.value]));
  const items = stats
    ? [
        { label: 'Projects Delivered', value: stats.total_projects > 0 ? `${stats.total_projects}+` : fallback['Projects Delivered'] },
        { label: 'Enterprise Clients', value: stats.total_clients > 0 ? `${stats.total_clients}+` : fallback['Enterprise Clients'] },
        { label: 'Countries Served', value: stats.countries > 0 ? `${stats.countries}+` : fallback['Countries Served'] },
        { label: 'Uptime SLA', value: stats.uptime ? `${stats.uptime}%` : fallback['Uptime SLA'] },
      ]
    : homeStats;

  return (
    <section className="border-b border-outline-variant bg-white px-4 py-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto grid max-w-container grid-cols-2 gap-stack-md text-center md:grid-cols-4">
        {items.map((stat, i) => (
          <Reveal key={stat.label} from="zoom" delay={i * 80}>
            <AnimatedStat value={stat.value} label={stat.label} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
