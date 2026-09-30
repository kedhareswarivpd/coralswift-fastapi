import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchServices } from '../../api/services.js';
import { services as demoServices } from '../../data/services.js';
import SectionHeading from '../ui/SectionHeading.jsx';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

// The demo dataset is authored in ServiceCard shape (title/description);
// normalize it to the API record shape (name/overview/slug/icon) that this
// section renders, so live and fallback sources are interchangeable.
const FALLBACK_SERVICES = demoServices.map(({ slug, icon, title, description }) => ({
 slug,
 icon,
 name: title,
 overview: description,
}));

export default function ServicesTeaser() {
 const [services, setServices] = useState(FALLBACK_SERVICES);

 useEffect(() => {
  fetchServices({ limit: 6 })
   .then((res) => {
    if (res?.data?.length) setServices(res.data);
   })
   .catch(() => {});
 }, []);

 if (!services.length) return null;

 return (
  <section className="bg-surface-container px-4 py-section-padding dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto max-w-container">
    <SectionHeading align="center" eyebrow="What We Do" title="Services built for enterprise scale" className="mx-auto mb-stack-xl" />
    <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
     {services.map((s, i) => (
      <Reveal key={s.slug} from="zoom" delay={i * 60}>
       <Link
        to={`/services/${s.slug}`}
        className="flex h-full flex-col gap-3 rounded-lg border border-outline-variant bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-card-hover dark:border-dark-outline-variant dark:bg-dark-surface"
       >
        <div className="flex size-11 items-center justify-center rounded-lg bg-accent-cyan-pale">
         <Icon name={s.icon || 'apps'} className="text-2xl text-brand" />
        </div>
        <h3 className="flex min-h-16 items-center font-display text-headline-sm text-brand-dark dark:text-dark-brand">{s.name}</h3>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{s.overview}</p>
       </Link>
      </Reveal>
     ))}
    </div>
    <div className="mt-stack-xl flex justify-center">
     <Link to="/services" className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:gap-3">
      View All Services <Icon name="arrow_forward" />
     </Link>
    </div>
   </div>
  </section>
 );
}
