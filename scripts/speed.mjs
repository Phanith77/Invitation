// Speed check: loads the invitation like a mid-range phone on slow 4G (CPU 4× slower, ~1.6 Mbps,
// 150 ms latency) and reports how long until the opening flower is ready to tap, plus how much
// was downloaded. Usage: npm run build && npx vite preview --port 4173, then node scripts/speed.mjs
import { chromium } from 'playwright';

const BASE = process.argv[2] || 'http://localhost:4173';
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

let bytes = 0;
const byType = {};
cdp.on('Network.loadingFinished', (e) => { bytes += e.encodedDataLength; });
cdp.on('Network.responseReceived', (e) => { const t = e.type; byType[t] = (byType[t] || 0) + 1; });
const t0 = Date.now();
await page.goto(BASE + '/?to=' + encodeURIComponent('លោក សុខា'), { waitUntil: 'commit' });
await page.waitForSelector('.rd-stage', { state: 'visible' });
await page.waitForFunction(() => document.fonts.status === 'loaded' && getComputedStyle(document.querySelector('.rd-stage')).opacity === '1');
const ready = Date.now() - t0;
const readyKB = Math.round(bytes / 1024);
await page.waitForLoadState('networkidle');
const lcp = await page.evaluate(() => new Promise((ok) => {
  new PerformanceObserver((l) => { const e = l.getEntries(); ok(Math.round(e[e.length - 1].startTime)); }).observe({ type: 'largest-contentful-paint', buffered: true });
  setTimeout(() => ok(null), 3000);
}));
console.log(JSON.stringify({ readyToTapMs: ready, downloadedBeforeReadyKB: readyKB, totalAfterIdleKB: Math.round(bytes / 1024), lcpMs: lcp, requests: byType }, null, 2));
await browser.close();
