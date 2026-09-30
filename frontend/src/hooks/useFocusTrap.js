import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Keeps keyboard focus cycling inside the referenced element while `active`
// is true. Returns a ref to attach to the focus-trapped container.
export default function useFocusTrap(active) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;

    const trap = ref.current;
    if (!trap) return;

    const focusable = trap.querySelectorAll(FOCUSABLE_SELECTOR);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    }

    trap.addEventListener('keydown', handler);
    return () => trap.removeEventListener('keydown', handler);
  }, [active]);

  return ref;
}
