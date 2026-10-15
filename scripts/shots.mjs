// QA: screenshots at 4 viewports, the envelope opening as a frame sequence, plus checks:
// console errors, elements wider than the screen, top-bar overlap, cover fits one screen.
// Usage: npm run dev (in another terminal), then `node scripts/shots.mjs [baseUrl]`
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:5173';
const OUT = 'qa';
mkdirSync(OUT, { recursive: true });
const VIEWPORTS = [
  { name: '320', width: 320, height: 568, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '740L', width: 740, height: 360, mobile: true },
  { name: '1280', width: 1280, height: 800, mobile: false },
];
const FRAMES = [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8, 2.1, 2.4, 2.8, 3.2, 3.6, 4.0, 4.4, 4.8, 5.2, 5.6, 6.0];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome' });
const report = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.mobile ? 2 : 1,
    isMobile: vp.mobile, hasTouch: vp.mobile,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3200); // intro settles
  await page.screenshot({ path: `${OUT}/${vp.name}-01-envelope.png` });

  // opening sequence: tap, then pause the GSAP timeline and step through it
  await page.click('.env-stage');
  await page.waitForFunction(() => !!window.__envTL);
  await page.evaluate(() => void window.__envTL.pause());
  if (vp.name === '390' || vp.name === '1280') {
    for (const [i, t] of FRAMES.entries()) {
      await page.evaluate((tt) => void window.__envTL.seek(tt, false), t);
      await page.waitForTimeout(60);
      await page.screenshot({ path: `${OUT}/${vp.name}-open-${String(i).padStart(2, '0')}-${t.toFixed(1)}s.png` });
    }
  }
  await page.evaluate(() => void window.__envTL.play());
  await page.waitForTimeout(10500);
  await page.screenshot({ path: `${OUT}/${vp.name}-02-cover.png` });

  const checks = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')]
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1) && !el.closest('.cover-corners, .env-screen, svg'); })
      .slice(0, 8).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
    const cover = document.querySelector('.cover');
    const inner = document.querySelector('.cover-inner').getBoundingClientRect();
    const bar = document.querySelector('.topbar').getBoundingClientRect();
    return {
      scrollW: document.documentElement.scrollWidth, vw,
      wide,
      coverH: Math.round(cover.getBoundingClientRect().height), vh: innerHeight,
      innerTop: Math.round(inner.top), innerBottom: Math.round(inner.bottom), barBottom: Math.round(bar.bottom),
      gl: !!document.querySelector('.cover-gl.on'),
    };
  });
  report.push({ vp: vp.name, errors, ...checks });
  await page.evaluate(() => scrollTo(0, 300));
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/${vp.name}-03-scrolled.png` });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
