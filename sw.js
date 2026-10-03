// ============================================
// THE OFFICE — Service Worker
// Cache-First with Network Update strategy
// ============================================

const CACHE_VERSION = 'theoffice-v2.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Files to pre-cache on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/reset.css',
  './css/layout.css',
  './css/office.css',
  './css/floor-world.css',
  './css/components.css',
  './css/animations.css',
  './js/bundle.js',
  './js/app.js',
  './js/store/state.js',
  './js/store/db.js',
  './js/ai/provider.js',
  './js/ai/gemini.js',
  './js/ai/openai.js',
  './js/ai/anthropic.js',
  './js/ai/grok.js',
  './js/ai/groq.js',
  './js/ai/openrouter.js',
  './js/ai/huggingface.js',
  './js/ai/router.js',
  './js/ai/prompts.js',
  './js/ai/queue.js',
  './js/engine/tick.js',
  './js/engine/company.js',
  './js/engine/employee.js',
  './js/engine/task.js',
  './js/engine/workflow.js',
  './js/engine/simulation.js',
  './js/engine/scrum.js',
  './js/engine/events.js',
  './js/screens/setup.js',
  './js/screens/hire.js',
  './js/screens/office.js',
  './js/screens/chat.js',
  './js/screens/tasks.js',
  './js/screens/dashboard.js',
  './js/components/bottom-nav.js',
  './js/components/modal.js',
  './js/components/toast.js',
  './js/components/floor.js',
  './js/components/employee-card.js',
  './js/components/message.js',
  './js/components/task-card.js',
  './js/utils/crypto.js',
  './js/utils/names.js',
  './js/utils/helpers.js',
  './assets/icons/logo.jpg',
  './assets/icons/icon-72x72.png',
  './assets/icons/icon-96x96.png',
  './assets/icons/icon-128x128.png',
  './assets/icons/icon-144x144.png',
  './assets/icons/icon-152x152.png',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-384x384.png',
  './assets/icons/icon-512x512.png',
  './assets/icons/icon-maskable-512x512.png'
];

// Install: Pre-cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Pre-caching app shell');
        return cache.addAll(PRECACHE_URLS).catch(err => {
          console.warn('[SW] Some resources failed to cache:', err);
          // Cache what we can, don't fail the install
          return Promise.allSettled(
            PRECACHE_URLS.map(url => cache.add(url).catch(() => null))
          );
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Notify all clients about the update
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'SW_UPDATED',
              version: CACHE_VERSION
            });
          });
        });
        return self.clients.claim();
      })
  );
});

// Fetch: Cache-first, then network update
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API calls (AI provider requests)
  const url = new URL(request.url);
  const apiDomains = [
    'generativelanguage.googleapis.com',
    'api.openai.com',
    'api.anthropic.com',
    'api.x.ai',
    'api.groq.com',
    'openrouter.ai',
    'api-inference.huggingface.co',
    'api.mistral.ai',
    'api.cerebras.ai',
    'api.cohere.com'
  ];
  if (apiDomains.some(domain => url.hostname.includes(domain))) return;

  // Skip chrome-extension and other non-http
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // Return cached version and update in background
        const fetchPromise = fetch(request)
          .then(networkResponse => {
            // Only cache valid responses
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Network failed, that's ok if we have cache
            return null;
          });

        // Return cached response immediately, or wait for network
        return cachedResponse || fetchPromise;
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});
