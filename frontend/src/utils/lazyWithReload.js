import { lazy } from 'react';

// A deployed rebuild changes every chunk's content hash, so a browser tab
// that loaded the app before a rebuild will 404/ERR_EMPTY_RESPONSE the
// moment it lazy-navigates to a route it hasn't fetched yet. There is no
// way to avoid that with hashed chunk filenames — the fix is to detect the
// failure and recover with a single hard reload (which re-fetches the
// current index.html and its current chunk hashes), guarded by a
// sessionStorage flag so a genuinely broken chunk doesn't reload forever.
export function lazyWithReload(importer) {
  return lazy(async () => {
    try {
      const mod = await importer();
      sessionStorage.removeItem('cf:chunk-reload-attempted');
      return mod;
    } catch (err) {
      const key = 'cf:chunk-reload-attempted';
      const isChunkError =
        /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(err?.message || '');
      if (isChunkError && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        // Never resolves — the reload replaces this page before React would render anything further.
        return new Promise(() => {});
      }
      throw err;
    }
  });
}
