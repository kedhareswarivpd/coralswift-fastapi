import { useEffect, useState } from 'react';
import { fetchTestimonials } from '../../api/cms.js';
import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import Reveal from '../ui/Reveal.jsx';

const FALLBACK_TESTIMONIALS = [
  {
    id: 't-1',
    rating: 5,
    content: 'CoralSwift replatformed our core transaction ledger to a distributed event-driven architecture, reducing P99 latency by 73% while handling 40,000 TPS.',
    author_name: 'Marcus Vance',
    author_title: 'VP of Engineering',
    company_name: 'Apex Financial Technologies',
  },
  {
    id: 't-2',
    rating: 5,
    content: 'Their team built our deterministic RAG pipeline and fine-tuned domain models with full HIPAA compliance. The velocity and architectural rigor were exceptional.',
    author_name: 'Dr. Elena Rostova',
    author_title: 'Head of AI Platforms',
    company_name: 'BioSyn Health',
  },
  {
    id: 't-3',
    rating: 5,
    content: 'Migrating 42 monolithic services to Kubernetes with zero downtime seemed impossible until CoralSwift executed their canary wave framework flawlessly.',
    author_name: 'David Chen',
    author_title: 'Chief Technology Officer',
    company_name: 'OmniRoute Logistics',
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    fetchTestimonials({ limit: 6 })
      .then((res) => {
        if (res?.data?.length) setTestimonials(res.data);
      })
      .catch(() => {});
  }, []);

  if (!testimonials.length) return null;

  return (
    <section className="bg-surface-container px-4 py-section-padding dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto max-w-container">
        <div className="mb-stack-xl text-center">
          <p className="mb-2 font-label-caps text-label-caps uppercase text-brand">What Our Clients Say</p>
          <h2 className="font-display text-headline-lg text-brand-dark dark:text-dark-brand">Trusted by teams who ship</h2>
        </div>
        <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} from="up" delay={i * 80}>
              <div className="card-interactive group flex h-full flex-col justify-between rounded-xl border border-outline-variant/80 bg-white p-stack-lg dark:border-dark-outline-variant/80 dark:bg-dark-surface">
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
                  <div>
                    <p className="font-semibold text-ink transition-colors duration-200 group-hover:text-brand dark:text-dark-ink">
                      {t.author_name}
                    </p>
                    <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">
                      {[t.author_title, t.company_name].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
