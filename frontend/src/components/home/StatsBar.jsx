import { homeStats } from '../../data/home.js';
import Reveal from '../ui/Reveal.jsx';
import useCountUp from '../../hooks/useCountUp.js';

function AnimatedStat({ value, label }) {
 const [ref, display] = useCountUp(value);
 return (
  <div ref={ref}>
   <div className="font-stat text-stat-lg text-brand">{display}</div>
   <div className="mt-1 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{label}</div>
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
  <section className="border-b border-outline-variant bg-white px-4 py-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto grid max-w-container grid-cols-2 gap-stack-lg text-center md:grid-cols-4">
    {items.map((stat, i) => (
     <Reveal key={stat.label} from="zoom" delay={i * 80}>
      <AnimatedStat value={stat.value} label={stat.label} />
     </Reveal>
    ))}
   </div>
  </section>
 );
}
