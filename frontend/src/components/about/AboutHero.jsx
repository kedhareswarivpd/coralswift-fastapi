import { useEffect, useState } from 'react';
import { aboutStats as staticAboutStats } from '../../data/about.js';
import { fetchAboutContent } from '../../api/cms.js';

export default function AboutHero({ stats }) {
 const [aboutStats, setAboutStats] = useState(staticAboutStats);

 useEffect(() => {
  fetchAboutContent()
   .then((res) => {
    const items = res?.data?.aboutStats;
    if (Array.isArray(items) && items.length) setAboutStats(items);
   })
   .catch(() => {});
 }, []);

 const items = stats
  ? [
    { value: `${stats.total_clients}+`, label: 'Global Clients' },
    { value: `${stats.total_employees}+`, label: 'Engineers & Specialists' },
    { value: `${stats.total_projects}+`, label: 'Projects Delivered' },
    { value: `${stats.countries}+`, label: 'Countries Served' },
   ]
  : aboutStats;
 return (
  <section className="relative flex min-h-[500px] items-center overflow-hidden bg-white dark:bg-dark-surface md:min-h-[620px]">
   <div className="animate-float-slow pointer-events-none absolute right-10 top-10 size-72 rounded-full bg-white/5 blur-3xl" />
   <div className="animate-float pointer-events-none absolute bottom-0 left-1/4 size-48 rounded-full bg-accent-cyan/10 blur-2xl" />
   <div className="relative z-10 mx-auto grid max-w-container items-center gap-stack-lg px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-10 xl:px-12 ">
    <div>
     <span className="animate-hero-1 mb-4 block font-label-caps text-label-caps uppercase text-accent-cyan">
      Engineering the Future
     </span>
     <h1 className="animate-hero-2 mb-6 font-display text-display-lg-mobile text-brand-dark dark:text-dark-brand md:text-display-lg">
      Innovating at the Core of <span className="text-brand">Global Scale</span>
     </h1>
     <p className="animate-hero-3 mb-stack-lg max-w-xl font-body text-body-lg text-ink-muted dark:text-dark-ink-muted">
      CoralSwift Technologies is a global engineering powerhouse focused on driving digital
      transformation through precise technical excellence and strategic innovation.
     </p>
     <div className="animate-hero-4 flex flex-wrap gap-3 sm:gap-4">
      <button
       onClick={() => document.getElementById('our-impact')?.scrollIntoView({ behavior: 'smooth' })}
       className="flex h-11 items-center rounded bg-brand px-8 font-label-caps text-label-caps uppercase text-white transition-colors hover:opacity-90"
      >
       Our Impact
      </button>
      <button
       onClick={() => document.getElementById('global-offices')?.scrollIntoView({ behavior: 'smooth' })}
       className="flex h-11 items-center rounded border border-brand px-8 font-label-caps text-label-caps uppercase text-brand transition-colors hover:bg-brand hover:text-white"
      >
       View Global Offices
      </button>
     </div>
    </div>
    <div className="animate-hero-panel hidden md:block">
     <div className="glass-panel animate-float rounded-lg p-8">
      <div className="grid grid-cols-2 gap-8">
       {items.map((stat) => (
        <div key={stat.label} className="animate-count-in">
         <div className="font-stat text-stat-lg text-brand-dark dark:text-dark-brand">{stat.value}</div>
         <div className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-white/60">{stat.label}</div>
        </div>
       ))}
      </div>
     </div>
    </div>
   </div>
  </section>
 );
}
