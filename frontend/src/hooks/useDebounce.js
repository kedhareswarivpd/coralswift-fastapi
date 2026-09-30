import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounce a rapidly-changing value (e.g. search input).  Returns the
 * debounced value which only updates after `delay` ms of inactivity.
 *
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *   // debouncedQuery stabilizes 300ms after the user stops typing
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/**
 * Wrap a callback so it can only fire at most once per `delay` ms.
 * Useful for search handlers, resize handlers, scroll handlers, etc.
 *
 *   const debouncedSearch = useDebouncedCallback((q) => fetchResults(q), 400);
 *   <input onChange={(e) => debouncedSearch(e.target.value)} />
 */
export function useDebouncedCallback(callback, delay = 300) {
  const timerRef = useRef(null);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay],
  );
}
