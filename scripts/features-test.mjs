// Tests for the add-on features (guest links, music, directions, dress code, parking,
// ceremony guide, card, blessings, RSVP, admin, day-of/after modes, Chinese, animated couple, PWA).
// Usage: npm run build && npx vite preview --port 4173, then `node scripts/features-test.mjs`
import { chromium } from 'playwright';
import { mkdirSync, rmSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4173';
const OUT = 'qa/features';
mkdirSync(OUT, { recursive: true });
rmSync('.data', { recursive: true, force: true }); // fresh local store
const results = [];
const ok = (name, pass, info = '') => results.push({ name, pass: !!pass, info });
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome' });
const allErrors = [];

async function open(url, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...opts });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => allErrors.push(`${url}: ${e}`));
  page.on('console', (m) => m.type() === 'warning' && /GSAP/.test(m.text()) && allErrors.push(`${url}: ${m.text()}`));
  page.on('console', (m) => m.type() === 'error' && !/serviceWorker|ERR_INTERNET_DISCONNECTED|net::ERR|401 \(Unauthorized\)/.test(m.text()) /* 401 = the deliberate wrong-key test */ && allErrors.push(`${url}: ${m.text()}`));
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page };
}
const scrollTo = (page, id) => page.evaluate((i) => document.getElementById(i).scrollIntoView(), id);

