import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { faqs as fallbackFaqs } from '../../data/services.js';
import { fetchFaqs } from '../../api/cms.js';
import Icon from '../ui/Icon.jsx';

// This section sits on the Services *listing* page (pages/Services.jsx),
// not any single service's detail page — there's no one Service record in
// scope here, so it can't render a particular service's own `faqs` field
// (that's what ServiceDetail.jsx's own inline FaqSection already does).
// It's a generic "Common Questions" block about engaging with CoralSwift,
// which is exactly what the global FAQ resource's "services" category is
// for (see backend/app/seeders/cms_seed.py's FAQS list) — same live,
// admin-editable resource pages/Faq.jsx already reads, just scoped to the
// services-engagement questions instead of every category.
function toFrontend(apiItems) {
 return apiItems.map((item) => ({ question: item.question, answer: item.answer }));
}

export default function FaqAccordion() {
 const [openIndex, setOpenIndex] = useState(0);
 const [faqs, setFaqs] = useState(fallbackFaqs);

 useEffect(() => {
  fetchFaqs({ category: 'services' })
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setFaqs(toFrontend(items));
   })
   .catch(() => {});
 }, []);

 return (
  <section className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
   <div className="grid gap-gutter lg:grid-cols-12">
    <div className="lg:col-span-4">
     <h2 className="mb-stack-md font-display text-headline-md text-brand-dark dark:text-white">Common Questions</h2>
     <p className="mb-stack-lg text-body-md text-ink-muted dark:text-white">
      Everything you need to know about partnering with CoralSwift on your next technical venture.
     </p>
     <div className="rounded-lg border border-brand/20 bg-accent-cyan-pale p-stack-md dark:border-brand/30 dark:bg-dark-surface-container">
      <p className="text-body-sm font-semibold text-brand-dark dark:text-white">Need specialized answers?</p>
      <Link to="/contact" className="mt-2 inline-block text-body-sm font-bold text-brand hover:underline">
       Speak with a Solution Architect
      </Link>
     </div>
    </div>
    <div className="space-y-4 lg:col-span-8">
     {faqs.map((faq, index) => (
      <FaqItem
       key={faq.question}
       faq={faq}
       index={index}
       isOpen={openIndex === index}
       onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
      />
     ))}
    </div>
   </div>
  </section>
 );
}

function FaqItem({ faq, isOpen, onToggle, index }) {
 const id = `faq-${index}`;
 const buttonId = `faq-btn-${index}`;
 return (
  <div className="rounded-lg border border-outline-variant bg-surface-low p-stack-md dark:border-dark-outline-variant dark:bg-dark-surface-low">
   <button
    id={buttonId}
    onClick={onToggle}
    aria-expanded={isOpen}
    aria-controls={id}
    className="flex w-full cursor-pointer items-center justify-between text-left font-display text-body-lg font-semibold text-ink dark:text-white"
   >
    {faq.question}
    <Icon name="expand_more" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
   </button>
   {isOpen && (
    <div
     id={id}
     role="region"
     aria-labelledby={buttonId}
     className="pt-4 text-body-md text-ink-muted dark:text-white"
    >
     {faq.answer}
    </div>
   )}
  </div>
 );
}
