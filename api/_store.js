// Tiny key-value store for the serverless API.
// Production: Upstash Redis over REST (free tier), via either
//   UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN, or Vercel KV's KV_REST_API_URL + KV_REST_API_TOKEN.
// Local dev: a JSON file in .data/ (never used on Vercel, whose filesystem is read-only).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const PREFIX = 'wedding:';

export const storeReady = () => !!(URL_ && TOKEN) || !process.env.VERCEL;

async function redis(cmd) {
  const r = await fetch(URL_, { method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cmd) });
  if (!r.ok) throw new Error(`store ${r.status}`);
  return (await r.json()).result;
}

// ── local file store (dev) ──
const FILE = '.data/dev-db.json';
const load = () => (existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')) : { kv: {}, h: {}, exp: {} });
const save = (db) => { mkdirSync('.data', { recursive: true }); writeFileSync(FILE, JSON.stringify(db, null, 2)); };

const useRedis = () => !!(URL_ && TOKEN);

export async function incr(key) {
  if (useRedis()) return redis(['INCR', PREFIX + key]);
  const db = load(); db.kv[key] = (db.kv[key] || 0) + 1; save(db); return db.kv[key];
}
export async function get(key) {
  if (useRedis()) return redis(['GET', PREFIX + key]);
  return load().kv[key] ?? null;
}
export async function mget(keys) {
  if (!keys.length) return [];
  if (useRedis()) return redis(['MGET', ...keys.map((k) => PREFIX + k)]);
  const db = load(); return keys.map((k) => db.kv[k] ?? null);
}
/** set a key that expires (used for rate limiting); returns false if it already existed */
export async function setOnce(key, seconds) {
  if (useRedis()) return (await redis(['SET', PREFIX + key, '1', 'NX', 'EX', String(seconds)])) === 'OK';
  const db = load(), t = Date.now();
  if (db.exp[key] && db.exp[key] > t) return false;
  db.exp[key] = t + seconds * 1000; save(db); return true;
}
export async function hset(hash, field, value) {
  if (useRedis()) return redis(['HSET', PREFIX + hash, field, JSON.stringify(value)]);
  const db = load(); (db.h[hash] ||= {})[field] = value; save(db);
}
export async function hdel(hash, field) {
  if (useRedis()) return redis(['HDEL', PREFIX + hash, field]);
  const db = load(); if (db.h[hash]) delete db.h[hash][field]; save(db);
}
export async function hall(hash) {
  if (useRedis()) {
    const flat = (await redis(['HGETALL', PREFIX + hash])) || [];
    const out = {};
    for (let i = 0; i < flat.length; i += 2) { try { out[flat[i]] = JSON.parse(flat[i + 1]); } catch { /* skip bad row */ } }
    return out;
  }
  return load().h[hash] || {};
}

/** plain string value (e.g. the seating list as JSON) */
export async function set(key, value) {
  if (useRedis()) return redis(['SET', PREFIX + key, value]);
  const db = load(); db.kv[key] = value; save(db);
}

// ── binary files (guest photos) ──
// Production: Vercel Blob (BLOB_READ_WRITE_TOKEN, added when you connect a Blob store).
// Local dev: .data/uploads, served back through /api/photos?file=…
export const blobReady = () => !!process.env.BLOB_READ_WRITE_TOKEN || !process.env.VERCEL;
export async function putFile(name, buffer, contentType) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const r = await put(`wedding-photos/${name}`, buffer, { access: 'public', contentType, addRandomSuffix: false });
    return r.url;
  }
  mkdirSync('.data/uploads', { recursive: true });
  writeFileSync(`.data/uploads/${name}`, buffer);
  return `/api/photos?file=${encodeURIComponent(name)}`;
}
export async function deleteFile(url) {
  if (process.env.BLOB_READ_WRITE_TOKEN && /^https:/.test(url)) {
    const { del } = await import('@vercel/blob');
    return del(url);
  }
  const m = /file=([^&]+)/.exec(url || '');
  if (m) { const { rmSync } = await import('node:fs'); rmSync(`.data/uploads/${decodeURIComponent(m[1])}`, { force: true }); }
}
export function readLocalFile(name) {
  const safe = String(name).replace(/[^a-z0-9._-]/gi, '');
  return existsSync(`.data/uploads/${safe}`) ? readFileSync(`.data/uploads/${safe}`) : null;
}
