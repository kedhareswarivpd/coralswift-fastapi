import DOMPurify from 'dompurify';
import Reveal from '../ui/Reveal.jsx';

// `content` is either the static shape from data/legal.js ({ title,
// lastUpdated, sections: [{ title, content }] }) used as an offline/loading
// fallback, or the live CMS shape ({ title, lastUpdated, html }) once
// PageContent has loaded — see pages/Privacy.jsx, Terms.jsx, Cookies.jsx.
// CMS-authored HTML is sanitized here before rendering, same pattern as
// BlogDetail.jsx.
export default function LegalContent({ content }) {
 const sanitizedHtml = content.html ? DOMPurify.sanitize(content.html, { USE_PROFILES: { html: true } }) : null;
 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mx-auto max-w-3xl">
     <Reveal>
      <div className="mb-stack-lg">
       <span className="font-label-caps text-label-caps uppercase tracking-widest text-brand">
        Last Updated: {content.lastUpdated}
       </span>
       <h1 className="mt-2 font-display text-headline-lg text-brand-dark dark:text-dark-brand">{content.title}</h1>
      </div>
     </Reveal>
     {sanitizedHtml ? (
      <Reveal>
       {/* Sanitized via DOMPurify above — CMS-authored rich text is the only HTML rendered here. */}
       <div
        className="prose max-w-none space-y-stack-lg font-body text-body-md leading-relaxed text-ink-muted dark:text-dark-ink-muted"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
       />
      </Reveal>
     ) : (
      <div className="space-y-stack-lg">
       {content.sections.map((section) => (
        <Reveal key={section.title}>
         <div>
          <h2 className="mb-3 font-display text-headline-sm text-brand-dark dark:text-dark-brand">{section.title}</h2>
          <p className="text-body-md leading-relaxed text-ink-muted dark:text-dark-ink-muted">{section.content}</p>
         </div>
        </Reveal>
       ))}
      </div>
     )}
    </div>
   </div>
  </section>
 );
}
