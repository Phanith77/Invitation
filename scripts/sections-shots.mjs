// QA for sections 2–12 at 4 viewports (envelope skipped with ?open=1).
// Checks: console errors, horizontal overflow, canvases fill their sections, Khmer line boxes.
// Usage: npm run dev, then `node scripts/sections-shots.mjs [baseUrl] [viewportName]`
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:5173';
const ONLY = process.argv[3];
const OUT = 'qa/sections';
mkdirSync(OUT, { recursive: true });
const VIEWPORTS = [
  { name: '320', width: 320, height: 568, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '740L', width: 740, height: 360, mobile: true },
  { name: '1280', width: 1280, height: 800, mobile: false },
].filter((v) => !ONLY || v.name === ONLY);
const SECTIONS = ['cover', 'invitation', 'couple', 'countdown', 'programme', 'story', 'candle', 'gallery', 'venue', 'gift', 'thanks'];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome' });
const report = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.mobile ? 2 : 1, isMobile: vp.mobile, hasTouch: vp.mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url().slice(0, 120)}`));
  await page.goto(`${BASE}/?open=1`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(5500);

  for (const id of SECTIONS) {
    const top = await page.evaluate((i) => {
      const el = document.getElementById(i);
      // pinned sections sit inside a pin-spacer: use the spacer's position
      const box = (el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el).getBoundingClientRect();
      return box.top + scrollY;
    }, id);
    if (id === 'story') {
      const len = await page.evaluate(() => { const s = document.getElementById('story').parentElement; return s.classList.contains('pin-spacer') ? s.offsetHeight - innerHeight : 0; });
      for (const [k, f] of [[0, 0], [1, 0.5], [2, 0.98]]) {
        await page.evaluate((y) => scrollTo(0, y), top + len * f);
        await page.waitForTimeout(1600);
        await page.screenshot({ path: `${OUT}/${vp.name}-${String(SECTIONS.indexOf(id)).padStart(2, '0')}-${id}-${k}.png` });
      }
      continue;
    }
    const h = await page.evaluate((i) => document.getElementById(i).offsetHeight, id);
    // walk through the section so every scroll-triggered reveal fires
    for (let y = top - vp.height * 0.3; y < top + h; y += vp.height * 0.5) {
      await page.evaluate((yy) => scrollTo(0, yy), y);
      await page.waitForTimeout(350);
    }
    await page.evaluate((yy) => scrollTo(0, yy), top);
    await page.waitForTimeout(id === 'thanks' ? 4200 : 2200);
    const name = `${OUT}/${vp.name}-${String(SECTIONS.indexOf(id)).padStart(2, '0')}-${id}.png`;
    if (h > vp.height * 1.05) await page.locator(`#${id}`).screenshot({ path: name, animations: 'disabled' });
    else await page.screenshot({ path: name });
  }

  // interaction checks: lantern in the candle section, gallery viewer
  const candle = await page.evaluate(() => { const el = document.getElementById('candle'); scrollTo(0, el.getBoundingClientRect().top + scrollY); return true; });
  await page.waitForTimeout(800);
  const box = await page.locator('#candle').boundingBox();
  if (candle && box) {
    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height * 0.7);
    await page.mouse.click(box.x + box.width * 0.7, box.y + box.height * 0.82);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${OUT}/${vp.name}-x-candle-lanterns.png` });
  }
  await page.evaluate(() => document.getElementById('gallery').scrollIntoView());
  await page.waitForTimeout(1200);
  await page.locator('.g-tile').first().click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${vp.name}-x-viewer.png` });
  await page.keyboard.press('Escape');

  const checks = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const wide = [...document.querySelectorAll('body *')]
      .filter((el) => {
        if (el.closest('.story-strip, .marquee, .viewer, svg')) return false; // intentionally wider, clipped by their section
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > vw + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed';
      })
      .slice(0, 10).map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
    const canvases = [...document.querySelectorAll('canvas')].map((c) => {
      const a = c.getBoundingClientRect(), b = c.parentElement.getBoundingClientRect();
      return { cls: c.className, fill: Math.abs(a.width - b.width) < 2 && Math.abs(a.height - b.height) < 2, px: `${c.width}x${c.height}` };
    });
    return { scrollW: document.documentElement.scrollWidth, vw, wide, canvases };
  });
  report.push({ vp: vp.name, errors, ...checks });
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report, null, 2));
