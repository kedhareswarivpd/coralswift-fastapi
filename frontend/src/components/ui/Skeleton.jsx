import { forwardRef } from 'react';

/**
 * Reusable skeleton loading primitives. All components accept `className`
 * for override. Skeletons use a subtle pulse animation and match the
 * existing design-token palette so they look correct in both light and dark
 * themes without any extra configuration.
 */

/* ── Base pulse wrapper ──────────────────────────────────────────────── */

const Pulse = forwardRef(function Pulse({ className = '', rounded = 'rounded', ...rest }, ref) {
 return (
  <div
   ref={ref}
   className={`animate-pulse bg-surface-high dark:bg-dark-surface-high ${rounded} ${className}`}
   aria-hidden="true"
   {...rest}
  />
 );
});

/* ── Text / Heading ─────────────────────────────────────────────────── */

export function SkeletonText({ lines = 3, className = '' }) {
 return (
  <div className={`space-y-2 ${className}`} aria-hidden="true">
   {Array.from({ length: lines }, (_, i) => (
    <Pulse
     key={i}
     className={`h-3.5 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
    />
   ))}
  </div>
 );
}

export function SkeletonHeading({ width = 'w-1/2', className = '' }) {
 return <Pulse className={`h-7 ${width} ${className}`} />;
}

/* ── Avatar ─────────────────────────────────────────────────────────── */

export function SkeletonAvatar({ size = 'md', className = '' }) {
 const sizes = { sm: 'size-8', md: 'size-10', lg: 'size-12' };
 return <Pulse className={`${sizes[size]} shrink-0 ${className}`} rounded="rounded-full" />;
}

/* ── Button ─────────────────────────────────────────────────────────── */

export function SkeletonButton({ width = 'w-24', className = '' }) {
 return <Pulse className={`h-11 ${width} ${className}`} rounded="rounded" />;
}

/* ── Card ───────────────────────────────────────────────────────────── */

export function SkeletonCard({ className = '' }) {
 return (
  <div
   className={`rounded-xl border border-outline-variant bg-white p-6 shadow-sm dark:border-dark-outline-variant dark:bg-dark-surface ${className}`}
   aria-hidden="true"
  >
   <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-surface-high dark:bg-dark-surface-high">
    <Pulse className="size-6" rounded="rounded" />
   </div>
   <SkeletonHeading width="w-1/3" className="mb-3" />
   <SkeletonText lines={2} />
  </div>
 );
}

/* ── Table ──────────────────────────────────────────────────────────── */

export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
 return (
  <div
   className={`overflow-hidden rounded-lg border border-outline-variant bg-white dark:border-dark-outline-variant dark:bg-dark-surface ${className}`}
   aria-hidden="true"
  >
   {/* Header */}
   <div className="flex gap-4 border-b border-outline-variant bg-surface-container px-6 py-4 dark:border-dark-outline-variant dark:bg-dark-surface-container">
    {Array.from({ length: columns }, (_, i) => (
     <Pulse key={i} className="h-3 flex-1" />
    ))}
   </div>
   {/* Rows */}
   {Array.from({ length: rows }, (_, r) => (
    <div
     key={r}
     className="flex gap-4 border-b border-outline-variant/50 px-6 py-4 last:border-b-0 dark:border-dark-outline-variant/50"
    >
     {Array.from({ length: columns }, (_, c) => (
      <Pulse key={c} className="h-3.5 flex-1" />
     ))}
    </div>
   ))}
  </div>
 );
}

/* ── Page ───────────────────────────────────────────────────────────── */

export function SkeletonPage({ className = '' }) {
 return (
  <div className={`mx-auto max-w-container px-4 py-section-padding sm:px-6 lg:px-10 xl:px-12 ${className}`} aria-hidden="true">
   {/* Eyebrow */}
   <SkeletonText lines={1} className="mb-4 max-w-[120px]" />
   {/* Heading */}
   <SkeletonHeading width="w-1/2" className="mb-4" />
   {/* Description */}
   <SkeletonText lines={2} className="mb-8 max-w-xl" />
   {/* Grid of cards */}
   <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <SkeletonCard />
    <SkeletonCard />
    <SkeletonCard />
   </div>
  </div>
 );
}

export default Pulse;
