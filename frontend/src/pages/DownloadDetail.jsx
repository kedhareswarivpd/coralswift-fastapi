import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Icon from '../components/ui/Icon.jsx';
import Pulse, { SkeletonHeading, SkeletonText, SkeletonButton } from '../components/ui/Skeleton.jsx';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import { fetchDownloads } from '../api/cms.js';

// The backend's `downloads` resource (backend/app/routers/download.py) is a
// plain title/description/file_url/file_type/category record — there is no
// per-item detail endpoint, and no rich "highlights/capabilities" content
// model to render. This page fetches the live list and finds the matching
// id client-side (a small, fully public catalog — no different from any
// other CMS listing page on this site), rather than fabricating content
// fields the backend doesn't have.
export default function DownloadDetail() {
 const { slug: id } = useParams();
 const [item, setItem] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  fetchDownloads()
   .then((res) => {
    const match = (res?.data || []).find((d) => d.id === id);
    setItem(match || null);
   })
   .catch(() => setItem(null))
   .finally(() => setLoading(false));
 }, [id]);

 useDocumentTitle(item ? `${item.title} | CoralSwift Technologies` : 'Downloads | CoralSwift Technologies');

 if (loading) {
  return (
   <section className="min-h-screen bg-surface-white px-4 py-section-padding dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12 ">
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-outline-variant bg-white p-8 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface md:p-12">
     <Pulse className="mb-4 h-4 w-32" />
     <SkeletonHeading width="w-3/4" className="mb-6 h-10" />
     <SkeletonText lines={3} className="mb-8 max-w-2xl" />
     <div className="flex flex-wrap gap-4">
      <SkeletonButton width="w-40" />
      <SkeletonButton width="w-40" />
     </div>
    </div>
   </section>
  );
 }

 if (!item) {
  return (
   <section className="min-h-screen bg-surface-white px-4 py-section-padding dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12 ">
    <div className="mx-auto max-w-container rounded-3xl border border-outline-variant bg-white p-8 text-center dark:border-dark-outline-variant dark:bg-dark-surface">
     <h1 className="mb-4 font-display text-display-md text-brand">Download not found</h1>
     <p className="mb-6 text-ink-muted dark:text-dark-ink-muted">The requested document could not be found — it may have been removed or unpublished.</p>
     <Link to="/downloads" className="inline-flex items-center gap-2 font-label-caps text-label-caps uppercase text-brand hover:text-brand-dark">
      <Icon name="arrow_back" /> Back to Downloads
     </Link>
    </div>
   </section>
  );
 }

 return (
  <section className="min-h-screen bg-surface-white px-4 py-section-padding dark:bg-dark-surface sm:px-6 lg:px-10 xl:px-12 ">
   <div className="mx-auto max-w-3xl rounded-[2rem] border border-outline-variant bg-white p-8 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface md:p-12">
    <p className="mb-4 font-label-caps text-label-caps uppercase tracking-widest text-accent-cyan">{item.category || 'Resource'}</p>
    <h1 className="mb-6 font-display text-display-md-mobile text-brand md:text-display-md">{item.title}</h1>
    {item.description && (
     <p className="mb-8 max-w-2xl text-body-lg leading-relaxed text-ink-muted dark:text-dark-ink-muted">{item.description}</p>
    )}
    <div className="mb-8 flex flex-wrap items-center gap-4 text-body-sm text-ink-muted dark:text-dark-ink-muted">
     {item.file_type && (
      <span className="flex items-center gap-1"><Icon name="description" className="text-lg text-brand" />{item.file_type}</span>
     )}
     <span className="flex items-center gap-1"><Icon name="download" className="text-lg" />{item.download_count ?? 0} downloads</span>
    </div>
    <div className="flex flex-wrap gap-4">
     {item.file_url ? (
      <a
       href={item.file_url}
       target="_blank"
       rel="noreferrer"
       className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark"
      >
       <Icon name="download" /> Download {item.file_type || 'File'}
      </a>
     ) : (
      <p className="text-body-sm text-status-error-text">No file is attached to this resource yet.</p>
     )}
     <Link to="/downloads" className="inline-flex items-center justify-center rounded-full border border-outline-variant px-6 py-3 font-label-caps text-label-caps uppercase text-ink-muted transition-colors hover:border-brand hover:text-brand dark:border-dark-outline-variant">
      Back to Downloads
     </Link>
    </div>
   </div>
  </section>
 );
}
