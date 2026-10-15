// Couple-only dashboard data. Requires the ADMIN_KEY env var (header x-admin-key).
// GET    /api/admin                    → visits, RSVPs, blessings
// DELETE /api/admin?blessing=<id>      → remove a blessing
import { timingSafeEqual } from 'node:crypto';
import { get, mget, hall, hdel } from './_store.js';
import { json, guard, validId } from './_util.js';

const KEY = process.env.ADMIN_KEY || (process.env.VERCEL ? '' : 'dev'); // local dev key: "dev"

function authorised(req) {
  const given = Buffer.from(String(req.headers['x-admin-key'] || ''));
  const want = Buffer.from(KEY);
  return KEY.length >= 3 && given.length === want.length && timingSafeEqual(given, want);
}

export default async function handler(req, res) {
  if (!guard(res)) return;
  if (!authorised(req)) return json(res, 401, { error: 'key' });
  const url = new URL(req.url, 'http://x');

  if (req.method === 'DELETE') {
    const id = url.searchParams.get('blessing');
    if (!validId(id)) return json(res, 400, { error: 'id' });
    await hdel('blessings', id);
    return json(res, 200, { ok: true });
  }
  if (req.method !== 'GET') return json(res, 405, { error: 'method' });

  const days = Array.from({ length: 21 }, (_, i) => new Date(Date.now() + 7 * 3600e3 - i * 864e5).toISOString().slice(0, 10));
  const [total, perDay, rsvp, blessings] = await Promise.all([get('visits'), mget(days.map((d) => `visits:${d}`)), hall('rsvp'), hall('blessings')]);
  const list = (o) => Object.entries(o).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.t - a.t);
  return json(res, 200, {
    visits: { total: Number(total) || 0, days: days.map((d, i) => ({ day: d, count: Number(perDay[i]) || 0 })) },
    rsvp: list(rsvp),
    blessings: list(blessings),
  });
}
