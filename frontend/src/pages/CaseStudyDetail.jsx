import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Icon from '../components/ui/Icon.jsx';
import Badge from '../components/ui/Badge.jsx';
import Pulse, { SkeletonHeading, SkeletonCard } from '../components/ui/Skeleton.jsx';
import NotFound from './NotFound.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import { fetchCaseStudies } from '../api/cms.js';

function ProseSection({ heading, text }) {
 if (!text) return null;
 return (
  <div className="mb-10 rounded-lg border border-outline-variant bg-white p-8 dark:border-dark-outline-variant dark:bg-dark-surface">
   <h2 className="mb-4 font-display text-headline-sm text-brand">{heading}</h2>
   <p className="font-body text-body-md leading-relaxed text-ink-muted dark:text-dark-ink-muted">{text}</p>
  </div>
 );
}

export default function CaseStudyDetail() {
 const { slug } = useParams();
 const [study, setStudy] = useState(undefined); // undefined = loading, null = not found
 useDocumentTitle(study ? `${study.title} | CoralSwift Technologies` : 'Case Studies | CoralSwift Technologies');

 useEffect(() => {
  setStudy(undefined);
  fetchCaseStudies({ limit: 100 })
   .then((res) => {
    const match = (res?.data || []).find((cs) => cs.slug === slug);
    setStudy(match || null);
   })
   .catch(() => setStudy(null));
 }, [slug]);

 if (study === undefined) {
  return (
   <main className="min-h-screen bg-surface dark:bg-dark-surface">
    <Pulse className="h-80 w-full md:h-[420px]" rounded="rounded-none" />
    <div className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
     <SkeletonHeading width="w-2/3" className="mb-8 h-10" />
     <div className="space-y-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
     </div>
    </div>
   </main>
  );
 }
 if (!study) return <NotFound />;

 return (
  <main className="min-h-screen bg-surface dark:bg-dark-surface">
   {study.cover_image && (
    <div className="relative h-80 overflow-hidden md:h-[420px]">
     <div className="absolute inset-0 z-10 bg-brand/60" />
     <img src={study.cover_image} alt={study.title} className="size-full object-cover" />
     <div className="absolute inset-0 z-20 mx-auto flex max-w-container flex-col justify-end px-4 pb-10 sm:px-6 lg:px-10 xl:px-12 ">
      {study.industry && (
       <span className="mb-4 w-fit rounded bg-accent-cyan px-4 py-1 text-body-sm font-bold text-brand-dark">{study.industry}</span>
      )}
      <h1 className="max-w-3xl font-display text-headline-lg text-white">{study.title}</h1>
      {study.client_name && <p className="mt-2 text-body-md text-white/80">Client: {study.client_name}</p>}
     </div>
    </div>
   )}

   <div className="mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
    {!study.cover_image && (
     <>
      {study.industry && <Badge className="mb-4 bg-accent-cyan-pale text-label-caps text-brand">{study.industry}</Badge>}
      <h1 className="mb-2 font-display text-headline-lg text-brand-dark dark:text-dark-brand">{study.title}</h1>
      {study.client_name && <p className="mb-8 text-body-md text-ink-muted dark:text-dark-ink-muted">Client: {study.client_name}</p>}
     </>
    )}

    <ProseSection heading="The Problem" text={study.problem} />
    <ProseSection heading="Our Solution" text={study.solution} />
    <ProseSection heading="Implementation" text={study.implementation} />
    <ProseSection heading="Results" text={study.result} />

    {study.roi && (
     <div className="mb-10 rounded-lg bg-brand p-8 text-white">
      <h2 className="mb-2 font-display text-headline-sm">Return on Investment</h2>
      <p className="font-body text-body-lg">{study.roi}</p>
     </div>
    )}

    {study.customer_feedback && (
     <blockquote className="mb-10 rounded-lg border border-outline-variant bg-white p-8 dark:border-dark-outline-variant dark:bg-dark-surface">
      <p className="font-body text-body-lg italic text-ink dark:text-dark-ink">&ldquo;{study.customer_feedback}&rdquo;</p>
     </blockquote>
    )}

    <div className="flex flex-wrap items-center gap-4">
     {study.download_url && (
      <a
       href={study.download_url}
       target="_blank"
       rel="noreferrer"
       className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark"
      >
       <Icon name="download" /> Download Case Study
      </a>
     )}
     {study.downloads?.map((d) => (
      <a
       key={d.url}
       href={d.url}
       target="_blank"
       rel="noreferrer"
       className="inline-flex items-center gap-2 rounded-full border border-brand px-6 py-3 font-label-caps text-label-caps uppercase text-brand transition-colors hover:bg-brand hover:text-white"
      >
       <Icon name="download" /> {d.label || 'Download'}
      </a>
     ))}
     <Link to="/case-studies" className="flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand transition-all hover:text-brand-dark">
      <Icon name="arrow_back" /> Back to Case Studies
     </Link>
    </div>
   </div>
   <CtaBanner />
  </main>
 );
}