// 1 · personal guest link + music
{
  const { ctx, page } = await open(`/?to=${encodeURIComponent('លោក សុខា')}`);
  await page.waitForTimeout(2500);
  ok('guest name written on the envelope', (await page.locator('.env-to-name').textContent()) === 'លោក សុខា');
  await page.screenshot({ path: `${OUT}/01-envelope-guest.png` });
  await page.tap('.env-stage');
  await page.waitForTimeout(7500);
  ok('guest name on the cover', (await page.locator('.cover-guest').textContent()) === 'លោក សុខា');
  ok('music starts on the envelope tap (ambience)', (await page.getAttribute('.tb-music', 'aria-pressed')) === 'true');
  await page.tap('.tb-music');
  ok('music button pauses', (await page.getAttribute('.tb-music', 'aria-pressed')) === 'false');
  await page.screenshot({ path: `${OUT}/02-cover-guest.png` });
  await ctx.close();
}
// 2 · guest-link tool
{
  const { ctx, page } = await open('/?guests');
  const links = await page.locator('.tool-list li > div:first-child a').evaluateAll((as) => as.map((a) => a.textContent));
  ok('guest tool makes one link per name', links.length === 4 && links[0].includes('?to=%E1%9E%9B'), links[0]);
  await page.fill('textarea', 'កញ្ញា ចន្ថា\nកញ្ញា ចន្ថា\nMr. Tom');
  ok('guest tool removes duplicates', (await page.locator('.tool-list li').count()) === 2);
  await page.screenshot({ path: `${OUT}/03-guest-tool.png`, fullPage: true });
  await ctx.close();
}
// 3 · main page features (phone)
{
  const { ctx, page } = await open('/?open=1');
  await page.waitForTimeout(1200);
  await scrollTo(page, 'venue');
  await page.waitForTimeout(2500);
  const v = await page.evaluate(() => ({
    dir: document.querySelector('.venue-card[data-event="reception"] a[href*="maps/dir"]')?.href,
    tg: document.querySelector('.venue-card[data-event="reception"] a[href^="https://t.me"]')?.href,
    gcal: document.querySelector('.venue-card[data-event="reception"] a[href*="calendar.google.com"]')?.href,
    parking: document.querySelector('.parking-note')?.textContent,
    parkingLink: document.querySelector('.parking-link')?.href,
  }));
  ok('directions link', v.dir?.includes('destination=11.5564,104.9282'), v.dir);
  ok('send location via Telegram', v.tg?.includes('maps'), v.tg);
  ok('Google Calendar link with the date', v.gcal?.includes('20261212T103000Z'), v.gcal);
  ok('parking note + map link', v.parking && v.parkingLink?.includes('11.5551'), JSON.stringify(v));
  await page.locator('#venue').screenshot({ path: `${OUT}/04-venue.png` });

  await scrollTo(page, 'dresscode');
  await page.waitForTimeout(2200);
  ok('dress code: 4 silk swatches', (await page.locator('.swatch-silk').count()) === 4);
  await page.locator('#dresscode').screenshot({ path: `${OUT}/05-dresscode.png` });

  await scrollTo(page, 'programme');
  await page.waitForTimeout(1500);
  await page.locator('.prog-more').nth(2).tap();
  await page.waitForTimeout(1200);
  const guide = await page.evaluate(() => { const g = document.querySelectorAll('.prog-guide')[2]; const img = g.querySelector('img'); return { open: g.classList.contains('is-open'), h: Math.round(g.getBoundingClientRect().height), img: img?.naturalWidth || 0 }; });
  ok('every programme row has an illustration', await page.evaluate(() => document.querySelectorAll('.prog-guide img').length === document.querySelectorAll('.prog-item').length));
  ok('ceremony guide opens with its illustration', guide.open && guide.h > 150 && guide.img > 0, JSON.stringify(guide));
  await page.locator('.prog-item').nth(2).screenshot({ path: `${OUT}/06-ceremony-guide.png` });

  const card = await page.evaluate(async () => { const r = await fetch('/card.jpg'); return `${r.status} ${r.headers.get('content-type')}`; });
  ok('download card image available', card.startsWith('200 image/jpeg'), card);

  // blessing wall
  await scrollTo(page, 'candle');
  await page.waitForTimeout(1500);
  await page.locator('.bless-open').tap();
  await page.fill('.bless-form input', 'ម្តាយមីង');
  await page.fill('.bless-form textarea', 'សូមឲ្យក្មួយទាំងពីរមានសុភមង្គល និងសុខភាពល្អ');
  await page.screenshot({ path: `${OUT}/07-blessing-form.png` });
  await page.locator('.bless-form .btn-gold').tap();
  await page.waitForTimeout(1500);
  ok('blessing floats on the pond', (await page.locator('.bless-note blockquote').allTextContents()).some((s) => s.includes('សុភមង្គល')));
  await page.screenshot({ path: `${OUT}/08-blessing-floating.png` });

  // RSVP
  await scrollTo(page, 'rsvp');
  await page.waitForTimeout(1800);
  await page.fill('.rsvp input', 'លោក ដារ៉ា');
  await page.locator('.stepper button').nth(1).tap();
  await page.locator('.stepper button').nth(1).tap();
  await page.fill('.rsvp textarea', 'រីករាយណាស់');
  await page.locator('#rsvp').screenshot({ path: `${OUT}/09-rsvp-form.png` });
  await page.locator('.rsvp-send').tap();
  await page.waitForTimeout(1200);
  ok('RSVP sent', (await page.locator('.rsvp-done').count()) === 1);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#rsvp'); // the service worker may still be taking control
  await scrollTo(page, 'rsvp');
  await page.waitForTimeout(1500);
  ok('RSVP remembered after reload (can be edited)', (await page.locator('.rsvp-done').count()) === 1 && (await page.locator('.rsvp-done .btn').count()) === 1);
  await page.locator('#rsvp').screenshot({ path: `${OUT}/10-rsvp-done.png` });

  // animated couple
  await scrollTo(page, 'thanks');
  await page.waitForTimeout(4500);
  const anim = await page.evaluate(() => ({ eyes: getComputedStyle(document.querySelector('.tk-couple .eyes')).animationName, sbai: getComputedStyle(document.querySelector('.tk-couple .sbai')).animationName }));
  ok('animated couple blinks and the sbai sways', anim.eyes === 'blink' && anim.sbai === 'sway', JSON.stringify(anim));
  await page.locator('#thanks').screenshot({ path: `${OUT}/11-thanks-couple.png` });
  ok('no sideways scrolling', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await ctx.close();
}
// 4 · admin dashboard
{
  const { ctx, page } = await open('/?admin');
  await page.fill('input[type=password]', 'wrong');
  await page.locator('form .btn-gold').click();
  await page.waitForTimeout(600);
  ok('admin rejects a wrong key', (await page.locator('.rsvp-err').count()) === 1);
  await page.fill('input[type=password]', 'dev');
  await page.locator('form .btn-gold').click();
  await page.waitForTimeout(800);
  const stats = await page.locator('.tool-stat b').allTextContents();
  ok('admin shows visits, RSVP and people', +stats[0] >= 1 && stats[1] === '1' && stats[2] === '3', stats.join(','));
  ok('admin lists the blessing', (await page.locator('.tool-list').first().locator('li').count()) === 1);
  await page.screenshot({ path: `${OUT}/12-admin.png`, fullPage: true });
  page.on('dialog', (d) => d.accept());
  await page.locator('.tool-list').first().locator('.btn').click();
  await page.waitForTimeout(800);
  ok('admin can delete a blessing', (await page.locator('.tool-list').first().locator('li').count()) === 0);
  await ctx.close();
}
// 5 · day-of and after-the-wedding modes
{
  const { ctx, page } = await open(`/?open=1&now=${encodeURIComponent('2026-12-12T09:45:00+07:00')}`);
  await page.waitForTimeout(1200);
  ok('wedding day: cover says today', (await page.locator('.cover-pill').textContent()).includes('ថ្ងៃនេះ'));
  await scrollTo(page, 'programme');
  await page.waitForTimeout(2000);
  const now = await page.evaluate(() => [...document.querySelectorAll('.prog-item')].findIndex((li) => li.classList.contains('is-now')));
  ok('wedding day: 09:45 marks the hair-cutting ceremony as now', now === 8, String(now));
  await page.locator('#programme').screenshot({ path: `${OUT}/13-day-of.png` });
  await ctx.close();
}
{
  const { ctx, page } = await open(`/?open=1&now=${encodeURIComponent('2027-01-01T10:00:00+07:00')}`);
  await page.waitForTimeout(1200);
  ok('after: cover says we are married', (await page.locator('.cover-pill').textContent()).includes('រៀបការ'));
  ok('after: RSVP is hidden', (await page.locator('#rsvp').count()) === 0);
  await scrollTo(page, 'countdown');
  await page.waitForTimeout(2800);
  ok('after: days of married life', (await page.locator('.cd-married .cd-num').textContent()) === '២០', await page.locator('.cd-married .cd-num').textContent());
  await page.locator('#countdown').screenshot({ path: `${OUT}/14-after.png` });
  await ctx.close();
}
// 6 · Chinese at the smallest phone
{
  const { ctx, page } = await open('/?open=1', { viewport: { width: 320, height: 568 } });
  await page.waitForTimeout(1500);
  await page.locator('.tb-lang[lang=zh]').tap();
  await page.waitForTimeout(600);
  ok('Chinese switch', await page.evaluate(() => document.documentElement.lang === 'zh-Hans' && document.querySelector('.cover-invite').textContent === '诚挚邀请您光临'));
  await page.screenshot({ path: `${OUT}/15-zh-cover.png` });
  await scrollTo(page, 'programme');
  await page.waitForTimeout(2000);
  await page.locator('#programme').screenshot({ path: `${OUT}/16-zh-programme.png` });
  ok('Chinese: no sideways scrolling at 320px', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const barFits = await page.evaluate(() => document.querySelector('.tb-actions').getBoundingClientRect().right <= innerWidth && document.querySelector('.tb-logo').getBoundingClientRect().right < document.querySelector('.tb-actions').getBoundingClientRect().left);
  ok('top bar fits at 320px with three languages', barFits);
  await ctx.close();
}
// 7 · installable + offline
{
  const { ctx, page } = await open('/?open=1', { viewport: { width: 390, height: 844 } });
  const manifest = await page.evaluate(async () => (await (await fetch('/manifest.webmanifest')).json()).icons.length);
  ok('web app manifest with icons', manifest === 3);
  const sw = await page.evaluate(() => Promise.race([navigator.serviceWorker.ready.then(() => true), new Promise((r) => setTimeout(() => r(false), 8000))]));
  ok('service worker ready', sw);
  await page.reload({ waitUntil: 'networkidle' }); // let it cache the page and assets
  await page.waitForTimeout(1500);
  await ctx.setOffline(true);
  await page.reload({ waitUntil: 'load' }).catch(() => {});
  await page.waitForTimeout(1500);
  ok('opens offline', (await page.locator('#cover .cover-title').count()) === 1);
  await ctx.setOffline(false);
  await ctx.close();
}

// 8 · round 3: ceremonies, previews, lunar date, wedding-day tools, new sections, printables
{
  // separate invitations: a reception-only link shows only the reception
  const { ctx, page } = await open(`/?open=1&to=${encodeURIComponent('លោក សុខា')}&e=reception`);
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getElementById('programme').scrollIntoView());
  await page.waitForTimeout(1500);
  const rows = await page.locator('.prog-item').count();
  const cards = await page.locator('.venue-card').count();
  ok('reception-only link: only the reception rows, one venue card', rows === 3 && cards === 1, `${rows} rows, ${cards} cards`);
  ok('cover shows the guest venue', (await page.locator('.cover-venue').textContent()).includes('ផ្កាឈូក'));
  ok('lunar date worked out automatically', (await page.locator('.cover-lunar').textContent()).includes('៣កើត ខែមិគសិរ ឆ្នាំមមី'));
  await ctx.close();
}
{
  const { ctx, page } = await open('/?open=1');
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.getElementById('programme').scrollIntoView());
  await page.waitForTimeout(1500);
  ok('full link: two days with headings, ceremonies under them', (await page.locator('.prog-day').count()) === 2 && (await page.locator('.prog-event').count()) === 3 && (await page.locator('.venue-card').count()) === 2);
  // tree: MC + groom & bride + 6 on the groom's side + 7 on the bride's side
  ok('family photo layout: 20 people, couple under the arch, escort beside the bride', (await page.locator('.pt-node').count()) === 20 && (await page.locator('.fp-arch .pt-node').count()) === 2 && (await page.locator('.fp-escort').count()) === 1);
  ok('travel: hotels and routes', (await page.locator('.travel-row').count()) === 5);
  await page.evaluate(() => document.getElementById('film').scrollIntoView());
  await page.waitForTimeout(1500);
  ok('film plays by itself when scrolled into view (muted only when the browser had no tap yet)', await page.evaluate(() => { const v = document.querySelector('.film video'); return v && !v.paused; }));
  await page.locator('.film').tap();
  await page.waitForTimeout(1500);
  const vid = await page.evaluate(() => { const v = document.querySelector('.film-viewer video'); return v && { ok: v.readyState >= 1, dur: Math.round(v.duration) }; });
  ok('pre-wedding film opens and plays', vid?.ok && vid.dur > 10 && vid.dur <= 60, JSON.stringify(vid));
  await page.locator('.film-viewer .viewer-close').tap();
  await page.locator('#photos').count().then((c) => ok('photo album hidden before the wedding day', c === 0));
  await ctx.close();
}
{
  // link preview for crawlers (Telegram/Messenger don't run JavaScript)
  const html = await (await fetch(`${BASE}/?to=${encodeURIComponent('លោក សុខា')}`, { headers: { 'User-Agent': 'TelegramBot (like TwitterBot)' } })).text();
  ok('link preview names the guest', /og:title" content="សូមគោរពអញ្ជើញ លោក សុខា"/.test(html), (html.match(/og:title" content="[^"]*"/) || [''])[0]);
}
{
  // table finder + live + photos on the wedding day
  const seat = await fetch(`${BASE}/api/tables`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': 'dev' }, body: JSON.stringify({ rows: [{ name: 'លោក សុខា', table: '5' }, { name: 'កញ្ញា ស្រីពៅ', table: '12' }] }) }).then((r) => r.json());
  ok('seating list saved by the couple', seat.count === 2, JSON.stringify(seat));
  const denied = await fetch(`${BASE}/api/tables`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"rows":[]}' });
  ok('seating list cannot be changed without the key', denied.status === 401);
  const { ctx, page } = await open(`/?open=1&to=${encodeURIComponent('លោក សុខា')}&now=${encodeURIComponent('2026-12-12T16:00:00+07:00')}`);
  await page.waitForTimeout(2500);
  ok('wedding day: live button on the cover', (await page.locator('.cover-live').count()) === 1);
  ok('table finder finds the guest (title ignored)', (await page.locator('.table-no').first().textContent()) === '៥');
  await page.screenshot({ path: `${OUT}/20-table-finder.png` });
  await page.fill('.tables-form input', 'ស្រីពៅ');
  await page.waitForTimeout(1200);
  await page.locator('.tables-form .btn').tap();
  await page.waitForTimeout(1200);
  ok('table finder: second guest', (await page.locator('.table-no').first().textContent()) === '១២');
  // upload a photo made in the browser
  await page.evaluate(() => document.getElementById('photos').scrollIntoView());
  await page.waitForTimeout(1200);
  const up = await page.evaluate(async () => {
    const c = Object.assign(document.createElement('canvas'), { width: 400, height: 300 });
    const g = c.getContext('2d'); g.fillStyle = '#e2b52f'; g.fillRect(0, 0, 400, 300); g.fillStyle = '#2f7a2c'; g.fillRect(40, 40, 200, 120);
    const blob = await new Promise((ok2) => c.toBlob(ok2, 'image/jpeg', 0.9));
    const r = await fetch('/api/photos', { method: 'POST', body: blob, headers: { 'Content-Type': 'image/jpeg', 'x-guest': encodeURIComponent('ភ្ញៀវ') } });
    return r.status;
  });
  ok('guest photo upload accepted', up === 200, String(up));
  const fake = await fetch(`${BASE}/api/photos`, { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: 'not really a picture'.repeat(100) });
  ok('non-JPEG upload rejected', fake.status === 415 || fake.status === 429, String(fake.status));
  const list = await fetch(`${BASE}/api/photos`).then((r) => r.json());
  const img = list.items?.[0] && await fetch(BASE + list.items[0].url);
  ok('album lists the photo and serves it', list.items?.length >= 1 && img?.ok && img.headers.get('content-type') === 'image/jpeg');
  await ctx.close();
}
{
  // printables render with their QR codes
  const { ctx, page } = await open('/?print=poster', { viewport: { width: 900, height: 1200 } });
  await page.waitForFunction(() => [...document.querySelectorAll('.pr-qr')].every((q) => q.dataset.ready === '1'));
  ok('A4 poster: 3 QR codes', (await page.locator('.pr-qr svg').count()) === 3);
  await page.goto(`${BASE}/?print=tables&n=4`, { waitUntil: 'networkidle' });
  ok('A6 table cards: one per table', (await page.locator('.pr-a6').count()) === 4);
  await page.goto(`${BASE}/?print=a5`, { waitUntil: 'networkidle' });
  ok('A5 paper invitation: both ceremonies', (await page.locator('.pr-ev').count()) === 2);
  const pdf = await fetch(`${BASE}/print/invitation-a5.pdf`);
  ok('A5 PDF available to guests', pdf.ok && pdf.headers.get('content-type') === 'application/pdf');
  await ctx.close();
}

await browser.close();
ok('no page errors', allErrors.length === 0, allErrors.slice(0, 5).join(' | '));
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${!r.pass && r.info ? `  → ${r.info}` : ''}`);
console.log(`\n${results.filter((r) => r.pass).length}/${results.length} passed`);
