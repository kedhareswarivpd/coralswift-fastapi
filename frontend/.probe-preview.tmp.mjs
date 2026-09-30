// Probe against vite preview (current source build) — overlap + bleed with clip-awareness
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const ROUTES = [
  '/', '/about', '/services', '/services/cloud-migration', '/solutions',
  '/industries', '/products', '/technologies', '/portfolio', '/case-studies',
  '/resources', '/downloads', '/blog', '/events', '/gallery', '/awards',
  '/careers', '/contact', '/faq', '/privacy', '/terms', '/cookies',
];
const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '375', width: 375, height: 667 },
  { name: '320', width: 320, height: 568 },
];

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  cwd: process.cwd(), stdio: 'ignore', shell: true,
});
await new Promise((r) => setTimeout(r, 4000));

const browser = await chromium.launch();
let issues = 0;
for (const vp of VIEWPORTS) {
  for (const theme of ['light', 'dark']) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await ctx.addInitScript(([t]) => localStorage.setItem('coralswift.theme', t), [theme]);
    // pre-accept cookies so the consent banner never masks layout
    await ctx.addInitScript(() => localStorage.setItem('coralswift.cookies', JSON.stringify({ essential: true })));
    const page = await ctx.newPage();
    for (const route of ROUTES) {
      try {
        await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(250);
        const res = await page.evaluate(() => {
          const main = document.querySelector('main');
          const footer = document.querySelector('footer');
          const de = document.documentElement;
          if (!main || !footer) return { error: 'missing' };
          const m = main.getBoundingClientRect();
          const f = footer.getBoundingClientRect();
          const out = { hOverflow: de.scrollWidth > de.clientWidth + 1, overlap: f.top < m.bottom - 2, bleed: [] };
          // clip-aware bleed check: walk up ancestors; if any clips (overflow hidden/auto/scroll + smaller box), ignore
          for (const el of main.querySelectorAll('*')) {
            const r = el.getBoundingClientRect();
            if (r.height === 0 || r.width === 0) continue;
            if (r.bottom <= m.bottom + 6) continue;
            let clipped = false;
            let p = el.parentElement;
            while (p && p !== main.parentElement) {
              const pcs = getComputedStyle(p);
              const pr = p.getBoundingClientRect();
              if (/(hidden|clip|auto|scroll)/.test(pcs.overflow + pcs.overflowX + pcs.overflowY) && pr.bottom <= m.bottom + 6) { clipped = true; break; }
              p = p.parentElement;
            }
            if (!clipped) out.bleed.push(`${el.tagName}.${(el.className || '').toString().slice(0, 60)} +${Math.round(r.bottom - m.bottom)}px`);
          }
          return out;
        });
        const flags = [];
        if (res.error) flags.push(res.error);
        if (res.overlap) flags.push('OVERLAP');
        if (res.hOverflow) flags.push('H-OVERFLOW');
        if (res.bleed?.length) flags.push(`BLEED:${res.bleed.slice(0, 2).join(' ;; ')}`);
        if (flags.length) { issues++; console.log(`[${vp.name}][${theme}] ${route} -> ${flags.join(' | ')}`); }
      } catch (e) {
        issues++; console.log(`[${vp.name}][${theme}] ${route} -> ERROR ${e.message.split('\n')[0]}`);
      }
    }
    await ctx.close();
  }
}
await browser.close();
server.kill();
console.log(issues === 0 ? 'ALL CLEAN' : `${issues} flagged`);
