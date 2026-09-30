import { useEffect, useState } from 'react';
import { fetchPartners } from '../../api/cms.js';

// Public "Technology Partners" logo strip (backend Partner.type =
// technology_partner, distinct from business_partner/reseller) — the
// backend CRUD resource and the Admin Panel's ContentManager entry for it
// already existed, but nothing on the public site actually rendered it (a
// real gap, not a stale-data bug: this feature simply had no frontend
// consumer at all until now).
export default function PartnersStrip() {
 const [partners, setPartners] = useState([]);

 useEffect(() => {
  fetchPartners({ limit: 20, type: 'technology_partner' })
   .then((res) => setPartners(res?.data || []))
   .catch(() => {});
 }, []);

 if (!partners.length) return null;

 return (
  <section className="border-y border-outline-variant bg-surface-container px-4 py-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto max-w-container">
    <p className="mb-6 text-center font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">
     Our Technology Partners
    </p>
    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
     {partners.map((p) => (
      p.website ? (
       <a key={p.id} href={p.website} target="_blank" rel="noreferrer" title={p.name} className="opacity-70 transition-opacity hover:opacity-100">
        {/* Responsive height (32px → 56px): the old fixed h-8 rendered logos
            at ~64×32, too small to read. max-w keeps wide logos inside the
            flex row on narrow screens; object-contain preserves aspect ratio. */}
        <img
         src={p.logo}
         alt={p.name}
         loading="lazy"
         className="h-10 max-w-[140px] object-contain grayscale transition-[filter] hover:grayscale-0 sm:h-12 sm:max-w-[160px] lg:h-14 lg:max-w-[180px]"
        />
       </a>
      ) : (
       <img
        key={p.id}
        src={p.logo}
        alt={p.name}
        title={p.name}
        loading="lazy"
        className="h-10 max-w-[140px] object-contain opacity-70 grayscale sm:h-12 sm:max-w-[160px] lg:h-14 lg:max-w-[180px]"
       />
      )
     ))}
    </div>
   </div>
  </section>
 );
}
