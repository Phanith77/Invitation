// Captures the 1200×630 link preview (/?og → public/og.jpg) and the 1080×1920 wallpaper card
// (/?card → public/card.jpg).
// Usage: npm run dev, then `node scripts/og.mjs [baseUrl]`. Re-run after changing names/photos.
import { chromium } from 'playwright';
import sharp from 'sharp';

const BASE = process.argv[2] || 'http://localhost:5173';
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome' });
// link preview (og:image) and the downloadable phone-wallpaper card
for (const [route, width, height, out] of [['og', 1200, 630, 'public/og.jpg'], ['card', 1080, 1920, 'public/card.jpg']]) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/?${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(out);
  await page.close();
  console.log(`${out} written (${width}×${height})`);
}
await browser.close();
