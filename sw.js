const CACHE_NAME = 'chik-pogodi-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    // any other scripts, fonts, etc.
];

// Install: cache everything in `STATIC_ASSETS`
self.addEventListener('install', evt => {
    evt.waitUntil((async () => {
        const cache = await caches.open('my-cache');
        try {
            await cache.addAll([
                '/', '/index.html', /* …other assets… */
            ]);
        } catch (e) {
            console.warn('Some assets failed to cache, continuing anyway', e);
        }
    })());
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );
});

// Fetch: serve from cache first, fallback to network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cached =>
            cached || fetch(event.request)
        )
    );
});