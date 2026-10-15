// Saves the printables as PDFs into public/print/ (linked from the dashboard; the A5 one also for guests):
//   poster-a4.pdf      venue poster with QR codes (invitation, map, table finder)
//   table-cards-a6.pdf one card per table (TABLES=20 npm run print to change the count)
//   invitation-a5.pdf  paper invitation for elders
// Usage: npm run dev, then `npm run print`. Set siteUrl in src/data/wedding.js first so the QR
// codes point at the live site.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:5173';
const TABLES = Number(process.env.TABLES) || 12;
mkdirSync('public/print', { recursive: true });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome' });
for (const [kind, out, w, h] of [
  ['poster', 'poster-a4.pdf', '210mm', '297mm'],
  [`tables&n=${TABLES}`, 'table-cards-a6.pdf', '148mm', '105mm'],
  ['a5', 'invitation-a5.pdf', '148mm', '210mm'],
]) {
  const page = await browser.newPage();
  await page.goto(`${BASE}/?print=${kind}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.querySelectorAll('.pr-qr')].every((q) => q.dataset.ready === '1'));
  await page.waitForTimeout(400);
  await page.pdf({ path: `public/print/${out}`, width: w, height: h, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await page.close();
  console.log(`public/print/${out}`);
}
await browser.close();
