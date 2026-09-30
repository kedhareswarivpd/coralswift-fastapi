// Extended probe: mobile viewports + decorative bleed into footer region
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:8081';
const ROUTES = [
  '/', '/about', '/services', '/services/cloud-migration', '/solutions',
  '/industries', '/products', '/technologies', '/portfolio', '/case-studies',
  '/resources', '/downloads', '/blog', '/events', '/gallery', '/awards',
  '/careers', '/contact', '/faq', '/privacy', '/terms', '/cookies',
];
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-375', width: 375, height: 667 },
  { name: 'mobile-320', width: 320, height: 568 },
];

async function probe(page) {
  return page.evaluate(() => {
    const out = {};
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const de = document.documentElement;
    out.horizontalOverflow = de.scrollWidth > de.clientWidth + 1;
    if (!main || !footer) { out.error = 'missing main/footer'; return out; }
    const m = main.getBoundingClientRect();
    const f = footer.getBoundingClientRect();
    out.footerOverlapsMain = f.top < m.bottom - 2;
    // elements inside main that PAINT below main's bottom edge (bleed into footer)
    const bleed = [];
    for (const el of main.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.height === 0 || r.width === 0) continue;
      if (r.bottom > m.bottom + 6) {
        const cs = getComputedStyle(el);
        bleed.push({ tag: el.tagName, pos: cs.position, cls: (el.className || '').toString().slice(0, 70), overhang: Math.round(r.bottom - m.bottom), text: (el.textContent || '').trim().slice(0, 40) });
      }
    }
    out.bleedingIntoFooter = bleed.slice(0, 4);
    // footer children poking above footer top (negative margins)
    const footBleed = [];
    for (const el of footer.querySelectorAll('*')) {
      const r = el.getBoundingClientRect();
      if (r.height === 0) continue;
      if (r.top < f.top - 6) {
        footBleed.push({ tag: el.tagName, cls: (el.className || '').toString().slice(0, 70), pokesAboveBy: Math.round(f.top - r.top) });
      }
    }
    out.footerPokingUp = footBleed.slice(0, 4);
    return out;
  });
}

const browser = await chromium.launch();
for (const vp of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await ctx.addInitScript(([t]) => localStorage.setItem('coralswift.theme', t), [theme]);
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(300);
        const res = await page.evaluate(probe(page).then ? 0 : 0); // noop guard
      } catch {}
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(250);
        const res = await page.evaluate(() => {
          const main = document.querySelector('main');
          const footer = document.querySelector('footer');
          const de = document.documentElement;
          const m = main?.getBoundingClientRect();
          const f = footer?.getBoundingClientRect();
          const bleed = [];
          if (main && footer && m && f) {
            for (const el of main.querySelectorAll('*')) {
              const r = el.getBoundingClientRect();
              if (r.height === 0 || r.width === 0) continue;
              if (r.bottom > m.bottom + 6) {
                bleed.push(`${el.tagName}.${(el.className || '').toString().slice(0, 50)} +${Math.round(r.bottom - m.bottom)}px`);
              }
            }
          }
          return {
            hOverflow: de.scrollWidth > de.clientWidth + 1,
            overlap: !!(m && f && f.top < m.bottom - 2),
            bleed: bleed.slice(0, 3),
          };
        });
        const flags = [];
        if (res.overlap) flags.push('OVERLAP');
        if (res.hOverflow) flags.push('H-OVERFLOW');
        if (res.bleed.length) flags.push(`BLEED:${JSON.stringify(res.bleed)}`);
        console.log(`[${vp.name}][${theme}] ${route} -> ${flags.length ? flags.join(' | ') : 'ok'}`);
      } catch (e) {
        console.log(`[${vp.name}][${theme}] ${route} -> ERROR ${e.message.split('\n')[0]}`);
      }
    }
    await ctx.close();
  }
}
await browser.close();
