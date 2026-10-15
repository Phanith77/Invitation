// Functional checks of every interaction against a running build.
// Usage: npm run build && npx vite preview --port 4173, then `node scripts/functional.mjs [baseUrl]`
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:4173';
const OUT = 'qa/functional';
mkdirSync(OUT, { recursive: true });
const results = [];
const ok = (name, pass, info = '') => { results.push({ name, pass: !!pass, info }); };

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome' });

async function newPage(opts = {}, url = '/') {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...opts });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && !/gstatic|google|ERR_CONNECTION/.test(m.text()) && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(String(e)));
  // third-party (Google Maps embed) network hiccups are not errors in the site
  // cancelled loads (e.g. the music file when a page closes) are not errors
  page.on('requestfailed', (r) => !/google|gstatic/.test(r.url()) && !/ERR_ABORTED/.test(r.failure()?.errorText || '') && errors.push(`request failed: ${r.url()}`));
  page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  return { ctx, page, errors };
}
// Animations replay in both scroll directions and reset once a section is off-screen, so
// visibility is checked for what is on screen, step by step down the page.
async function inspectInView(page, selector, isBad) {
  const bad = new Set();
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const vh = await page.evaluate(() => innerHeight);
  for (let y = 0; y < h; y += Math.round(vh * 0.6)) {
    await page.evaluate((yy) => scrollTo(0, yy), y);
    await page.waitForTimeout(2600);
    const found = await page.evaluate(([sel, fn]) => {
      const test = new Function('el', 's', fn);
      return [...document.querySelectorAll(sel)].filter((el) => {
        const r = el.getBoundingClientRect();
        if (!el.offsetParent || r.height === 0 || r.top < 70 || r.bottom > innerHeight - 10) return false; // fully on screen only
        return test(el, getComputedStyle(el));
      }).map((el) => `${el.className}:${(el.textContent || '').slice(0, 18)}`);
    }, [selector, isBad]);
    found.forEach((f) => bad.add(f));
  }
  return [...bad];
}
const walk = async (page) => {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 400) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(120); }
  await page.waitForTimeout(1500);
};

