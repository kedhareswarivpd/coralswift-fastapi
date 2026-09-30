import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import useDocumentTitle from '../hooks/useDocumentTitle.js';
import Icon from '../components/ui/Icon.jsx';
import Badge from '../components/ui/Badge.jsx';
import Pulse, { SkeletonHeading, SkeletonText } from '../components/ui/Skeleton.jsx';
import NotFound from './NotFound.jsx';
import { apiRequest } from '../api/client.js';
import { fetchBlogComments, submitComment } from '../api/cms.js';
import { posts as demoPosts } from '../data/blog.js';

// backend/app/routers/blog.py has no single-post endpoint — this fetches
// the live published list and finds the matching slug client-side, the
// same pattern used by ServiceDetail/SuccessStory for the same reason.
function adaptPost(p) {
 return {
  id: p.id,
  slug: p.slug,
  title: p.title,
  content: p.content || '',
  author: p.author_name || 'CoralSwift Team',
  role: p.author_role || '',
  category: p.category_name || p.category || 'Uncategorized',
  publishedAt: p.published_at ? p.published_at.slice(0, 10) : '',
  tags: p.tags || [],
  image: p.cover_image || '',
 };
}

function CommentForm({ blogId, onPosted }) {
 const [form, setForm] = useState({ name: '', email: '', content: '' });
 const [error, setError] = useState('');
 const [success, setSuccess] = useState(false);
 const [submitting, setSubmitting] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSubmitting(true);
  try {
   await submitComment({ blog_id: blogId, ...form });
   setSuccess(true);
   setForm({ name: '', email: '', content: '' });
   onPosted?.();
  } catch (err) {
   setError(err?.status === 429
    ? 'Too many comments submitted — please wait a moment and try again.'
    : (err.message || 'Could not post your comment. Please try again.'));
  } finally {
   setSubmitting(false);
  }
 };

 const inputClass = 'w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md focus:border-brand focus:outline-none dark:border-dark-outline-variant dark:bg-dark-surface dark:text-dark-ink';

 if (success) {
  return (
   <p className="flex items-center gap-2 rounded-lg bg-status-success-bg p-4 text-body-sm text-status-success-text">
    <Icon name="check_circle" /> Thanks — your comment has been submitted and will appear once approved.
   </p>
  );
 }

 return (
  <form onSubmit={handleSubmit} className="space-y-4">
   <div className="grid gap-4 sm:grid-cols-2">
    <input required type="text" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
    <input required type="email" placeholder="Your email (not published)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />
   </div>
   <textarea required placeholder="Add a comment..." rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className={inputClass} />
   {error && <p className="flex items-center gap-1 text-body-sm text-status-error-text"><Icon name="error" className="text-base" />{error}</p>}
   <button type="submit" disabled={submitting} className="rounded bg-brand px-6 py-2.5 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark disabled:opacity-60">
    {submitting ? 'Posting...' : 'Post Comment'}
   </button>
  </form>
 );
}

