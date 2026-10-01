import { useEffect, useState } from 'react';
import { fetchTestimonials } from '../../api/cms.js';
import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import Reveal from '../ui/Reveal.jsx';


const FALLBACK_TESTIMONIALS = [
  {
    id: 't-1',
    rating: 5,
    content: 'Working with CoralSwift on our patient portal modernization was seamless — they understood our compliance constraints from day one.',
    author_name: 'Aditi Sharma',
    author_title: 'CTO',
    company_name: 'Meridian Health Group',
  },
  {
    id: 't-2',
    rating: 5,
    content: 'Our omnichannel platform rollout was on time and on budget, which is rare for a project this size.',
    author_name: 'Rahul Verma',
    author_title: 'Head of Digital',
    company_name: 'Vantage Retail Co',
  },
  {
    id: 't-3',
    rating: 4,
    content: 'The warehouse management system CoralSwift built has cut our fulfillment errors dramatically.',
    author_name: 'Priya Iyer',
    author_title: 'COO',
    company_name: 'Northwind Logistics',
  },
  {
    id: 't-4',
    rating: 5,
    content: 'Their engineering team integrated cleanly with ours — genuinely felt like an extension of our team.',
    author_name: 'Karan Malhotra',
    author_title: 'VP Engineering',
    company_name: 'Sterling Finance Corp',
  },
  {
    id: 't-5',
    rating: 5,
    content: 'The LMS migration was handled with almost no disruption to active students, which was our biggest worry.',
    author_name: 'Neha Kapoor',
    author_title: 'Director of IT',
    company_name: 'BrightPath Education',
  },
  {
    id: 't-6',
    rating: 4,
    content: "CoralSwift's booking platform redesign directly improved our conversion rate within the first quarter.",
    author_name: 'Vikram Nair',
    author_title: 'CIO',
    company_name: 'Coastal Hospitality Group',
  },
  {
    id: 't-7',
    rating: 5,
    content: 'Predictive maintenance alerts have already prevented two unplanned production stops in our factory.',
    author_name: 'Sana Chopra',
    author_title: 'Plant Operations Director',
    company_name: 'Ridgeline Manufacturing',
  },
  {
    id: 't-8',
    rating: 5,
    content: 'Claims processing time dropped significantly after the automation work CoralSwift delivered.',
    author_name: 'Arjun Reddy',
    author_title: 'Head of Claims',
    company_name: 'Harbor Insurance Partners',
  },
  {
    id: 't-9',
    rating: 5,
    content: 'CoralSwift replatformed our core transaction ledger to a distributed event-driven architecture, reducing P99 latency by 73% while handling 40,000 TPS.',
    author_name: 'Marcus Vance',
    author_title: 'VP of Engineering',
    company_name: 'Apex Financial Technologies',
  },
  {
    id: 't-10',
    rating: 5,
    content: 'Their team built our deterministic RAG pipeline and fine-tuned domain models with full HIPAA compliance. The velocity and architectural rigor were exceptional.',
    author_name: 'Dr. Elena Rostova',
    author_title: 'Head of AI Platforms',
    company_name: 'BioSyn Health',
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchTestimonials({ limit: 20 })
      .then((res) => {
        if (res?.data?.length) {
          // If server returned less than 6, append fallbacks so marquee stays rich & infinite
          const combined = res.data.length < 6 
            ? [...res.data, ...FALLBACK_TESTIMONIALS.slice(res.data.length)] 
            : res.data;
          setTestimonials(combined);
        }
      })
      .catch(() => {});
  }, []);

  if (!testimonials.length) return null;

  // Duplicate items array for seamless 100% infinite CSS marquee scroll
  const marqueeItems = [...testimonials, ...testimonials];

  return (
    <section className="relative overflow-hidden bg-surface-container py-section-padding dark:bg-dark-surface-container">
      <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="mb-stack-xl text-center">
          <p className="mb-2 font-label-caps text-label-caps uppercase text-brand">What Our Clients Say</p>
          <h2 className="font-display text-headline-lg text-brand-dark dark:text-dark-brand">Trusted by teams who ship</h2>
        </div>
      </div>

      {/* Marquee Container with Gradient Edge Masks */}
      <div className="relative w-full overflow-hidden">
        {/* Left Fade Mask */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-r from-surface-container to-transparent dark:from-dark-surface-container sm:w-28 lg:w-36" />
        
        {/* Right Fade Mask */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-16 bg-gradient-to-l from-surface-container to-transparent dark:from-dark-surface-container sm:w-28 lg:w-36" />

        {/* Scroll Track */}
        <div
          className="no-scrollbar overflow-x-auto py-4"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className={`flex gap-6 pl-4 sm:pl-6 lg:pl-10 ${isPaused ? 'paused' : ''} animate-marquee`}>


            {marqueeItems.map((t, i) => (
              <div
                key={`${t.id}-${i}`}
                className="card-interactive group flex w-[320px] shrink-0 flex-col justify-between rounded-2xl border border-outline-variant/80 bg-white p-6 shadow-sm transition-all duration-300 hover:border-brand/40 hover:shadow-xl dark:border-dark-outline-variant/80 dark:bg-dark-surface sm:w-[380px]"
              >
                <div>
                  {!!t.rating && (
                    <div className="mb-4 flex gap-1 text-amber-500">
                      {Array.from({ length: 5 }, (_, idx) => (
                        <Icon key={idx} name={idx < t.rating ? 'star' : 'star_outline'} className="text-lg transition-transform duration-200 group-hover:scale-110" />
                      ))}
                    </div>
                  )}
                  <p className="mb-6 font-body text-body-md italic leading-relaxed text-ink dark:text-dark-ink">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 border-t border-outline-variant/40 pt-4 dark:border-dark-outline-variant/40">
                  <div className="transition-transform duration-300 group-hover:scale-105">
                    <Avatar name={t.author_name} size="md" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink transition-colors duration-200 group-hover:text-brand dark:text-dark-ink">
                      {t.author_name}
                    </p>
                    <p className="truncate text-body-sm text-ink-muted dark:text-dark-ink-muted">
                      {[t.author_title, t.company_name].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

