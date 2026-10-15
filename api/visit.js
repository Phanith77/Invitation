// POST /api/visit → anonymous counter (total + per day). Nothing about the visitor is stored.
import { incr } from './_store.js';
import { json, guard } from './_util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method' });
  if (!guard(res)) return;
  const day = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); // Phnom Penh date
  await Promise.all([incr('visits'), incr(`visits:${day}`)]);
  return json(res, 200, { ok: true });
}
