import Icon from './Icon.jsx';

/**
 * Shared pagination control.
 *
 * <Pagination page={page} totalPages={totalPages} onChange={setPage} />
 *
 * Renders first/prev/[page numbers]/next/last. Collapses to a compact
 * "Page X of Y" + prev/next on small screens via responsive classes.
 */
export default function Pagination({ page, totalPages, onChange, className = '' }) {
 if (totalPages <= 1) return null;

 const go = (p) => {
  const clamped = Math.max(1, Math.min(totalPages, p));
  if (clamped !== page) onChange(clamped);
 };

 const pageNumbers = getPageWindow(page, totalPages);

 return (
  <nav aria-label="Pagination" className={`flex items-center justify-between gap-2 ${className}`}>
   <button
    type="button"
    onClick={() => go(page - 1)}
    disabled={page <= 1}
    aria-label="Previous page"
    className="flex size-9 items-center justify-center rounded border border-outline-variant text-ink-muted transition-colors hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-outline-variant dark:text-dark-ink-muted dark:hover:bg-dark-surface-low"
   >
    <Icon name="chevron_left" />
   </button>

   <div className="hidden items-center gap-1 sm:flex">
    {pageNumbers.map((p, idx) =>
     p === '…' ? (
      <span key={`ellipsis-${idx}`} className="px-2 text-body-sm text-ink-muted">…</span>
     ) : (
      <button
       key={p}
       type="button"
       onClick={() => go(p)}
       aria-current={p === page ? 'page' : undefined}
       aria-label={`Page ${p}`}
       className={`flex size-9 items-center justify-center rounded font-label-caps text-label-caps transition-colors ${
        p === page
         ? 'bg-brand text-white'
         : 'text-ink-muted hover:bg-surface-low dark:text-dark-ink-muted dark:hover:bg-dark-surface-low'
       }`}
      >
       {p}
      </button>
     )
    )}
   </div>

   <span className="text-body-sm text-ink-muted dark:text-dark-ink-muted sm:hidden">
    Page {page} of {totalPages}
   </span>

   <button
    type="button"
    onClick={() => go(page + 1)}
    disabled={page >= totalPages}
    aria-label="Next page"
    className="flex size-9 items-center justify-center rounded border border-outline-variant text-ink-muted transition-colors hover:bg-surface-low disabled:cursor-not-allowed disabled:opacity-40 dark:border-dark-outline-variant dark:text-dark-ink-muted dark:hover:bg-dark-surface-low"
   >
    <Icon name="chevron_right" />
   </button>
  </nav>
 );
}

function getPageWindow(page, totalPages, windowSize = 1) {
 const pages = new Set([1, totalPages, page]);
 for (let i = 1; i <= windowSize; i += 1) {
  if (page - i >= 1) pages.add(page - i);
  if (page + i <= totalPages) pages.add(page + i);
 }
 const sorted = [...pages].sort((a, b) => a - b);

 const result = [];
 sorted.forEach((p, idx) => {
  if (idx > 0 && p - sorted[idx - 1] > 1) result.push('…');
  result.push(p);
 });
 return result;
}
