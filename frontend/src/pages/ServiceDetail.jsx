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
    const items = res?.data || [];
    let match = items.find((s) => s.slug === slug);
    if (!match) {
     match = demoServices.find((s) => s.slug === slug);
    }
    if (!match) {
     match = items.find((s) => s.slug.includes(slug) || slug.includes(s.slug))
          || demoServices.find((s) => s.slug.includes(slug) || slug.includes(s.slug));
    }
    if (!match) {
     const cleanTitle = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
     match = {
      name: cleanTitle,
      title: cleanTitle,
      icon: 'code',
      overview: `Comprehensive ${cleanTitle} solutions tailored to your enterprise architecture and business workflows.`,
      business_problems: `Addressing legacy operational bottlenecks, scaling challenges, and technical debt in ${cleanTitle}.`,
      solutions: `End-to-end ${cleanTitle} services with modern cloud architecture, automation, and 24/7 reliability.`,
      features: ['Enterprise Scalability', 'Automated CI/CD Integration', 'Role-Based Access Control', '24/7 SLA Telemetry'],
      benefits: ['High Reliability', 'Lower Total Cost of Ownership', 'Faster Release Cycles', 'Full Security Compliance'],
      process: [
       { step: '01', title: 'Requirements Audit', description: 'Technical mapping and workflow audit.' },
       { step: '02', title: 'Architecture & UX', description: 'System modeling and prototype sign-off.' },
       { step: '03', title: 'Agile Delivery', description: 'Sprint execution with automated QA gates.' },
       { step: '04', title: 'Production Rollout', description: 'Zero-downtime deployment and telemetry monitoring.' },
      ],
      technology_stack: ['React / Next.js', 'Python FastAPI / Node.js', 'PostgreSQL & Redis', 'Docker & Kubernetes'],
      deliverables: ['Production System', 'Source Code & Documentation', 'Automated Pipeline'],
     };
    }
    setService(match ? { ...match, name: match.name || match.title, overview: match.overview || match.description } : null);
   })
   .catch(() => {
    let demo = demoServices.find((s) => s.slug === slug || s.slug.includes(slug) || slug.includes(s.slug));
    if (!demo) {
     const cleanTitle = slug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
     demo = {
      name: cleanTitle,
      title: cleanTitle,
      icon: 'code',
      overview: `Comprehensive ${cleanTitle} solutions tailored to your enterprise architecture and business workflows.`,
      business_problems: `Addressing legacy operational bottlenecks, scaling challenges, and technical debt in ${cleanTitle}.`,
      solutions: `End-to-end ${cleanTitle} services with modern cloud architecture, automation, and 24/7 reliability.`,
      features: ['Enterprise Scalability', 'Automated CI/CD Integration', 'Role-Based Access Control', '24/7 SLA Telemetry'],
      benefits: ['High Reliability', 'Lower Total Cost of Ownership', 'Faster Release Cycles', 'Full Security Compliance'],
      process: [
       { step: '01', title: 'Requirements Audit', description: 'Technical mapping and workflow audit.' },
       { step: '02', title: 'Architecture & UX', description: 'System modeling and prototype sign-off.' },
       { step: '03', title: 'Agile Delivery', description: 'Sprint execution with automated QA gates.' },
       { step: '04', title: 'Production Rollout', description: 'Zero-downtime deployment and telemetry monitoring.' },
      ],
      technology_stack: ['React / Next.js', 'Python FastAPI / Node.js', 'PostgreSQL & Redis', 'Docker & Kubernetes'],
      deliverables: ['Production System', 'Source Code & Documentation', 'Automated Pipeline'],
     };
    }
    setService({ ...demo, name: demo.name || demo.title, overview: demo.overview || demo.description });
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
