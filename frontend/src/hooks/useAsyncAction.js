import { useCallback, useRef, useState } from 'react';

/**
 * Wraps an async mutation (delete/create/update/approve/etc.) so repeated
 * clicks while the request is in flight are ignored instead of firing
 * duplicate requests. Pair `isPending` with `disabled` on the triggering
 * button.
 *
 * const { run, isPending } = useAsyncAction(() => deleteLead(id));
 * <button disabled={isPending} onClick={run}>...</button>
 */
export default function useAsyncAction() {
 const [isPending, setIsPending] = useState(false);
 const pendingRef = useRef(false);

 const run = useCallback(async (fn, ...args) => {
  if (pendingRef.current) return undefined;
  pendingRef.current = true;
  setIsPending(true);
  try {
   return await fn(...args);
  } finally {
   pendingRef.current = false;
   setIsPending(false);
  }
 }, []);

 return { run, isPending };
}
