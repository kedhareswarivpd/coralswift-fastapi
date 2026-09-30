// Visual evidence capture: bottom-of-page regions where overlap was reported
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:8081';
const SHOTS = [
  { route: '/solutions', name: 'solutions' },
  { route: '/industries', name: 'industries' },
  { route: '/portfolio', name: 'portfolio' },
  { route: '/resources', name: 'resources' },
  { route: '/blog', name: 'blog' },
  { route: '/careers', name: 'careers' },
];

const browser = await chromium.launch();
for (const theme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript(([t]) => localStorage.setItem('coralswift.theme', t), [theme]);
  const page = await ctx.newPage();
  for (const s of SHOTS) {
    await page.goto(BASE + s.route, { waitUntil: 'networkidle', timeout: 20000 });
    // force reveal animations to complete
    await page.evaluate(() => {
      document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom').forEach((el) => el.classList.add('reveal-visible'));
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(700);
    await page.screenshot({ path: `C:/Users/Admin/AppData/Local/Temp/opencode/cf-audit/${s.name}-${theme}-bottom.png` });
  }
  await ctx.close();
}
await browser.close();
console.log('done');
