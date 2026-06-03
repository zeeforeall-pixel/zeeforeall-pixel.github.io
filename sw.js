// Service Worker for dear.sidi
// Version 1.0.0 - Phase 2C Optimizations

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/audio/Hindia-everything-u-are.m4a',
  '/assets/audio/The-1975-About-You.m4a',
  '/assets/audio/Reality-Club-Anything-You-Want-Official-Lyric-Video.m4a',
  '/assets/audio/A-Sorrowful-Reunion-Reality-Club-Official-Lyric-Video.m4a',
  '/assets/audio/Mac-DeMarco-No-Other-Heart-Official-Audio.m4a',
  '/assets/audio/Nirvana-Smells-Like-Teen-Spirit-Official-Music-Video.m4a',
  '/assets/audio/The-Script-The-Man-Who-Can-t-Be-Moved-Official-Video.m4a',
  '/assets/audio/Hey-Jude-Remastered-2015.m4a',
  '/assets/audio/Neck-Deep-December.m4a',
  '/assets/audio/Wish-You-Were-Here.m4a'
];

// API endpoints to cache with stale-while-revalidate
const API_ENDPOINTS = [
  'lrclib.net',
  'open.spotify.com',
  'pipedapi.kavin.rocks'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(url => !url.includes('.m4a'))); // Skip large audio files on install
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('static-') || name.startsWith('dynamic-') || name.startsWith('api-'))
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests - stale-while-revalidate
  if (API_ENDPOINTS.some(endpoint => url.hostname.includes(endpoint))) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // Audio files - cache first, then network
  if (request.url.includes('/assets/audio/') || request.url.includes('.m4a') || request.url.includes('.mp3')) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Images - cache first, then network
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, DYNAMIC_CACHE));
    return;
  }

  // Fonts - cache first
  if (request.destination === 'font' || /\.(woff|woff2|ttf|otf|eot)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML pages - network first, fallback to cache
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, STATIC_CACHE));
    return;
  }

  // Default - network first
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Cache strategies

// Cache first, fallback to network
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache hit:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network first, fallback to cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, using cache:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline page for HTML requests
    if (request.destination === 'document') {
      return new Response(getOfflinePage(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale while revalidate - return cache immediately, update in background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

// Offline fallback page
function getOfflinePage() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - dear.sidi</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'JetBrains Mono', monospace;
      background: #1a1a1a;
      color: #e8e6e3;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 20px;
    }
    .offline-container {
      max-width: 500px;
    }
    h1 {
      font-size: 3rem;
      color: #d4a574;
      margin-bottom: 20px;
    }
    p {
      font-size: 1.1rem;
      color: #888;
      margin-bottom: 30px;
    }
    button {
      background: #d4a574;
      color: #1a1a1a;
      border: none;
      padding: 12px 30px;
      font-size: 1rem;
      font-family: inherit;
      border-radius: 25px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    button:hover {
      background: #e8b87e;
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(212, 165, 116, 0.4);
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <h1>📡 Offline</h1>
    <p>You're currently offline. Please check your internet connection and try again.</p>
    <button onclick="window.location.reload()">Retry</button>
  </div>
</body>
</html>
  `;
}

// Background sync for failed requests (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-lyrics') {
    event.waitUntil(syncLyrics());
  }
});

async function syncLyrics() {
  // Placeholder for background sync logic
  console.log('[SW] Background sync triggered');
}
