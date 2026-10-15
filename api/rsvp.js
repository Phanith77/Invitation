// POST /api/rsvp  { id?, name, attending, people, note }
// Guests can update their own answer: the browser keeps the id it was given.
import { hset } from './_store.js';
import { json, readBody, clean, newId, validId, limited, guard } from './_util.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'method' });
  if (!guard(res)) return;
  if (await limited(req, 'rsvp', 5)) return json(res, 429, { error: 'slow-down' });
  const b = await readBody(req);
  const name = clean(b.name, 80);
  if (!name) return json(res, 400, { error: 'name' });
  const attending = b.attending === true || b.attending === 'yes';
  const people = attending ? Math.max(1, Math.min(10, parseInt(b.people, 10) || 1)) : 0;
  const id = validId(b.id) ? b.id : newId();
  const events = Array.isArray(b.events) ? b.events.map((e) => clean(e, 20)).filter(Boolean).slice(0, 5) : [];
  await hset('rsvp', id, { name, attending, people, note: clean(b.note, 300), events, t: Date.now() });
  return json(res, 200, { ok: true, id });
}
