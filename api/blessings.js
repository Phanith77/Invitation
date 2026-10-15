// GET  /api/blessings          → the latest public blessings
// POST /api/blessings { name, message }
import { hset, hall } from './_store.js';
import { json, readBody, clean, newId, limited, guard } from './_util.js';

export default async function handler(req, res) {
  if (!guard(res)) return;
  if (req.method === 'GET') {
    const all = Object.entries(await hall('blessings')).map(([id, v]) => ({ id, ...v }));
    all.sort((a, b) => b.t - a.t);
    res.setHeader('Cache-Control', 'no-store');
    return json(res, 200, { items: all.slice(0, 60).map(({ id, name, message, t }) => ({ id, name, message, t })) });
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'method' });
  if (await limited(req, 'bless', 20)) return json(res, 429, { error: 'slow-down' });
  const b = await readBody(req);
  const name = clean(b.name, 40), message = clean(b.message, 160);
  if (!name || message.length < 2) return json(res, 400, { error: 'empty' });
  const item = { name, message, t: Date.now() };
  const id = newId();
  await hset('blessings', id, item);
  return json(res, 200, { ok: true, item: { id, ...item } });
}
