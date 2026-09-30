import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import FooterMap from './FooterMap.jsx';
import { COMPANY as staticCompany } from '../../data/company.js';
import { fetchCompanyInfo } from '../../api/cms.js';

const SOLUTIONS = [
 { label: 'Solutions', to: '/solutions' },
 { label: 'Products', to: '/products' },
 { label: 'Technologies', to: '/technologies' },
 { label: 'Industries', to: '/industries' },
];
const RESOURCES = [
 { label: 'Case Studies', to: '/case-studies' },
 { label: 'Resources', to: '/resources' },
 { label: 'Blog', to: '/blog' },
 { label: 'Events', to: '/events' },
 { label: 'Gallery', to: '/gallery' },
 { label: 'Downloads', to: '/downloads' },
 { label: 'FAQ', to: '/faq' },
];
const COMPANY = [
 { label: 'About Us', to: '/about' },
 { label: 'Awards', to: '/awards' },
 { label: 'Portfolio', to: '/portfolio' },
 { label: 'Careers', to: '/careers' },
 { label: 'Contact', to: '/contact' },
];
export default function Footer() {
 const { pathname } = useLocation();
 const showMap = pathname === '/';
 const [companyInfo, setCompanyInfo] = useState(staticCompany);

 useEffect(() => {
  fetchCompanyInfo()
   .then((res) => {
    const info = res?.data;
    if (info && typeof info === 'object' && Object.keys(info).length) setCompanyInfo({ ...staticCompany, ...info });
   })
   .catch(() => {});
 }, []);

 const { hq: HQ, offices: OFFICES } = companyInfo;

 return (
  <footer className="relative w-full bg-white px-4 pb-stack-lg text-ink dark:bg-dark-surface dark:text-dark-ink sm:px-6 lg:px-10 xl:px-12">
   {/* Real world map with HQ + office pins — landing page only */}
   {showMap && (
    <div className="mx-auto mb-12 max-w-container overflow-hidden rounded-xl border border-outline-variant shadow-card dark:border-dark-outline-variant">
     <FooterMap />
    </div>
   )}
   <div className="mx-auto grid max-w-container grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-6">

    {/* Brand — spans 2 cols */}
    <div className="col-span-2">
     <Link to="/" className="mb-4 inline-flex items-center gap-3 sm:mb-6">
      <img src="/logo-icon.png" alt="CoralSwift Emblem" className="h-9 w-auto object-contain" />
      <div className="flex flex-col leading-none">
       <span className="font-display text-2xl font-bold text-slate-900 dark:text-white">
        Coral<span className="bg-gradient-to-r from-[#FF5500] via-[#E11D48] to-[#8B5CF6] bg-clip-text text-transparent">Swift</span>
       </span>
       <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-slate-500 dark:text-slate-400 mt-0.5">
        Technologies
       </span>
      </div>
     </Link>
     <p className="mb-4 font-body text-body-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">
      Architectural Rigor • Zero-Downtime Delivery • Applied Intelligence. We design, modernize, and operate distributed systems for hyper-growth scale.
     </p>
     <div className="mb-6 space-y-2 font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">
      <p className="flex items-center gap-2">
       <Icon name="mail" className="text-base text-brand" />
       <a href="mailto:info@coralswift.com" className="hover:text-brand transition-colors">info@coralswift.com</a>
      </p>
      <p className="flex items-center gap-2">
       <Icon name="call" className="text-base text-brand" />
       <a href="tel:+13072165154" className="hover:text-brand transition-colors">+1 (307) 216-5154</a>
      </p>
     </div>
     <div className="flex gap-4">
      <a
       href="https://www.linkedin.com/"
       target="_blank"
       rel="noreferrer"
       aria-label="LinkedIn"
       className="flex size-10 items-center justify-center rounded-full border border-brand/20 text-brand-dark transition-colors hover:bg-brand/10 dark:text-dark-brand"
      >
       <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
       </svg>
      </a>
      <a
       href="https://twitter.com/"
       target="_blank"
       rel="noreferrer"
       aria-label="Twitter"
       className="flex size-10 items-center justify-center rounded-full border border-brand/20 text-brand-dark transition-colors hover:bg-brand/10 dark:text-dark-brand"
      >
       <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
       </svg>
      </a>
     </div>
    </div>


    {/* Solutions */}
    <div>
     <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark dark:text-dark-brand">Solutions</h4>
     <ul className="space-y-3 font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">
      {SOLUTIONS.map((item) => (
       <li key={item.label}>
        <Link to={item.to} className="transition-colors hover:text-accent-cyan">{item.label}</Link>
       </li>
      ))}
     </ul>
    </div>

    {/* Resources */}
    <div>
     <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark dark:text-dark-brand">Resources</h4>
     <ul className="space-y-3 font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">
      {RESOURCES.map((item) => (
       <li key={item.label}>
        <Link to={item.to} className="transition-colors hover:text-accent-cyan">{item.label}</Link>
       </li>
      ))}
     </ul>
    </div>

    {/* Company */}
    <div>
     <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark dark:text-dark-brand">Company</h4>
     <ul className="space-y-3 font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">
      {COMPANY.map((item) => (
       <li key={item.label}>
        <Link to={item.to} className="transition-colors hover:text-accent-cyan">{item.label}</Link>
       </li>
      ))}
     </ul>
    </div>

    {/* Headquarters + Global Offices */}
    <div>
     <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark dark:text-dark-brand">Headquarters</h4>
     <p className="mb-8 flex items-start gap-2 font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">
      <Icon name="location_on" className="mt-0.5 shrink-0 text-base text-brand" />
      {HQ}
     </p>
     <h4 className="mb-6 font-label-caps text-label-caps uppercase text-brand-dark dark:text-dark-brand">Global Offices</h4>
     <ul className="space-y-3 font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">
      {OFFICES.map((office) => (
       <li key={office} className="flex items-center gap-2">
        <span className="size-1.5 shrink-0 rounded-full bg-brand" />
        {office}
       </li>
      ))}
     </ul>
    </div>

   </div>

   <div className="mx-auto mt-12 flex max-w-container flex-col items-center justify-between gap-6 border-t border-ink/10 pb-4 pt-10 dark:border-dark-ink/10 md:flex-row">
    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
     <div className="flex items-center gap-2">
      <Icon name="public" className="text-xl text-brand" />
      <p className="font-body text-body-sm text-ink-muted dark:text-dark-ink-muted">
       &copy; 2026 CoralSwift Technologies. All rights reserved.
      </p>
     </div>
     <span className="hidden sm:inline text-ink-muted/40 dark:text-dark-ink-muted/40">•</span>
     <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
      Officially Partnered by VPD Technologies
     </span>
    </div>

    <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 font-label-caps text-label-caps uppercase tracking-widest text-ink-muted dark:text-dark-ink-muted sm:gap-x-8 md:justify-start">
     <Link to="/privacy" className="transition-colors hover:text-accent-cyan">Privacy</Link>
     <Link to="/terms" className="transition-colors hover:text-accent-cyan">Terms</Link>
     <Link to="/cookies" className="transition-colors hover:text-accent-cyan">Cookies</Link>
    </div>
   </div>
  </footer>
 );
}
