// Table finder (ចំណាត់តុ).
// GET  /api/tables?q=<name>          → up to 6 matching guests with their table (never the full list)
// POST /api/tables  { rows:[{name,table}] }  (couple only, x-admin-key) → replaces the seating list
// GET  /api/tables?all=1              (couple only) → the full list, for the dashboard
import { get, set } from './_store.js';
import { json, readBody, clean, guard, isAdmin, limited } from './_util.js';

// ignore titles and spacing so "លោក សុខា", "សុខា" and "Mr Sokha" find the same row
const TITLES = /^(លោកស្រី|លោក|អ្នកនាង|កញ្ញា|ឯកឧត្តម|លោកជំទាវ|mr\.?|mrs\.?|ms\.?|miss|dr\.?)\s*/i;
export const normal = (s) => String(s || '').normalize('NFC').toLowerCase().replace(TITLES, '').replace(/[\s.,'’-]+/g, '');

export default async function handler(req, res) {
  if (!guard(res)) return;
  const url = new URL(req.url, 'http://x');
  const load = async () => { try { return JSON.parse((await get('tables')) || '[]'); } catch { return []; } };

  if (req.method === 'POST') {
    if (!isAdmin(req)) return json(res, 401, { error: 'key' });
    const b = await readBody(req);
    const rows = (Array.isArray(b.rows) ? b.rows : [])
      .map((r) => ({ name: clean(r.name, 80), table: clean(r.table, 20) }))
      .filter((r) => r.name && r.table)
      .slice(0, 2000);
    await set('tables', JSON.stringify(rows));
    return json(res, 200, { ok: true, count: rows.length });
  }
  if (req.method !== 'GET') return json(res, 405, { error: 'method' });

  if (url.searchParams.has('all')) {
    if (!isAdmin(req)) return json(res, 401, { error: 'key' });
    return json(res, 200, { rows: await load() });
  }
  const q = normal(url.searchParams.get('q'));
  if (q.length < 2) return json(res, 200, { matches: [] });
  if (await limited(req, 'tables', 1)) return json(res, 429, { error: 'slow-down' });
  const rows = await load();
  const exact = rows.filter((r) => normal(r.name) === q);
  const partial = rows.filter((r) => normal(r.name) !== q && (normal(r.name).includes(q) || q.includes(normal(r.name))));
  return json(res, 200, { matches: [...exact, ...partial].slice(0, 6) });
}
