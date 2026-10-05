import { Link } from 'react-router-dom';
import ContactForm from '../components/contact/ContactForm.jsx';
import FooterMap from '../components/layout/FooterMap.jsx';
import Icon from '../components/ui/Icon.jsx';
import Reveal from '../components/ui/Reveal.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';

const SOCIAL_LINKS = [
 {
  label: 'LinkedIn', href: 'https://www.linkedin.com/',
  path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
 },
 {
  label: 'Twitter', href: 'https://twitter.com/',
  path: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
 },
];

export default function Contact() {
 useDocumentTitle('Contact Us | CoralSwift Technologies');

 return (
  <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
   <Reveal className="mx-auto mb-stack-xl max-w-2xl text-center">
    <span className="font-label-caps text-label-caps uppercase text-brand">Get in Touch</span>
    <h1 className="my-4 font-display text-headline-md text-brand-dark dark:text-dark-brand">Let&apos;s Build Something Resilient</h1>
    <p className="text-body-lg text-ink-muted dark:text-dark-ink-muted">
     Tell us about your next technical initiative — a Solution Architect will follow up within one
     business day.
    </p>
   </Reveal>

   <div className="grid gap-gutter lg:grid-cols-12">
    <Reveal from="left" className="rounded-lg border border-outline-variant bg-white p-stack-lg shadow-card dark:border-dark-outline-variant dark:bg-dark-surface lg:col-span-7">
     <ContactForm />
    </Reveal>

    <div className="flex flex-col gap-stack-lg lg:col-span-5">
     <Reveal from="right" delay={100} className="rounded-lg bg-brand-dark p-stack-lg text-white">
      <h3 className="mb-4 font-display text-headline-sm">Direct Contact</h3>
      <div className="mb-3 flex items-center gap-3">
       <Icon name="mail" className="text-accent-cyan" />
       <a href="mailto:info@coralswift.com" className="text-body-sm transition-colors hover:text-accent-cyan">info@coralswift.com</a>
      </div>
      <div className="mb-4 flex items-center gap-3">
       <Icon name="call" className="text-accent-cyan" />
       <a href="tel:+13072165154" className="text-body-sm transition-colors hover:text-accent-cyan">+1 (307) 216-5154</a>
      </div>
      <Link to="/faq" className="mb-4 flex items-center gap-3 transition-colors hover:text-accent-cyan">
       <Icon name="support_agent" className="text-accent-cyan" />
       <span className="text-body-sm">Need help? Visit Support / FAQ</span>
      </Link>
      <div className="flex gap-3 border-t border-white/10 pt-4">
       {SOCIAL_LINKS.map((s) => (
        <a
         key={s.label}
         href={s.href}
         target="_blank"
         rel="noreferrer"
         aria-label={s.label}
         className="flex size-9 items-center justify-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
        >
         <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d={s.path} /></svg>
        </a>
       ))}
      </div>
     </Reveal>

     <Reveal from="right" delay={200} className="rounded-lg border border-outline-variant bg-white p-stack-lg dark:border-dark-outline-variant dark:bg-dark-surface">
      <h3 className="mb-4 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Corporate Office</h3>
      <div className="flex flex-col gap-4">
       <div className="flex items-start gap-3">
        <Icon name="location_on" className="mt-0.5 text-brand" />
        <div>
         <p className="text-body-sm font-semibold text-ink dark:text-dark-ink">Sheridan, Wyoming, United States</p>
         <p className="mt-1 text-sm text-ink-muted dark:text-dark-ink-muted">30 N Gould St Ste #62633</p>
         <p className="text-sm text-ink-muted dark:text-dark-ink-muted">Sheridan, WY 82801</p>
         <p className="text-sm text-ink-muted dark:text-dark-ink-muted">United States</p>
        </div>
       </div>
      </div>
     </Reveal>
    </div>
   </div>

   <Reveal from="up" delay={100} className="mt-stack-xl overflow-hidden rounded-lg border border-outline-variant dark:border-dark-outline-variant">
    <FooterMap />
   </Reveal>
  </section>
 );
}
