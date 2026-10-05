import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Icon from '../components/ui/Icon.jsx';
import Pulse, { SkeletonHeading, SkeletonCard } from '../components/ui/Skeleton.jsx';
import NotFound from './NotFound.jsx';
import CtaBanner from '../components/home/CtaBanner.jsx';
import { fetchCaseStudies } from '../api/cms.js';

function ProseSection({ heading, text }) {
  if (!text) return null;
  return (
    <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xs dark:border-slate-800 dark:bg-dark-surface sm:p-8">
      <h2 className="mb-3 font-display text-2xl font-bold text-ink dark:text-dark-ink">{heading}</h2>
      <p className="font-body text-body-md leading-relaxed text-ink-muted dark:text-dark-ink-muted sm:text-base">{text}</p>
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
        <div className="relative h-80 overflow-hidden md:h-[440px]">
          {/* Sleek Dark Gradient Overlay replacing harsh orange */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-900/75 to-slate-900/40" />
          <img src={study.cover_image} alt={study.title} className="size-full object-cover" />
          <div className="absolute inset-0 z-20 mx-auto flex max-w-container flex-col justify-end px-4 pb-12 sm:px-6 lg:px-10 xl:px-12">
            {study.industry && (
              <span className="mb-4 w-fit rounded-full border border-orange-200/80 bg-orange-50/90 px-4 py-1 font-display text-xs font-semibold text-orange-600 dark:border-orange-800/80 dark:bg-orange-950/60 dark:text-orange-400">
                {study.industry}
              </span>
            )}
            <h1 className="max-w-4xl font-display text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl leading-tight">
              {study.title}
            </h1>
            {study.client_name && (
              <p className="mt-3 font-body text-body-md font-medium text-slate-300">
                Client: <span className="text-white font-semibold">{study.client_name}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-container px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-12">
        {!study.cover_image && (
          <div className="mb-10">
            {study.industry && (
              <span className="mb-4 inline-block rounded-full border border-orange-200/80 bg-orange-50/90 px-4 py-1 font-display text-xs font-semibold text-orange-600 dark:border-orange-800/80 dark:bg-orange-950/60 dark:text-orange-400">
                {study.industry}
              </span>
            )}
            <h1 className="mb-3 font-display text-3xl font-extrabold text-ink dark:text-dark-ink sm:text-4xl lg:text-5xl">
              {study.title}
            </h1>
            {study.client_name && (
              <p className="text-body-md text-ink-muted dark:text-dark-ink-muted">Client: {study.client_name}</p>
            )}
          </div>
        )}

        <ProseSection heading="The Problem" text={study.problem} />
        <ProseSection heading="Our Solution" text={study.solution} />
        <ProseSection heading="Implementation" text={study.implementation} />
        <ProseSection heading="Results" text={study.result} />

        {study.roi && (
          <div className="mb-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-md border border-slate-700/60">
            <h2 className="mb-2 font-display text-xl font-bold">Return on Investment</h2>
            <p className="font-body text-body-lg text-slate-200">{study.roi}</p>
          </div>
        )}

        {study.customer_feedback && (
          <blockquote className="mb-10 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xs dark:border-slate-800 dark:bg-dark-surface">
            <p className="font-body text-body-lg italic text-ink dark:text-dark-ink">&ldquo;{study.customer_feedback}&rdquo;</p>
          </blockquote>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-4">
          {study.download_url && (
            <a
              href={study.download_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-3 font-display text-xs font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
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
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-6 py-3 font-display text-xs font-bold text-slate-800 transition-all hover:border-orange-500 hover:text-orange-600 dark:border-slate-700 dark:bg-dark-surface dark:text-slate-200 dark:hover:border-orange-400"
            >
              <Icon name="download" /> {d.label || 'Download'}
            </a>
          ))}
          <Link
            to="/case-studies"
            className="inline-flex items-center gap-2 font-display text-xs font-bold text-orange-600 transition-all hover:translate-x-[-4px] dark:text-orange-400"
          >
            <Icon name="arrow_back" /> Back to Case Studies
          </Link>
        </div>
      </div>
      <CtaBanner />
    </main>
  );
}
