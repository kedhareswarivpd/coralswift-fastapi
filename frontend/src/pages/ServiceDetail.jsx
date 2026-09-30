import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Icon from '../components/ui/Icon.jsx';
import Pulse, { SkeletonHeading, SkeletonText, SkeletonCard } from '../components/ui/Skeleton.jsx';
import NotFound from './NotFound.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import { fetchServices } from '../api/services.js';
import { services as demoServices } from '../data/services.js';

// The backend's `services` resource (backend/app/schemas/service.py) is
// public-GET only (no per-item detail endpoint) — this fetches the live
// published list and finds the matching slug client-side, then renders
// every field the CMS admin form (ContentManager.jsx's `services` resource)
// actually lets an admin manage, per the Service Content Workflow (source
// PDF §6): Overview → Business Problems → Solutions → Features → Benefits →
// Process → Technology Stack → Deliverables → FAQs → CTA.
function ListSection({ heading, items }) {
 if (!items?.length) return null;
 // `process` comes back as `[{label}, ...]` (backend schema types it
 // list[dict], not list[str]); every other list field here is plain
 // strings — normalize both to a display string uniformly.
 const labels = items.map((item) => (typeof item === 'string' ? item : item?.label ?? JSON.stringify(item)));
 return (
  <div className="mb-12">
   <h2 className="mb-6 font-display text-headline-sm text-brand">{heading}</h2>
   <div className="grid gap-6 sm:grid-cols-2">
    {labels.map((label) => (
     <div key={label} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface">
      <Icon name="check_circle" className="text-2xl text-brand" />
      <span className="font-body text-body-md text-ink dark:text-dark-ink">{label}</span>
     </div>
    ))}
   </div>
  </div>
 );
}

function ProseSection({ heading, text }) {
 if (!text) return null;
 return (
  <div className="mb-12">
   <h2 className="mb-4 font-display text-headline-sm text-brand">{heading}</h2>
   <p className="max-w-3xl font-body text-body-lg leading-relaxed text-ink dark:text-dark-ink">{text}</p>
  </div>
 );
}

function GallerySection({ images }) {
 if (!images?.length) return null;
 return (
  <div className="mb-12">
   <h2 className="mb-6 font-display text-headline-sm text-brand">Gallery</h2>
   <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {images.map((src) => (
     <img key={src} src={src} alt="" className="aspect-video w-full rounded-lg object-cover" />
    ))}
   </div>
  </div>
 );
}

function FaqSection({ faqs }) {
 if (!faqs?.length) return null;
 return (
  <div className="mb-12">
   <h2 className="mb-6 font-display text-headline-sm text-brand">Frequently Asked Questions</h2>
   <div className="space-y-4">
    {faqs.map((faq) => (
     <details key={faq.question} className="rounded-lg border border-outline-variant bg-white p-6 dark:border-dark-outline-variant dark:bg-dark-surface">
      <summary className="cursor-pointer font-body font-semibold text-ink dark:text-dark-ink">{faq.question}</summary>
      <p className="mt-3 font-body text-body-md text-ink-muted dark:text-dark-ink-muted">{faq.answer}</p>
     </details>
    ))}
   </div>
  </div>
 );
}

export default function ServiceDetail() {
 const { slug } = useParams();
 const [service, setService] = useState(undefined); // undefined = loading, null = not found
 useDocumentTitle(service ? `${service.name} | CoralSwift Technologies` : 'Services | CoralSwift Technologies');

 useEffect(() => {
  setService(undefined);
  fetchServices({ limit: 100 })
   .then((res) => {
    const match = (res?.data || []).find((s) => s.slug === slug);
    setService(match || null);
   })
   .catch(() => {
    // Backend unreachable — resolve from the bundled demo dataset so the
    // public detail pages stay browsable instead of rendering a 404.
    // Demo records are authored in ServiceCard shape (title/description);
    // map them onto the API field names rendered below. Sections whose
    // fields the demo data doesn't carry simply don't render.
    const demo = demoServices.find((s) => s.slug === slug);
    setService(demo ? { ...demo, name: demo.title, overview: demo.description } : null);
   });
 }, [slug]);

 if (service === undefined) {
  return (
   <main className="min-h-screen bg-surface dark:bg-dark-surface">
    <div className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
     <div className="mb-12 flex items-center gap-4">
      <Pulse className="size-16" rounded="rounded-xl" />
      <SkeletonHeading width="w-1/3" className="h-10" />
     </div>
     <SkeletonText lines={3} className="mb-12 max-w-3xl" />
     <div className="mb-12 grid gap-6 sm:grid-cols-2">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
     </div>
    </div>
   </main>
  );
 }
 if (!service) return <NotFound />;

 return (
  <main className="min-h-screen bg-surface dark:bg-dark-surface">
   <div className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
    <div className="mb-12 flex items-center gap-4">
     <div className="flex size-16 items-center justify-center rounded-xl bg-accent-cyan-pale">
      <Icon name={service.icon || 'domain'} className="text-5xl text-brand" />
     </div>
     <h1 className="font-display text-headline-lg text-brand-dark dark:text-dark-brand">{service.name}</h1>
    </div>

    <ProseSection heading="Overview" text={service.overview} />
    <ProseSection heading="Business Problems" text={service.business_problems} />
    <ProseSection heading="Our Solution" text={service.solutions} />
    <ListSection heading="Key Features" items={service.features} />
    <ListSection heading="Benefits" items={service.benefits} />
    <ListSection heading="Our Process" items={service.process} />
    <ListSection heading="Technology Stack" items={service.technology_stack} />
    <ListSection heading="Deliverables" items={service.deliverables} />
    <GallerySection images={service.gallery} />
    <FaqSection faqs={service.faqs} />

    <Link
     to="/services"
     className="mb-12 flex w-fit items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:text-brand-dark"
    >
     <Icon name="arrow_back" />
     Back to Services
    </Link>
   </div>
   <CtaBanner />
  </main>
 );
}
