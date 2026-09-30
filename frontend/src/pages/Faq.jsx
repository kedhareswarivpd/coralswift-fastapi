import { useEffect, useState } from 'react';
import FaqSection from '../components/faq/FaqSection.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { faqCategories as staticFaqCategories } from '../data/faq.js';
import { fetchFaqs } from '../api/cms.js';

function toFrontend(apiItems) {
 const groups = new Map();
 apiItems.forEach((item) => {
  const key = item.category || 'General';
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ question: item.question, answer: item.answer });
 });
 return Array.from(groups.entries()).map(([name, items]) => ({
  name,
  icon: 'help_outline',
  items,
 }));
}

export default function Faq() {
 useDocumentTitle('FAQ | CoralSwift Technologies');
 const [faqCategories, setFaqCategories] = useState(staticFaqCategories);

 useEffect(() => {
  fetchFaqs()
   .then((res) => {
    const items = res?.data;
    if (Array.isArray(items) && items.length) setFaqCategories(toFrontend(items));
   })
   .catch(() => {});
 }, []);

 return (
  <>
   <section className="bg-brand-dark pb-section-padding pt-32 text-white">
    <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
     <div className="max-w-3xl">
      <span className="font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">FAQ</span>
      <h1 className="mb-6 mt-4 font-display text-headline-lg text-white md:text-display-lg">
       Frequently Asked Questions
      </h1>
      <p className="max-w-2xl text-body-lg text-white/80">
       Quick answers to common questions about our services, engagement models, security practices, and careers.
      </p>
     </div>
    </div>
   </section>
   <FaqSection categories={faqCategories} />
   <CtaBanner />
  </>
 );
}
