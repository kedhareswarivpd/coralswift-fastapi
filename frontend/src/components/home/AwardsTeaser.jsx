import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchAwards } from '../../api/cms.js';
import SectionHeading from '../ui/SectionHeading.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function AwardsTeaser() {
 const [awards, setAwards] = useState([]);

 useEffect(() => {
  fetchAwards({ limit: 4 })
   .then((res) => setAwards(res?.data || []))
   .catch(() => {});
 }, []);

 if (!awards.length) return null;

 return (
  <section className="bg-surface-container px-4 py-section-padding dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto max-w-container">
    <SectionHeading align="center" eyebrow="Recognition" title="Awards & certifications" className="mx-auto mb-stack-xl" />
    <div className="grid gap-gutter sm:grid-cols-2 lg:grid-cols-4">
     {awards.map((a, i) => (
      <Reveal key={a.id} from="up" delay={i * 80} className="flex flex-col items-center gap-3 rounded-lg border border-outline-variant bg-white p-6 text-center dark:border-dark-outline-variant dark:bg-dark-surface">
       <Icon name="emoji_events" className="text-4xl text-brand" />
       <h3 className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">{a.title}</h3>
       {a.year && <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{a.year}</span>}
      </Reveal>
     ))}
    </div>
    <div className="mt-stack-xl flex justify-center">
     <Link to="/awards" className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-3">
      View All Awards <Icon name="arrow_forward" />
     </Link>
    </div>
   </div>
  </section>
 );
}
