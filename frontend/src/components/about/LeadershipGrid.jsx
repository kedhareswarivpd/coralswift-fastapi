import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leadership as staticLeadership } from '../../data/about.js';
import { fetchLeadership } from '../../api/cms.js';
import Reveal from '../ui/Reveal.jsx';
import Icon from '../ui/Icon.jsx';

function toFrontend(l) {
 return { name: l.name, title: l.title, image: l.photo_url || null, linkedin: l.linkedin || 'https://www.linkedin.com/' };
}

function LinkedInIcon() {
 return (
  <svg className="size-4 fill-current" viewBox="0 0 24 24">
   <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
 );
}

function LeaderAvatar({ name, image }) {
 const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
 if (image) {
  return <img className="size-full object-cover transition-transform duration-300 group-hover:scale-105" alt={`Portrait of ${name}`} src={image} />;
 }
 return (
  <div className="flex size-full items-center justify-center bg-gradient-to-br from-brand to-brand-dark">
   <span className="select-none font-display text-5xl font-bold text-white">{initials}</span>
  </div>
 );
}

export default function LeadershipGrid() {
 const [leadership, setLeadership] = useState(staticLeadership);

 useEffect(() => {
  fetchLeadership()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setLeadership(items.map(toFrontend));
   })
   .catch(() => {});
 }, []);

 return (
  <section className="bg-white py-section-padding dark:bg-dark-surface">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <Reveal className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
     <div className="max-w-2xl">
      <span className="font-label-caps text-label-caps uppercase text-brand">Executive Leadership</span>
      <h2 className="mt-4 font-display text-headline-md text-brand-dark dark:text-dark-brand">Visionaries Steering the Ship</h2>
     </div>
     <Link to="/careers" className="group flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand">
      Join our team
      <Icon
        name="arrow_forward"
        className="transition-transform group-hover:translate-x-1"
      />
     </Link>
    </Reveal>
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
     {leadership.map((leader, i) => (
      <Reveal key={leader.name} from="zoom" delay={i * 60} className="group">
       <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-lg bg-surface-container dark:bg-dark-surface-container">
        <LeaderAvatar name={leader.name} image={leader.image} />
        <div className="absolute inset-0 bg-brand/10 transition-colors group-hover:bg-transparent" />
       </div>
       <h4 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{leader.name}</h4>
       <p className="mb-4 font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">{leader.title}</p>
       <div className="flex gap-3">
        <a href={leader.linkedin} target="_blank" rel="noopener noreferrer" className="flex size-8 cursor-pointer items-center justify-center rounded bg-surface-container text-brand transition-colors hover:bg-brand hover:text-white dark:bg-dark-surface-container">
         <LinkedInIcon />
        </a>
       </div>
      </Reveal>
     ))}
    </div>
   </div>
  </section>
 );
}