export default function BlogDetail() {
 const { slug } = useParams();
 const [post, setPost] = useState(undefined); // undefined = loading, null = not found
 const [comments, setComments] = useState([]);
 useDocumentTitle(post ? `${post.title} | CoralSwift Technologies` : 'Blog | CoralSwift Technologies');

 useEffect(() => {
  setPost(undefined);
  apiRequest('/blogs?limit=100')
   .then((res) => {
    const match = (res?.data || []).find((p) => p.slug === slug);
    setPost(match ? adaptPost(match) : null);
   })
   .catch(() => {
    // Backend unreachable — resolve from the bundled demo dataset so the
    // public post page stays browsable instead of rendering a 404. The
    // demo excerpt stands in as the article lead; no content is invented.
    const demo = demoPosts.find((p) => p.slug === slug);
    setPost(
     demo
      ? {
        id: null, // no comments without a live record
        slug: demo.slug,
        title: demo.title,
        content: demo.excerpt ? `<p>${demo.excerpt}</p>` : '',
        author: demo.author,
        role: demo.role,
        category: demo.category,
        publishedAt: demo.publishedAt,
        tags: demo.tags,
        image: demo.image,
       }
      : null
    );
   });
 }, [slug]);

 const loadComments = useCallback(() => {
  if (!post?.id) return;
  fetchBlogComments(post.id).then((res) => setComments(res?.data || [])).catch(() => {});
 }, [post?.id]);

 useEffect(() => { loadComments(); }, [loadComments]);

 if (post === undefined) {
  return (
   <main className="min-h-screen bg-surface dark:bg-dark-surface">
    <article className="mx-auto max-w-3xl px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
     <Pulse className="mb-4 h-6 w-24" rounded="rounded-full" />
     <SkeletonHeading width="w-3/4" className="mb-4 h-10" />
     <div className="mb-8 flex gap-4 border-b border-outline-variant pb-6 dark:border-dark-outline-variant">
      <Pulse className="h-4 w-32" />
      <Pulse className="h-4 w-24" />
     </div>
     <Pulse className="mb-8 h-72 w-full" />
     <SkeletonText lines={6} />
    </article>
   </main>
  );
 }
 if (!post) return <NotFound />;

 const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
 const sanitizedContent = DOMPurify.sanitize(post.content, { USE_PROFILES: { html: true } });

 return (
  <main className="min-h-screen bg-surface dark:bg-dark-surface">
   <article className="mx-auto max-w-3xl px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ">
    <Badge className="mb-4 bg-accent-cyan-pale text-label-caps text-brand">{post.category}</Badge>
    <h1 className="mb-4 font-display text-display-md text-brand-dark dark:text-dark-brand">{post.title}</h1>
    <div className="mb-8 flex flex-wrap items-center gap-4 border-b border-outline-variant pb-6 text-body-sm text-ink-muted dark:border-dark-outline-variant dark:text-dark-ink-muted">
     <span className="font-semibold text-ink dark:text-dark-ink">{post.author}</span>
     {post.publishedAt && <span className="flex items-center gap-1"><Icon name="calendar_today" className="text-base" />{post.publishedAt}</span>}
    </div>

    {post.image && (
     <img src={post.image} alt={post.title} className="mb-8 w-full rounded-lg object-cover" />
    )}

    {/* Sanitized via DOMPurify above — CMS-authored rich text is the only HTML rendered here. */}
    <div className="prose max-w-none font-body text-body-md text-ink dark:text-dark-ink" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

    {!!post.tags.length && (
     <div className="mt-8 flex flex-wrap gap-2">
      {post.tags.map((t) => <Badge key={t} className="border border-outline-variant text-label-caps text-ink-muted dark:border-dark-outline-variant dark:text-dark-ink-muted">{t}</Badge>)}
     </div>
    )}

    {/* Sharing */}
    <div className="mt-10 flex items-center gap-4 border-t border-outline-variant pt-6 dark:border-dark-outline-variant">
     <span className="font-label-caps text-label-caps uppercase text-ink-muted dark:text-dark-ink-muted">Share:</span>
     <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer" aria-label="Share on LinkedIn" className="text-ink-muted hover:text-brand dark:text-dark-ink-muted">
      <Icon name="share" />
     </a>
     <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer" aria-label="Share on X" className="text-ink-muted hover:text-brand dark:text-dark-ink-muted">
      <Icon name="alternate_email" />
     </a>
     <a href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(shareUrl)}`} aria-label="Share via email" className="text-ink-muted hover:text-brand dark:text-dark-ink-muted">
      <Icon name="mail" />
     </a>
    </div>

    {/* Comments */}
    <div className="mt-12 border-t border-outline-variant pt-8 dark:border-dark-outline-variant">
     <h2 className="mb-6 font-display text-headline-sm text-brand-dark dark:text-dark-brand">Comments ({comments.length})</h2>
     <div className="mb-8 space-y-4">
      {comments.map((c) => (
       <div key={c.id} className="rounded-lg border border-outline-variant bg-white p-4 dark:border-dark-outline-variant dark:bg-dark-surface">
        <p className="font-semibold text-ink dark:text-dark-ink">{c.name}</p>
        <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">{c.content}</p>
       </div>
      ))}
      {!comments.length && <p className="text-body-sm text-ink-muted dark:text-dark-ink-muted">Be the first to comment.</p>}
     </div>
     <CommentForm blogId={post.id} onPosted={loadComments} />
    </div>

    <Link to="/blog" className="mt-12 flex w-fit items-center gap-2 font-label-caps text-label-caps uppercase text-brand hover:text-brand-dark">
     <Icon name="arrow_back" /> Back to Blog
    </Link>
   </article>
  </main>
 );
}
