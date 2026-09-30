import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import Reveal from '../ui/Reveal.jsx';

export default function FaqSection({ categories }) {
 const [activeCategory, setActiveCategory] = useState(categories[0]?.name);
 const [openItems, setOpenItems] = useState(new Set());

 const toggleItem = (question) => {
  setOpenItems((prev) => {
   const next = new Set(prev);
   if (next.has(question)) next.delete(question);
   else next.add(question);
   return next;
  });
 };

 const currentCategory = categories.find((c) => c.name === activeCategory);
 const items = currentCategory?.items ?? [];

 return (
  <section className="py-section-padding">
   <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
    <div className="mb-stack-lg flex flex-wrap gap-2">
     {categories.map((cat) => (
      <button
       key={cat.name}
       onClick={() => { setActiveCategory(cat.name); setOpenItems(new Set()); }}
       className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-caps text-label-caps uppercase transition-all ${
        activeCategory === cat.name
         ? 'bg-brand text-white'
         : 'bg-surface-container text-ink-muted hover:bg-outline-variant dark:bg-dark-surface-container dark:text-dark-ink-muted dark:hover:bg-dark-outline-variant'
       }`}
      >
       <Icon name={cat.icon} className="text-lg" />
       {cat.name}
      </button>
     ))}
    </div>
    <div className="mx-auto max-w-3xl space-y-stack-md">
     {items.map((item, i) => {
      const isOpen = openItems.has(item.question);
      return (
       <Reveal key={item.question} from="left" delay={i * 60}>
        <div className="overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface">
         <button
          id={`faq-section-btn-${item.question.replace(/\s+/g, '-')}`}
          onClick={() => toggleItem(item.question)}
          aria-expanded={isOpen}
          aria-controls={`faq-section-${item.question.replace(/\s+/g, '-')}`}
          className="flex w-full items-center justify-between px-stack-lg py-4 text-left transition-colors hover:bg-surface-container dark:hover:bg-dark-surface-container"
         >
          <span className="pr-4 font-body text-body-md font-semibold text-brand-dark dark:text-dark-brand">
           {item.question}
          </span>
          <Icon
           name={isOpen ? 'remove' : 'add'}
           className="flex-shrink-0 text-xl text-brand"
          />
         </button>
         {isOpen && (
          <div
           id={`faq-section-${item.question.replace(/\s+/g, '-')}`}
           role="region"
           aria-labelledby={`faq-section-btn-${item.question.replace(/\s+/g, '-')}`}
           className="px-stack-lg pb-4"
          >
           <p className="text-body-md text-ink-muted dark:text-dark-ink-muted">{item.answer}</p>
          </div>
         )}
        </div>
       </Reveal>
      );
     })}
    </div>
   </div>
  </section>
 );
}
