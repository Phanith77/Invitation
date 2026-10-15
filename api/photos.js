// Guest photo sharing.
// POST   /api/photos   body: JPEG bytes (resized in the browser), header x-guest: name → stores it
// GET    /api/photos                 → the latest photos (public album)
// GET    /api/photos?file=<name>     → (local dev only) the image itself
// DELETE /api/photos?id=<id>         (couple only) → removes a photo
import { hset, hall, hdel, putFile, deleteFile, readLocalFile, blobReady } from './_store.js';
import { json, clean, newId, validId, guard, isAdmin, limited } from './_util.js';

const MAX = 3 * 1024 * 1024;

async function readRaw(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  let size = 0;
  for await (const c of req) { chunks.push(c); size += c.length; if (size > MAX) return null; }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const url = new URL(req.url, 'http://x');
  if (req.method === 'GET' && url.searchParams.has('file')) {
    const buf = readLocalFile(url.searchParams.get('file'));
    if (!buf) return json(res, 404, { error: 'file' });
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.end(buf);
  }
  if (!guard(res)) return;
  if (!blobReady()) return json(res, 503, { error: 'storage-not-configured' });

  if (req.method === 'GET') {
    const all = Object.entries(await hall('photos')).map(([id, v]) => ({ id, ...v })).sort((a, b) => b.t - a.t);
    return json(res, 200, { items: all.slice(0, 120) });
  }
  if (req.method === 'DELETE') {
    if (!isAdmin(req)) return json(res, 401, { error: 'key' });
    const id = url.searchParams.get('id');
    if (!validId(id)) return json(res, 400, { error: 'id' });
    const all = await hall('photos');
    if (all[id]) await deleteFile(all[id].url);
    await hdel('photos', id);
    return json(res, 200, { ok: true });
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'method' });
  if (await limited(req, 'photo', 2)) return json(res, 429, { error: 'slow-down' });
  if (!/^image\/jpeg/.test(req.headers['content-type'] || '')) return json(res, 415, { error: 'type' });
  const buf = await readRaw(req);
  if (!buf || buf.length < 1000) return json(res, 413, { error: 'size' });
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return json(res, 415, { error: 'type' }); // must really be a JPEG
  const id = newId();
  const fileUrl = await putFile(`${id}.jpg`, buf, 'image/jpeg');
  const item = { url: fileUrl, name: clean(decodeURIComponent(req.headers['x-guest'] || ''), 40), t: Date.now() };
  await hset('photos', id, item);
  return json(res, 200, { ok: true, item: { id, ...item } });
}
