import { useEffect } from 'react';
import { fetchSeoForPath } from '../api/cms.js';

// D11 (UAT_REPORT.md): the admin's "SEO" resource (title, meta description,
// OG tags, canonical URL, robots, structured data — see
// backend/app/models/seo.py) was fully editable in ContentManager but had
// zero effect on any public page; nothing ever fetched it. Wired in once
// here (Layout.jsx, keyed by route pathname) rather than per-page so every
// public route gets it automatically, instead of requiring each page to
// remember to opt in.
//
// This is a client-rendered SPA with no server-side rendering, so this only
// updates the live DOM `<head>` after the JS bundle runs — real browsers and
// modern crawlers (Google/Bing both execute JS before indexing) see the
// applied tags, but a classic non-JS crawler or a raw `curl` of the HTML
// response would only see index.html's static fallback tags. That's an
// inherent limitation of this app's SPA architecture, not something this
// hook can work around — a true fix would require SSR/prerendering, which
// is a much larger architectural change out of scope here.

function upsertMeta(attr, key, content) {
 if (!content) return;
 let el = document.head.querySelector(`meta[${attr}="${key}"]`);
 if (!el) {
  el = document.createElement('meta');
  el.setAttribute(attr, key);
  document.head.appendChild(el);
 }
 el.setAttribute('content', content);
}

function removeMeta(attr, key) {
 document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
}

function upsertLink(rel, href) {
 if (!href) return;
 let el = document.head.querySelector(`link[rel="${rel}"]`);
 if (!el) {
  el = document.createElement('link');
  el.setAttribute('rel', rel);
  document.head.appendChild(el);
 }
 el.setAttribute('href', href);
}

/**
 * Fetches the admin-managed SEO record for `pathname` (if one exists) and
 * applies it to the live document head. Silently does nothing if no record
 * exists for that path — the page's own hardcoded <title>/index.html
 * defaults remain in effect, so this is purely additive/progressive.
 */
export default function useSeoMeta(pathname) {
 useEffect(() => {
  if (!pathname) return undefined;
  let cancelled = false;

  fetchSeoForPath(pathname)
   .then((res) => {
    if (cancelled) return;
    const record = res?.data?.[0];
    if (!record) return;

    if (record.title) document.title = record.title;
    upsertMeta('name', 'description', record.description);
    upsertMeta('name', 'keywords', record.keywords);
    upsertMeta('property', 'og:title', record.og_title || record.title);
    upsertMeta('property', 'og:description', record.og_description || record.description);
    upsertMeta('property', 'og:image', record.og_image);
    upsertMeta('property', 'og:type', record.og_type || 'website');
    upsertLink('canonical', record.canonical_url);
    if (record.no_index) {
     upsertMeta('name', 'robots', 'noindex, nofollow');
    } else {
     removeMeta('name', 'robots');
    }
   })
   .catch(() => {
    // Best-effort — a missing/failed SEO fetch must never block the page
    // itself from rendering; the static defaults already in index.html
    // and the page's own useDocumentTitle call stay in effect.
   });

  return () => {
   cancelled = true;
  };
 }, [pathname]);
}
