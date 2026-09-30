import { useEffect, useState } from 'react';
import { timeline as staticTimeline } from '../../data/about.js';
import { fetchAboutContent } from '../../api/cms.js';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

function TimelineCard({ entry }) {
 const isPresent = entry.side === 'present';
 return (
  <div
  className={`rounded-lg p-8 shadow-sm transition-all hover:shadow-md ${
    isPresent ? 'bg-brand shadow-lg' : 'bg-white dark:bg-dark-surface'
   }`}
  >
   <span className={`mb-2 block font-stat text-stat-lg ${isPresent ? 'text-white' : 'text-brand'}`}>
    {entry.year}
   </span>
   <h4 className={`mb-2 font-display text-headline-sm ${isPresent ? 'text-white' : 'text-brand-dark dark:text-white'}`}>
    {entry.title}
   </h4>
   <p className={isPresent ? 'text-white/80' : 'text-ink-muted dark:text-white/70'}>{entry.description}</p>
  </div>
 );
}

export default function Timeline() {
 const [timeline, setTimeline] = useState(staticTimeline);

 useEffect(() => {
  fetchAboutContent()
   .then((res) => {
    const items = res?.data?.timeline;
    if (Array.isArray(items) && items.length) setTimeline(items);
   })
   .catch(() => {});
 }, []);

 return (
  <section className="mx-auto max-w-container overflow-hidden px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mb-20 text-center">
    <h2 className="font-display text-headline-md text-brand-dark dark:text-dark-brand">Our Journey</h2>
    <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-brand" />
   </div>
   <div className="timeline-line relative space-y-12 md:space-y-24">
    {timeline.map((entry) => (
     <Reveal
      key={entry.year}
      className="relative z-10 flex flex-col items-center justify-between md:flex-row"
     >
      {entry.side === 'left' && (
       <>
        <div className="order-2 text-right md:order-1 md:w-5/12">
         <TimelineCard entry={entry} />
        </div>
        <TimelineDot />
        <div className="order-3 md:w-5/12" />
       </>
      )}
      {entry.side === 'right' && (
       <>
        <div className="order-1 md:w-5/12" />
        <TimelineDot />
        <div className="order-2 md:order-3 md:w-5/12">
         <TimelineCard entry={entry} />
        </div>
       </>
      )}
      {entry.side === 'present' && (
       <>
        <div className="order-1 md:w-5/12" />
        <TimelineDot icon={entry.icon} glow />
        <div className="order-2 md:order-3 md:w-5/12">
         <TimelineCard entry={entry} />
        </div>
       </>
      )}
     </Reveal>
    ))}
   </div>
  </section>
 );
}

function TimelineDot({ icon, glow = false }) {
 return (
  <div
   className={`order-1 my-4 flex size-12 flex-shrink-0 items-center justify-center rounded-full border-4 border-white bg-brand md:order-2 md:my-0 ${
    glow ? 'shadow-[0_0_20px_rgba(61,98,104,0.4)]' : ''
   }`}
  >
   {icon ? <Icon name={icon} className="text-sm text-white" /> : <span className="size-2 rounded-full bg-white" />}
  </div>
 );
}
