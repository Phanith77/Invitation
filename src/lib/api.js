// Client for the small serverless API. Every call fails soft: if storage isn't configured
// the feature simply hides itself.
async function call(path, opts = {}) {
  const r = await fetch(`/api/${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.error || r.status), { status: r.status });
  return body;
}
export const api = {
  rsvp: (data) => call('rsvp', { method: 'POST', body: JSON.stringify(data) }),
  blessings: () => call('blessings'),
  bless: (data) => call('blessings', { method: 'POST', body: JSON.stringify(data) }),
  visit: () => call('visit', { method: 'POST', body: '{}' }),
  admin: (key) => call('admin', { headers: { 'x-admin-key': key } }),
  removeBlessing: (key, id) => call(`admin?blessing=${id}`, { method: 'DELETE', headers: { 'x-admin-key': key } }),
  findTable: (q) => call(`tables?q=${encodeURIComponent(q)}`),
  allTables: (key) => call('tables?all=1', { headers: { 'x-admin-key': key } }),
  saveTables: (key, rows) => call('tables', { method: 'POST', body: JSON.stringify({ rows }), headers: { 'x-admin-key': key } }),
  photos: () => call('photos'),
  removePhoto: (key, id) => call(`photos?id=${id}`, { method: 'DELETE', headers: { 'x-admin-key': key } }),
  /** upload one JPEG blob (already resized in the browser) */
  uploadPhoto: async (blob, name) => {
    const r = await fetch('/api/photos', { method: 'POST', body: blob, headers: { 'Content-Type': 'image/jpeg', 'x-guest': encodeURIComponent(name || '') } });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(body.error || r.status), { status: r.status });
    return body;
  },
};

/** resize a picked photo in the browser (max 1600px, JPEG) so uploads are small and fast on 4G */
export async function shrinkPhoto(file, max = 1600) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.82));
}

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
export { store };

/** count one visit per browser session (anonymous) */
export function countVisit() {
  try {
    if (sessionStorage.getItem('visited')) return;
    sessionStorage.setItem('visited', '1');
  } catch { /* storage blocked: still count */ }
  api.visit().catch(() => {});
}
