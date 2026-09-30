// Runtime layout probe for the CoralSwift public site.
// For each public route, in light + dark mode:
//  - detects footer overlapping main content (bounding-box intersection)
//  - detects horizontal overflow
//  - reports the last content block's bottom vs footer top
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:8081';
const ROUTES = [
  '/', '/about', '/services', '/services/cloud-migration', '/solutions',
  '/industries', '/products', '/technologies', '/portfolio', '/case-studies',
  '/resources', '/downloads', '/blog', '/events', '/gallery', '/awards',
  '/careers', '/contact', '/faq', '/privacy', '/terms', '/cookies',
];

function probe() {
  const out = {};
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  const de = document.documentElement;
  out.horizontalOverflow = de.scrollWidth > de.clientWidth + 1;
  if (!main || !footer) { out.error = 'missing main/footer'; return out; }
  const m = main.getBoundingClientRect();
  const f = footer.getBoundingClientRect();
  out.mainBottom = Math.round(m.bottom);
  out.footerTop = Math.round(f.top);
  // overlap: footer starts before main content ends (allow 2px rounding)
  out.footerOverlapsMain = f.top < m.bottom - 2;
  // deepest visible content element inside main that extends past footer top
  const els = [...main.querySelectorAll('*')];
  let worst = null;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.height === 0 || r.width === 0) continue;
    if (r.bottom > f.top + 4 && r.bottom <= m.bottom + 1) {
      if (!worst || r.bottom > worst.bottom) {
        worst = { bottom: Math.round(r.bottom), tag: el.tagName, cls: (el.className || '').toString().slice(0, 90), text: (el.textContent || '').trim().slice(0, 50) };
      }
    }
  }
  out.overlappingEl = worst;
  // sticky/fixed elements inside main that could cover the footer
  const stickyEls = els.filter((el) => {
    const p = getComputedStyle(el).position;
    const r = el.getBoundingClientRect();
    return (p === 'fixed' || p === 'sticky') && r.height > 0 && r.bottom > f.top + 4 && el.getBoundingClientRect().top < f.bottom;
  }).map((el) => ({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 80) }));
  out.coveringSticky = stickyEls.slice(0, 5);
  return out;
}

const browser = await chromium.launch();
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(([t]) => localStorage.setItem('coralswift.theme', t), [theme]);
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    try {
      await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(400);
      const res = await page.evaluate(probe);
      const flag = res.footerOverlapsMain ? 'OVERLAP' : res.horizontalOverflow ? 'H-OVERFLOW' : 'ok';
      console.log(`[${theme}] ${route} -> ${flag} | ${JSON.stringify(res)}`);
    } catch (e) {
      console.log(`[${theme}] ${route} -> ERROR ${e.message.split('\n')[0]}`);
    }
  }
  await ctx.close();
}
await browser.close();
