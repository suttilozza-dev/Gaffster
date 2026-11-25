/*
 * Gaffster service worker. It does one thing: if a page cannot load because there is no internet connection, it shows
 * /offline.html instead of the browser's error page. Everything else goes straight to the network, so new deploys are
 * never held back by a cache and nothing about the visitor is stored. Cache storage holds only the offline page and its
 * icon (listed on the Cookies page as gaffster-offline).
 */
const CACHE = 'gaffster-offline-v1'
const OFFLINE = ['/offline.html', '/brand/icon-192.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(OFFLINE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('gaffster-offline') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(() => caches.match('/offline.html')))
    return
  }
  // the offline page's own icon, when there is no connection
  if (new URL(req.url).pathname === '/brand/icon-192.png') {
    event.respondWith(fetch(req).catch(() => caches.match(req)))
  }
})
