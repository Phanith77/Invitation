// Offline support: once opened, the invitation keeps working with weak or no signal.
// Pages: network first (so updates arrive), cached copy when offline.
// Built assets, photos, textures, icons: cache first (their names change when they change).
// The API (RSVP, blessings, visits) is never cached.
const CACHE = 'invite-v2';
const SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192.png', '/textures/silk.webp', '/textures/paper-card.webp', '/textures/paper-lining.webp'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('/', copy)); return res; })
        .catch(() => caches.match('/')),
    );
    return;
  }
  if (/^\/(assets|photos|textures|icons|qr|music)\//.test(url.pathname) || /\.(woff2?|jpg|png|webp|mp3)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
        return res;
      })),
    );
  }
});
