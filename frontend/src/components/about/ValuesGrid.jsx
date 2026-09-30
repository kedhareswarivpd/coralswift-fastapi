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
        className={`${value.span} group relative overflow-hidden rounded-lg p-6 transition-all sm:p-10 ${
         isDark
          ? 'bg-brand text-white hover:scale-[1.02]'
          : 'bg-white hover:shadow-card-hover'
        } ${value.showAvatars ? 'flex flex-col justify-between' : ''}`}
       >
        <div className="relative z-10">
         <Icon name={value.icon} className={`mb-6 text-4xl ${isDark ? 'text-accent-cyan' : 'text-brand'}`} />
         <h3 className={`mb-4 font-display text-headline-sm ${isDark ? 'text-white' : 'text-brand-dark dark:text-dark-brand'}`}>
          {value.title}
         </h3>
         <p className={`max-w-md ${isDark ? 'text-white/80' : 'text-ink-muted'}`}>{value.description}</p>
        </div>
        {value.decorativeIcon && (
         <div className="absolute bottom-0 right-0 opacity-5 transition-opacity group-hover:opacity-10">
          <Icon name={value.decorativeIcon} className="translate-x-12 translate-y-12 text-[160px]" />
         </div>
        )}
        {value.showAvatars && (
         <div className="relative z-10 mt-6 flex gap-4">
          <div className="size-8 rounded-full bg-brand/10" />
          <div className="size-8 rounded-full bg-brand/10" />
          <div className="size-8 rounded-full bg-brand/10" />
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
