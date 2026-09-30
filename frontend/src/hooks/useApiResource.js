import { useEffect, useRef, useState } from 'react';

/**
 * @param {() => Promise<{data: any[]}>} fetchFn  API call returning the backend envelope
 * @param {(item: any) => any} adapt               maps one backend record to the shape components expect
 * @param {any[]} fallbackData                      already-adapted demo data, used on error or empty results
 * @param {any[]} deps                               effect dependencies (e.g. active filter)
 */
export default function useApiResource(fetchFn, adapt, fallbackData, deps = []) {
  const [state, setState] = useState({
    items: fallbackData,
    loading: true,
    error: null,
    isFallback: true,
  });

  // Keep the latest callbacks in refs so the effect can safely depend only on
  // `deps` without stale closures or re-running on every render.
  const fetchFnRef = useRef(fetchFn);
  const adaptRef = useRef(adapt);
  const fallbackRef = useRef(fallbackData);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
    adaptRef.current = adapt;
    fallbackRef.current = fallbackData;
  });

  // Snapshot the dependency values so the effect re-runs when any of them
  // change, without requiring a static array literal that the lint rule can
  // verify (the callers pass a dynamic deps array).
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    fetchFnRef.current()
      .then((payload) => {
        if (cancelled) return;
        const records = payload?.data ?? [];
        if (records.length === 0) {
          setState({ items: fallbackRef.current, loading: false, error: null, isFallback: true });
        } else {
          setState({ items: records.map(adaptRef.current), loading: false, error: null, isFallback: false });
        }
      })
      .catch((error) => {
        if (cancelled) return;
        setState({ items: fallbackRef.current, loading: false, error, isFallback: true });
      });

    return () => {
      cancelled = true;
    };
  }, [depsKey]);

  return state;
}
