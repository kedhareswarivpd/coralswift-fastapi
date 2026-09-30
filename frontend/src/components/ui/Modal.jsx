import { useEffect } from 'react';
import useFocusTrap from '../../hooks/useFocusTrap.js';

/**
 * Shared accessible modal/dialog. Handles focus trapping, Escape-to-close,
 * backdrop-click-to-close, body scroll locking, and focus restoration.
 *
 * <Modal open={showForm} onClose={() => setShowForm(false)} title="Apply for Engineer">
 *  ...form...
 * </Modal>
 */
export default function Modal({
 open,
 onClose,
 title,
 children,
 size = 'md', // 'sm' | 'md' | 'lg'
 closeOnBackdrop = true,
}) {
 const trapRef = useFocusTrap(open);

 useEffect(() => {
  if (!open) return undefined;

  const previouslyFocused = document.activeElement;
  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';

  const onKeyDown = (e) => {
   if (e.key === 'Escape') onClose?.();
  };
  document.addEventListener('keydown', onKeyDown);

  return () => {
   document.body.style.overflow = previousOverflow;
   document.removeEventListener('keydown', onKeyDown);
   previouslyFocused?.focus?.();
  };
 }, [open, onClose]);

 if (!open) return null;

 const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size] ?? 'max-w-lg';

 return (
  <div
   className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
   onMouseDown={(e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) onClose?.();
   }}
  >
   <div
    ref={trapRef}
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    className={`max-h-[90vh] w-full ${sizeClass} overflow-y-auto rounded-lg bg-white p-stack-lg text-ink shadow-card-hover dark:bg-dark-surface dark:text-dark-ink`}
   >
    {title && (
     <div className="mb-4 flex items-start justify-between gap-4">
      <h2 id="modal-title" className="font-display text-headline-sm text-brand-dark dark:text-dark-brand">
       {title}
      </h2>
      <button
       type="button"
       onClick={onClose}
       aria-label="Close dialog"
       className="text-ink-muted transition-colors hover:text-brand dark:text-dark-ink-muted"
      >
       ✕
      </button>
     </div>
    )}
    {children}
   </div>
  </div>
 );
}
