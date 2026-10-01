import { useEffect, useState } from 'react';
import { coreValues as staticCoreValues } from '../../data/about.js';
import { fetchAboutContent } from '../../api/cms.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function ValuesGrid() {
 const [coreValues, setCoreValues] = useState(staticCoreValues);

 useEffect(() => {
  fetchAboutContent()
   .then((res) => {
    const values = res?.data?.coreValues;
    if (Array.isArray(values) && values.length) setCoreValues(values);
   })
   .catch(() => {});
 }, []);

 return (
  <section className="bg-white py-section-padding dark:bg-dark-surface">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-16 text-center">
     <span className="font-label-caps text-label-caps uppercase tracking-widest text-brand">Principles</span>
     <h2 className="mt-4 font-display text-headline-md text-brand-dark dark:text-dark-brand">Core Values</h2>
    </div>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
     {coreValues.map((value) => {
      const isDark = value.variant === 'dark';
      return (
       <Reveal
        key={value.title}
        className={`${value.span} group relative overflow-hidden rounded-xl border border-slate-200/80 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-brand/40 hover:shadow-xl dark:border-slate-800 sm:p-10 ${
         isDark
          ? 'bg-gradient-to-br from-brand to-brand-dark text-white hover:shadow-orange-500/25'
          : 'bg-white hover:shadow-slate-200/60 dark:bg-dark-surface dark:hover:shadow-black/50'
        } ${value.showAvatars ? 'flex flex-col justify-between' : ''}`}
       >
        <div className="relative z-10">
         <div className="mb-6 inline-flex size-14 items-center justify-center rounded-xl bg-brand/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 dark:bg-brand/20">
          <Icon name={value.icon} className={`text-3xl ${isDark ? 'text-accent-cyan' : 'text-brand'}`} />
         </div>
         <h3 className={`mb-4 font-display text-headline-sm font-bold transition-colors duration-200 group-hover:text-brand ${isDark ? 'text-white group-hover:text-white' : 'text-brand-dark dark:text-dark-brand'}`}>
          {value.title}
         </h3>
         <p className={`max-w-md leading-relaxed ${isDark ? 'text-white/80' : 'text-ink-muted dark:text-slate-300'}`}>{value.description}</p>
        </div>
        {value.decorativeIcon && (
         <div className="absolute bottom-0 right-0 opacity-5 transition-all duration-500 group-hover:scale-110 group-hover:opacity-15">
          <Icon name={value.decorativeIcon} className="translate-x-8 translate-y-8 text-[180px]" />
         </div>
        )}
        {value.showAvatars && (
         <div className="relative z-10 mt-6 flex gap-3">
          <div className="size-9 rounded-full border-2 border-white/40 bg-brand/20 transition-transform duration-300 group-hover:scale-110" />
          <div className="size-9 rounded-full border-2 border-white/40 bg-brand/30 transition-transform duration-300 group-hover:scale-110 group-hover:delay-75" />
          <div className="size-9 rounded-full border-2 border-white/40 bg-brand/40 transition-transform duration-300 group-hover:scale-110 group-hover:delay-150" />
         </div>
        )}
       </Reveal>
      );
     })}
    </div>
   </div>
  </section>
 );
}
