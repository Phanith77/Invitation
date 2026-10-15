import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { storeReady, setOnce } from './_store.js';

export const json = (res, status, body) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
};

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body; // Vercel parses JSON already
  // join raw bytes before decoding, so multi-byte Khmer characters split across chunks stay intact
  const chunks = [];
  let size = 0;
  for await (const chunk of req) { chunks.push(chunk); size += chunk.length; if (size > 20_000) break; }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { return {}; }
}

/** plain text only, trimmed, length-limited */
export const clean = (v, max) => String(v ?? '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
export const newId = () => randomUUID().replace(/-/g, '').slice(0, 16);
export const validId = (v) => /^[a-f0-9]{16}$/.test(String(v || ''));

/** coarse per-visitor rate limit; the IP is hashed with a daily salt and never stored in clear */
export async function limited(req, bucket, seconds) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const day = new Date().toISOString().slice(0, 10);
  const h = createHash('sha256').update(`${ip}|${day}|${process.env.ADMIN_KEY || 'salt'}`).digest('hex').slice(0, 20);
  return !(await setOnce(`rl:${bucket}:${h}`, seconds));
}

export function guard(res) {
  if (!storeReady()) { json(res, 503, { error: 'storage-not-configured' }); return false; }
  return true;
}

/** the couple's key (ADMIN_KEY on Vercel; "dev" locally), compared in constant time */
export function isAdmin(req) {
  const key = process.env.ADMIN_KEY || (process.env.VERCEL ? '' : 'dev');
  const given = Buffer.from(String(req.headers['x-admin-key'] || ''));
  const want = Buffer.from(key);
  return key.length >= 3 && given.length === want.length && timingSafeEqual(given, want);
}
