// Personal link previews. Telegram / Messenger read only the HTML (no JavaScript), so for
// links with ?to=<name> this returns the normal page with the preview title rewritten to
// "សូមគោរពអញ្ជើញ <name>". The preview image stays the couple's picture.
// Vercel routes "/?to=…" here (vercel.json); locally the Vite plugin does the same.
import { json } from './_util.js';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cleanName = (v) => String(v || '').replace(/[<>{}"]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);

/** rewrite the preview tags of index.html for one guest */
export function personalise(html, name) {
  if (!name) return html;
  const title = esc(`សូមគោរពអញ្ជើញ ${name}`);
  const set = (prop, value) => {
    const re = new RegExp(`(<meta (?:property|name)="${prop}" content=")[^"]*(")`);
    html = re.test(html) ? html.replace(re, `$1${value}$2`) : html.replace('</head>', `<meta property="${prop}" content="${value}" />\n</head>`);
  };
  set('og:title', title);
  set('twitter:title', title);
  html = html.replace(/<title>([^<]*)<\/title>/, (_, t) => `<title>${title} · ${t}</title>`);
  return html;
}

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const name = cleanName(url.searchParams.get('to'));
  const proto = req.headers['x-forwarded-proto'] || (String(req.headers.host).startsWith('localhost') ? 'http' : 'https');
  const page = await fetch(`${proto}://${req.headers.host}/index.html`);
  if (!page.ok) return json(res, 502, { error: 'page' });
  const html = personalise(await page.text(), name);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600');
  res.end(html);
}
