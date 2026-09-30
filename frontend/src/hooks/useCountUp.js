import { useEffect, useRef, useState } from 'react';

/**
 * Animates a numeric value from 0 to `target` over `duration` ms
 * once the returned `ref` element enters the viewport.
 *
 * Returns [ref, displayValue] where displayValue is the formatted string
 * with the original prefix/suffix preserved (e.g. "430+" → "0+" … "430+").
 */
export default function useCountUp(rawValue, duration = 1800) {
  const ref = useRef(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  // Parse numeric part + surrounding text (prefix/suffix)
  const match = String(rawValue).match(/^([^0-9]*)(\d+(?:\.\d+)?)([^0-9]*)$/);
  const prefix = match ? match[1] : '';
  const target = match ? parseFloat(match[2]) : null;
  const suffix = match ? match[3] : '';
  const isNumeric = target !== null;

  useEffect(() => {
    if (!isNumeric) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isNumeric]);

  useEffect(() => {
    if (!started || !isNumeric) return;
    const isFloat = target % 1 !== 0;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * target;
      setCount(isFloat ? parseFloat(current.toFixed(1)) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [started, target, duration, isNumeric]);

  const display = isNumeric ? `${prefix}${count}${suffix}` : rawValue;
  return [ref, display];
}