// ── A · phone: envelope → cover → scroll cue → language → share ──
{
  const { ctx, page, errors } = await newPage();
  ok('A fonts loaded (Moul, Moulpali, Kantumruy Pro)', await page.evaluate(() => ['Moul', 'Moulpali', 'Kantumruy Pro'].every((f) => document.fonts.check(`16px "${f}"`, 'ក'))));
  ok('A page locked before opening', await page.evaluate(() => document.documentElement.classList.contains('is-locked')));
  // swiping on the envelope screen must not scroll the page underneath
  await page.touchscreen.tap(195, 120);
  await page.mouse.wheel(0, 600);
  ok('A no scroll behind envelope', (await page.evaluate(() => scrollY)) === 0);
  await page.waitForTimeout(2500);
  await page.tap('.env-stage');
  await page.waitForTimeout(7500);
  ok('A envelope removed after opening', (await page.locator('.env-screen').count()) === 0);
  ok('A page unlocked', await page.evaluate(() => !document.documentElement.classList.contains('is-locked')));
  ok('A top bar visible', await page.evaluate(() => getComputedStyle(document.querySelector('.topbar')).opacity === '1'));
  ok('A cover content visible', await page.evaluate(() => getComputedStyle(document.querySelector('.cover-inner')).visibility === 'visible'));
  await page.tap('.scroll-cue');
  await page.waitForTimeout(1600);
  const inv = await page.evaluate(() => Math.round(document.getElementById('invitation').getBoundingClientRect().top));
  ok('A scroll cue moves to invitation', Math.abs(inv) < 80, `invitation top=${inv}`);
  ok('A top bar gets dark backdrop when scrolled', await page.evaluate(() => document.querySelector('.topbar').classList.contains('is-scrolled')));

  await page.tap('.tb-lang[lang=en]');
  await page.waitForTimeout(800);
  ok('A language switches to English', await page.evaluate(() => document.documentElement.lang === 'en' && document.querySelector('.tb-lang[lang=en]').getAttribute('aria-pressed') === 'true'));
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/A-cover-en.png` });
  await walk(page);
  for (const id of ['invitation', 'couple', 'countdown', 'programme', 'gift', 'thanks']) {
    await page.locator(`#${id}`).screenshot({ path: `${OUT}/A-en-${id}.png` });
  }
  const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));
  ok('A no broken images', broken.length === 0, broken.join(', '));
  const hidden = await inspectInView(page, 'main h2, main h3, main p', "return s.opacity === '0' || s.visibility === 'hidden';");
  ok('A no text left invisible once on screen', hidden.length === 0, hidden.slice(0, 6).join(' | '));
  const stuck = await inspectInView(page, 'main .btn, .g-tile img, .qr-card',
    "return (+s.opacity < 0.99 && !el.disabled && !el.classList.contains('is-disabled')) || (s.transform !== 'none' && s.transform !== 'matrix(1, 0, 0, 1, 0, 0)');");
  await page.evaluate(() => document.getElementById('thanks').scrollIntoView());
  await page.waitForTimeout(5000); // thank-you sequence finishes
  stuck.push(...await page.evaluate(() => [...document.querySelectorAll('.share-btn')]
    .filter((el) => { const s = getComputedStyle(el); return +s.opacity < 0.99 || (s.transform !== 'none' && s.transform !== 'matrix(1, 0, 0, 1, 0, 0)'); })
    .map((el) => el.className)));
  ok('A buttons, QR cards and photos end fully visible and at rest', stuck.length === 0, stuck.slice(0, 6).join(' | '));
  // scrolling back up replays the animations: the invitation heading animates in again
  await page.evaluate(() => scrollTo(0, document.getElementById('invitation').getBoundingClientRect().top + scrollY - 120));
  await page.waitForTimeout(120);
  const midY = await page.evaluate(() => Math.round(new DOMMatrix(getComputedStyle(document.querySelector('#invitation .sec-title')).transform).m42));
  await page.waitForTimeout(2400);
  const endY = await page.evaluate(() => Math.round(new DOMMatrix(getComputedStyle(document.querySelector('#invitation .sec-title')).transform).m42));
  ok('A scrolling back up replays the section animation', midY > 10 && endY === 0, `start ${midY} → end ${endY}`);

  // share links
  const hrefs = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.share-btn')].map((a) => [a.className.split('share-')[2] || a.className, a.getAttribute('href')])));
  ok('A share links built', Object.values(hrefs).filter(Boolean).every((h) => /^(https:\/\/t\.me|fb-messenger|https:\/\/www\.facebook)/.test(h)), JSON.stringify(hrefs));
  await page.locator('.share-link').scrollIntoViewIfNeeded();
  await page.tap('.share-link');
  await page.waitForTimeout(300);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => 'ERR'));
  ok('A copy link copies the page URL', clip.startsWith(BASE), clip);
  ok('A copy link shows confirmation', (await page.locator('.share-link').textContent()).includes('copied'));
  const venue = await page.evaluate(() => ({
    maps: document.querySelector('.venue-card[data-event="reception"] .btn-gold').getAttribute('href'),
    cal: !document.querySelector('.venue-card[data-event="reception"] .venue-cal button').disabled,
    iframe: document.querySelector('.venue-card[data-event="reception"] .venue-map iframe')?.getAttribute('src'),
  }));
  ok('A venue: map embedded + Google Maps link', venue.iframe?.includes('output=embed') && venue.maps?.startsWith('https://www.google.com/maps'), JSON.stringify(venue));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.locator('.venue-card[data-event="reception"] .venue-cal button').tap()]);
  const ics = dl ? await (await dl.createReadStream()).toArray().then((c) => Buffer.concat(c).toString()) : '';
  ok('A Save to Calendar downloads a valid .ics', venue.cal && ics.includes('BEGIN:VEVENT') && ics.includes('DTSTART:20261212T103000Z'), ics.slice(0, 120));
  await page.evaluate(() => document.getElementById('countdown').scrollIntoView()); // it counts up each time it comes into view
  await page.waitForTimeout(3000);
  // the countdown resets when off-screen (it counts up again on return), so look at it on screen
  await page.evaluate(() => document.getElementById('countdown').scrollIntoView());
  await page.waitForTimeout(3000);
  const cd = await page.evaluate(() => [...document.querySelectorAll('.cd-num')].map((e) => e.textContent).join(' '));
  ok('A countdown is running', !/^(00 ?)+$/.test(cd.replace(/\s+$/, '')), cd);
  ok('A gift QR images load', await page.evaluate(() => [...document.querySelectorAll('.qr-img img')].every((i) => i.naturalWidth > 0) && document.querySelectorAll('.qr-img img').length === 2));
  ok('A footer credit', (await page.locator('.credit').textContent()).trim() === 'Design inspired by Phanith');
  ok('A no console errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ── B · phone: gallery viewer swipe, candle tap vs scroll ──
{
  const { ctx, page, errors } = await newPage({}, '/?open=1');
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.getElementById('gallery').scrollIntoView());
  await page.waitForTimeout(1500);
  await page.locator('.g-tile').first().tap();
  await page.waitForTimeout(700);
  ok('B viewer opens', (await page.locator('.viewer').count()) === 1);
  const count = () => page.locator('.viewer-count').textContent();
  // swipe left with a real pointer drag
  const swipe = async (from, to) => {
    await page.mouse.move(from, 420); await page.mouse.down();
    for (let x = from; from > to ? x > to : x < to; x += from > to ? -30 : 30) await page.mouse.move(x, 420);
    await page.mouse.up(); await page.waitForTimeout(700);
  };
  await swipe(330, 60);
  ok('B swipe left → next photo', (await count()).startsWith('២'), await count());
  await swipe(60, 330);
  ok('B swipe right → previous photo', (await count()).startsWith('១'), await count());
  const imgOk = await page.evaluate(() => { const r = document.querySelector('.viewer-slide img').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight && r.width > 100; });
  ok('B viewer photo fits the screen', imgOk);
  const y0 = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(300);
  ok('B page does not scroll behind the viewer', (await page.evaluate(() => scrollY)) === y0);
  await page.tap('.viewer-close');
  await page.waitForTimeout(300);
  ok('B viewer closes', (await page.locator('.viewer').count()) === 0);

  // candle: a tap floats a lantern, a scroll gesture should not
  await page.evaluate(() => scrollTo(0, document.getElementById('candle').getBoundingClientRect().top + scrollY));
  await page.waitForTimeout(2600); // hint lantern appears
  const lanterns = () => page.evaluate(() => window.__lanterns ?? -1);
  const before = await lanterns();
  await page.touchscreen.tap(120, 650);
  await page.waitForTimeout(300);
  ok('B tap on water adds a lantern', (await lanterns()) === before + 1, `${before} → ${await lanterns()}`);
  // a finger dragging across the water (scrolling past) must not add one
  const n1 = await lanterns();
  await page.mouse.move(200, 700); await page.mouse.down();
  for (let y = 700; y > 450; y -= 25) await page.mouse.move(200, y);
  await page.mouse.up();
  await page.waitForTimeout(300);
  ok('B scroll gesture over water does not add a lantern', (await lanterns()) === n1, `${n1} → ${await lanterns()}`);
  // reload half-way down: must start at the top under the envelope
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => scrollTo(0, 3000));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  ok('B reload starts at the top', (await page.evaluate(() => scrollY)) === 0, String(await page.evaluate(() => scrollY)));
  const ta = await page.evaluate(() => getComputedStyle(document.querySelector('.env-screen')).touchAction);
  ok('B envelope screen blocks touch scrolling (iOS)', ta === 'none', ta);
  // sections below the cover mount once the invitation is opened
  await page.goto(BASE + '/?open=1', { waitUntil: 'networkidle' });
  await page.waitForSelector('.share-messenger', { state: 'attached' });
  const msgTarget = await page.evaluate(() => document.querySelector('.share-messenger').getAttribute('target'));
  ok('B Messenger app link opens in place', msgTarget === null, String(msgTarget));
  ok('B no console errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ── C · desktop: Lenis, keyboard, WebGL, envelope via keyboard ──
{
  const { ctx, page, errors } = await newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false });
  await page.waitForTimeout(2500);
  await page.focus('.env-stage');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7500);
  ok('C envelope opens with keyboard (Enter)', (await page.locator('.env-screen').count()) === 0);
  ok('C smooth scroll (Lenis) active on desktop', await page.evaluate(() => document.documentElement.classList.contains('lenis')));
  ok('C WebGL cover running', await page.evaluate(() => !!document.querySelector('.cover-gl.on')));
  await page.click('.scroll-cue');
  await page.waitForTimeout(2200);
  const inv = await page.evaluate(() => Math.round(document.getElementById('invitation').getBoundingClientRect().top));
  ok('C scroll cue moves to invitation (desktop)', Math.abs(inv) < 80, `top=${inv}`);
  await page.evaluate(() => window.__lenis?.scrollTo('#gallery', { immediate: true }));
  await page.waitForTimeout(1500);
  await page.locator('.g-tile').first().click();
  await page.waitForTimeout(600);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(600);
  ok('C arrow key → next photo', (await page.locator('.viewer-count').textContent()).startsWith('២'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  ok('C Esc closes viewer', (await page.locator('.viewer').count()) === 0);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(900);
  ok('C page scrolls again after viewer closed', (await page.evaluate(() => scrollY)) > 0);
  // window resize: no overflow, pin recalculates
  await page.setViewportSize({ width: 900, height: 700 });
  await page.waitForTimeout(1200);
  ok('C no overflow after resize', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  ok('C no console errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ── D · reduced motion and ?lite ──
for (const [label, opts, url] of [['D reduced-motion', { reducedMotion: 'reduce' }, '/'], ['E lite', {}, '/?lite=1']]) {
  const { ctx, page, errors } = await newPage(opts, url);
  await page.waitForTimeout(1500);
  await page.tap('.env-stage');
  await page.waitForTimeout(label.startsWith('D') ? 2500 : 7500);
  ok(`${label}: envelope opens`, (await page.locator('.env-screen').count()) === 0);
  const hidden = (await inspectInView(page, 'main h2, main h3, main p, .g-tile, .person, .qr-card', "return +s.opacity < 0.5 || s.visibility === 'hidden';")).length;
  ok(`${label}: all content visible`, hidden === 0, `${hidden} hidden`);
  ok(`${label}: no overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  ok(`${label}: no console errors`, errors.length === 0, errors.join(' | '));
  await page.screenshot({ path: `${OUT}/${label.split(' ')[0]}-end.png` });
  await ctx.close();
}

await browser.close();
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.info && !r.pass ? `  → ${r.info}` : ''}`);
console.log(`\n${results.filter((r) => r.pass).length}/${results.length} passed`);
