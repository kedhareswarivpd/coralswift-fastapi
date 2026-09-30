import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { buildBrochurePdf, brochureCapabilities, brochureHighlights } from '../utils/brochurePdf.js';

export default function BrochurePage() {
 const brochureRef = useRef(null);

 const handleDownload = async () => {
  const pdf = await buildBrochurePdf();
  pdf.save('coralswift-corporate-brochure.pdf');
 };

 return (
  <section className="min-h-screen bg-surface-white px-4 py-section-padding dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12 ">
   <div ref={brochureRef} className="mx-auto max-w-container overflow-hidden rounded-[2rem] border border-outline-variant bg-white shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface-container">
    <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
     <div className="p-8 md:p-12 lg:p-16">
      <p className="mb-4 font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">
       Corporate Brochure 2026
      </p>
      <h1 className="mb-6 font-display text-display-md-mobile text-brand dark:text-dark-brand md:text-display-md">
       Engineering resilient digital futures for ambitious enterprises.
      </h1>
      <p className="mb-8 max-w-2xl text-body-lg leading-relaxed text-ink-muted dark:text-dark-ink-muted">
       CoralSwift partners with global organizations to design, build, and operate secure digital platforms that unlock efficiency, resilience, and growth.
      </p>
      <div className="mb-10 flex flex-wrap gap-4">
       <button
        type="button"
        onClick={handleDownload}
        className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark"
       >
        Download PDF
       </button>
       <Link to="/contact" className="inline-flex items-center justify-center rounded-full border border-outline-variant px-6 py-3 font-label-caps text-label-caps uppercase text-ink-muted transition-colors hover:border-brand hover:text-brand dark:text-dark-ink-muted">
        Talk to us
       </Link>
      </div>

      <div className="rounded-2xl bg-surface-container p-6 dark:bg-dark-surface">
       <h2 className="mb-4 font-display text-headline-sm text-ink dark:text-dark-ink">What you’ll find inside</h2>
       <ul className="space-y-3 text-ink-muted dark:text-dark-ink-muted">
        {brochureHighlights.map((item) => (
         <li key={item} className="flex items-start gap-3">
          <span className="mt-2 size-2.5 rounded-full bg-accent-cyan" />
          <span>{item}</span>
         </li>
        ))}
       </ul>
      </div>
     </div>

     <div className="relative min-h-[320px] md:min-h-[480px]">
      <img
       src="/brochure-hero.svg"
       alt="CoralSwift engineering team collaborating"
       className="size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/70 via-brand-dark/20 to-transparent" />
     </div>
    </div>

    <div className="grid gap-6 border-t border-outline-variant bg-surface-white/70 p-8 dark:border-dark-outline-variant dark:bg-dark-surface/70 md:p-12 lg:grid-cols-[0.95fr_1.05fr]">
     <div>
      <p className="mb-3 font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">Why clients choose us</p>
      <h2 className="mb-4 font-display text-headline-md text-ink dark:text-dark-ink">From concept to execution, with measurable impact.</h2>
      <p className="text-body-md leading-relaxed text-ink-muted dark:text-dark-ink-muted">
       We combine strategic consulting, product engineering, and operational excellence to deliver secure, scalable solutions that create lasting value.
      </p>
     </div>
     <div className="grid gap-4 md:grid-cols-3">
      {brochureCapabilities.map((item) => (
       <div key={item.title} className="rounded-2xl border border-outline-variant bg-white p-5 dark:border-dark-outline-variant dark:bg-dark-surface-container">
        <h3 className="mb-2 font-display text-headline-sm text-ink dark:text-dark-ink">{item.title}</h3>
        <p className="text-body-sm leading-relaxed text-ink-muted dark:text-dark-ink-muted">{item.description}</p>
       </div>
      ))}
     </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-outline-variant p-8 dark:border-dark-outline-variant md:px-12 md:py-10">
     <div>
      <p className="mb-2 font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">Ready to explore</p>
      <p className="text-body-md text-ink-muted dark:text-dark-ink-muted">See how CoralSwift can support your next transformation initiative.</p>
     </div>
     <div className="flex flex-wrap gap-3">
      <Link to="/downloads" className="text-brand hover:underline dark:text-dark-brand">
       Back to Downloads
      </Link>
      <Link to="/contact" className="text-brand hover:underline dark:text-dark-brand">
       Request a consultation
      </Link>
     </div>
    </div>
   </div>
  </section>
 );
}
