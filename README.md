# Khmer wedding e-invitation (React + Vite)

- **All wedding details:** `src/data/wedding.js` — currently filled with FICTIONAL sample data (marked SAMPLE); replace with the real couple's details
- **Gift QR codes:** `public/qr/` — the sample images only encode a note; replace with real KHQR / ABA images
- **All interface text (Khmer + English):** `src/i18n.js`
- **Illustrations:** `node scripts/illustrations.mjs` draws the original illustrated couple and scenes into `/photos` (then run `npm run photos`). Real photos can be dropped into `/photos` instead.
- **Style:** "Rumdul Evening" concept: the opening is a rumdul (ផ្ការំដួល, Cambodia's national flower) on a branch in an evening garden that opens in 3D (`src/components/RumdulIntro.jsx`, `src/styles/intro.css`); palette `rumdulEvening` in `src/data/wedding.js` (other palettes remain selectable).
- **Photos:** put originals in `/photos` (a file name containing `cover` becomes the cover), then run `npm run photos`
  → WebP at 640/1280/2000 px, EXIF/GPS stripped, `src/data/gallery.json` rebuilt. Delete the `placeholder-*` files first.
- **Paper textures:** `npm run textures` (colour-neutral overlays, so palette changes don't need a re-run)
- **Link preview image:** `npm run og` (with `npm run dev` running) → `public/og.jpg`
- **Interaction tests:** `npm run build`, `npx vite preview --port 4173`, then `npm test`
- **QA screenshots:** `npm run dev`, then `npm run shots` → `/qa` (4 viewports + the opening as frames)

Dev helpers: `?open=1` skips the envelope, `?lite=1` forces the light version, `?nogl=1` disables WebGL.

## Add-on features

| Feature | Where / how |
|---|---|
| Personal guest links | `/?guests` → paste names, copy or send each link. `?to=Name` shows the name on the envelope and cover. Nothing is stored. |
| Music | `npm run music -- "path/to/song.mp4"` converts any audio/video you have the right to use into a light mp3 in `public/music/` and sets `wedding.music`. Without it, a generated lotus-pond ambience plays (`src/lib/ambience.js`). |
| Calendar + directions | Venue: Google Maps, directions, send location via Telegram, `.ics` (reminders 1 day and 2 h before), Google Calendar. |
| Dress code, parking | `dressCode` and `parking` in `src/data/wedding.js`. |
| Ceremony guide | `programme[].about` + `art` (ritual illustrations `rite-*`). |
| Download card | `public/card.jpg`, rebuilt by `npm run og` (with `npm run dev` running). |
| Blessing wall, RSVP, visit counter | Serverless functions in `/api` (see below). |
| Couple's dashboard | `/?admin` (key = `ADMIN_KEY`; `dev` when running locally). RSVP list + CSV, blessings (delete), visits per day. |
| Day-of / after modes | Automatic from `dateISO` (Phnom Penh time). Test with `?now=2026-12-12T09:45+07:00`. |
| Languages | ខ្មែរ · English · 中文 (`src/i18n.js`). |
| Animated couple | `src/art/characters.js` (shared with the artwork script) → `AnimatedCouple`. |
| Installable / offline | `public/manifest.webmanifest`, `public/sw.js`, icons via `npm run icons`. |

### Turning on RSVP, blessings and the visit counter on Vercel
1. In the Vercel project: **Storage → Marketplace → Upstash (Redis)** → create a free database and connect it.
   This adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` (or `UPSTASH_REDIS_REST_URL` / `_TOKEN`) automatically.
2. Add an environment variable `ADMIN_KEY` = a long secret only the couple knows.
3. Redeploy. Until storage is connected, these features show "available once the site is live" and everything else works.

Privacy: RSVP stores only what the guest types (name, attending, number of people, note), visible only on the dashboard.
Blessings are public on the page. The visit counter stores numbers only; IPs are never stored (a salted daily hash is used briefly for anti-spam).

### Tests
`npm run build`, `npx vite preview --port 4173`, then `npm test` (85 checks). Layout screenshots: `npm run shots`.

## Professional features (round 3)

| Feature | Where / how |
|---|---|
| Separate invitations per ceremony | `events` in `src/data/wedding.js` (rituals at home, reception at the hall). Guest links add `&e=rituals` or `&e=reception`; the guest-link tool (`/?guests`) has a tick box per ceremony. Programme, venue cards, calendar and RSVP follow the guest's link. |
| Guest's name in link previews | `api/invite.js` + `vercel.json` rewrite: Telegram/Messenger previews of `/?to=Name` read "សូមគោរពអញ្ជើញ Name". |
| Automatic dates | The date row and the Khmer lunar date are worked out from `dateISO` at build time (`src/lib/lunar.js`, `@thyrith/momentkh`); never type them by hand. |
| Table finder (ចំណាត់តុ) | Shown on the wedding day. Paste the seating list ("name, table") in the dashboard (`/?admin`). |
| Live stream | `live.url` — a "watch live" button appears on the cover on the wedding day. |
| Guest photo sharing | Shown from the wedding day. Needs a Vercel Blob store (see below). Delete / download-all in the dashboard. |
| Wedding party, travel & stay | `weddingParty`, `travel` in `src/data/wedding.js`; portraits from `npm run art`. |
| Pre-wedding film | `video` (a local mp4 or a YouTube id). `npm run video` makes the sample slideshow. |
| Printables | `npm run print` (with `npm run dev` running) → `public/print/`: A4 venue QR poster, A6 table cards (`TABLES=20 npm run print`), A5 paper invitation for elders. Set `siteUrl` first so the QR codes point at the live site. |
| Speed | Sections load in the background while the opening shows; music downloads only on tap. `node scripts/speed.mjs` measures a slow-4G phone (ready to tap ≈ 3.3 s). |

### Storage on Vercel (for RSVP, blessings, visits, seating list and guest photos)
1. **Storage → Marketplace → Upstash (Redis)** → connect (RSVP, blessings, visits, seating list).
2. **Storage → Blob** → create and connect (guest photos). This adds `BLOB_READ_WRITE_TOKEN`.
3. Add `ADMIN_KEY` (your dashboard password) in **Settings → Environment Variables**, then redeploy.

### Your own web address (e.g. visal-sophea.com)
1. Buy the name at a registrar (Namecheap, Cloudflare, Porkbun…; a `.com` is about $10 a year). Check spelling carefully; short and easy to type in Khmer and English.
2. In Vercel: **Project → Settings → Domains → Add** → type the name. Vercel shows one or two DNS records.
3. At the registrar, open **DNS** and add exactly those records (usually an `A` record to `76.76.21.21` and a `CNAME` for `www` to `cname.vercel-dns.com`). Wait a few minutes; Vercel turns on HTTPS automatically.
4. Set `siteUrl: 'https://visal-sophea.com'` in `src/data/wedding.js` and `VITE_SITE_URL` in Vercel, then run `npm run og` and `npm run print` again so previews and QR codes use the new address, and redeploy.
