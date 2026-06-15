// ╔══════════════════════════════════════════════════════════════╗
// ║  FILE: sw.js (Service Worker)                               ║
// ║  PATH: frontend/public/sw.js                                ║
// ║                                                              ║
// ║  KYA HAI? → PWA service worker for offline caching.          ║
// ║  → App shell cache + network-first for API calls.           ║
// ║  → Enables "Add to Home Screen" / install prompt.           ║
// ╚══════════════════════════════════════════════════════════════╝

const CACHE_NAME = 'kingswell-v1';
const IS_LOCAL_DEV = ['localhost', '127.0.0.1'].includes(self.location.hostname);

// App-shell files to pre-cache on install
const PRE_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// ── Install: cache app shell ───────────────────────────────────
self.addEventListener('install', (event) => {
  if (IS_LOCAL_DEV) {
    event.waitUntil(caches.delete(CACHE_NAME));
    self.skipWaiting();
    return;
  }

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRE_CACHE))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ─────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network-first with cache fallback ───────────────────
self.addEventListener('fetch', (event) => {
  if (IS_LOCAL_DEV) return;

  const { request } = event;

  // Skip non-GET and API/auth calls — always go to network
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/uploads/')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful same-origin responses
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
