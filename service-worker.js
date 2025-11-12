/**
 * PLAN B CRM - Service Worker
 * Cache offline et optimisation des performances
 * Version: 1.0.0
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `planb-crm-${CACHE_VERSION}`;

// Fichiers à mettre en cache immédiatement (cache statique)
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/decouvrir.html',
  '/demo.html',
  '/contact.html',
  '/pricing-monolithe.html',
  '/dist/styles.min.css',
  '/dist/script.min.js',
  '/dist/analytics-tracker.min.js',
  // Fallback vers les versions non minifiées
  '/styles.css',
  '/script.js',
  '/analytics-tracker.js'
];

// Stratégies de cache
const CACHE_STRATEGIES = {
  // Cache First: Chercher d'abord dans le cache (assets statiques)
  CACHE_FIRST: 'cache-first',
  // Network First: Chercher d'abord sur le réseau (API, contenu dynamique)
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate: Servir du cache + mettre à jour en arrière-plan
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Configuration des stratégies par type de ressource
const RESOURCE_STRATEGIES = {
  // Assets statiques - Cache First
  css: CACHE_STRATEGIES.CACHE_FIRST,
  js: CACHE_STRATEGIES.CACHE_FIRST,
  fonts: CACHE_STRATEGIES.CACHE_FIRST,
  images: CACHE_STRATEGIES.CACHE_FIRST,

  // HTML - Stale While Revalidate
  html: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,

  // API - Network First
  api: CACHE_STRATEGIES.NETWORK_FIRST
};

// Durées de cache
const CACHE_EXPIRATION = {
  static: 30 * 24 * 60 * 60 * 1000, // 30 jours
  dynamic: 7 * 24 * 60 * 60 * 1000, // 7 jours
  api: 5 * 60 * 1000 // 5 minutes
};

// ========================================
// INSTALLATION
// ========================================
self.addEventListener('install', event => {
  console.log('[SW] Installation en cours...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Mise en cache des fichiers statiques');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Installation terminée');
        return self.skipWaiting(); // Activer immédiatement
      })
      .catch(error => {
        console.error('[SW] Erreur lors de l\'installation:', error);
      })
  );
});

// ========================================
// ACTIVATION
// ========================================
self.addEventListener('activate', event => {
  console.log('[SW] Activation en cours...');

  event.waitUntil(
    // Supprimer les anciens caches
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Suppression de l\'ancien cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation terminée');
        return self.clients.claim(); // Prendre le contrôle immédiatement
      })
  );
});

// ========================================
// FETCH - Interception des requêtes
// ========================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorer les requêtes non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorer les requêtes vers des domaines externes
  if (url.origin !== location.origin) {
    return;
  }

  // Déterminer la stratégie en fonction du type de ressource
  const strategy = getStrategyForRequest(request);

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      event.respondWith(cacheFirst(request));
      break;

    case CACHE_STRATEGIES.NETWORK_FIRST:
      event.respondWith(networkFirst(request));
      break;

    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      event.respondWith(staleWhileRevalidate(request));
      break;

    default:
      event.respondWith(fetch(request));
  }
});

// ========================================
// STRATÉGIES DE CACHE
// ========================================

/**
 * Cache First: Chercher d'abord dans le cache
 * Bon pour: CSS, JS, images, fonts (assets statiques)
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Vérifier si le cache est expiré
    const cacheTime = await getCacheTime(request);
    const now = Date.now();

    if (cacheTime && (now - cacheTime) < CACHE_EXPIRATION.static) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Mettre en cache la nouvelle réponse
      cache.put(request, networkResponse.clone());
      await setCacheTime(request);
      console.log('[SW] Mise en cache:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Erreur réseau, utilisation du cache:', error);
    return cachedResponse || createErrorResponse();
  }
}

/**
 * Network First: Chercher d'abord sur le réseau
 * Bon pour: API, données dynamiques
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      await setCacheTime(request);
      console.log('[SW] Réponse réseau + cache:', request.url);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Réseau indisponible, utilisation du cache:', request.url);
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    return cachedResponse || createErrorResponse();
  }
}

/**
 * Stale While Revalidate: Servir du cache + mettre à jour en arrière-plan
 * Bon pour: HTML, contenu qui peut être légèrement obsolète
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Mettre à jour en arrière-plan
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        setCacheTime(request);
      }
      return networkResponse;
    })
    .catch(error => {
      console.error('[SW] Erreur lors de la mise à jour:', error);
    });

  // Retourner immédiatement le cache ou attendre le réseau
  return cachedResponse || fetchPromise;
}

// ========================================
// UTILITAIRES
// ========================================

/**
 * Déterminer la stratégie de cache pour une requête
 */
function getStrategyForRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Routes API
  if (pathname.startsWith('/api/')) {
    return RESOURCE_STRATEGIES.api;
  }

  // Fichiers HTML
  if (pathname.endsWith('.html') || pathname === '/') {
    return RESOURCE_STRATEGIES.html;
  }

  // CSS
  if (pathname.endsWith('.css')) {
    return RESOURCE_STRATEGIES.css;
  }

  // JavaScript
  if (pathname.endsWith('.js')) {
    return RESOURCE_STRATEGIES.js;
  }

  // Images
  if (pathname.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/)) {
    return RESOURCE_STRATEGIES.images;
  }

  // Fonts
  if (pathname.match(/\.(woff|woff2|ttf|eot)$/)) {
    return RESOURCE_STRATEGIES.fonts;
  }

  // Par défaut: Network First
  return CACHE_STRATEGIES.NETWORK_FIRST;
}

/**
 * Créer une réponse d'erreur
 */
function createErrorResponse() {
  return new Response(
    JSON.stringify({
      error: 'Offline',
      message: 'Vous êtes actuellement hors ligne'
    }),
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }
  );
}

/**
 * Stocker le temps de mise en cache
 */
async function setCacheTime(request) {
  const cache = await caches.open(`${CACHE_NAME}-metadata`);
  const metadataResponse = new Response(JSON.stringify({
    cachedAt: Date.now()
  }));
  await cache.put(request.url + '-metadata', metadataResponse);
}

/**
 * Récupérer le temps de mise en cache
 */
async function getCacheTime(request) {
  const cache = await caches.open(`${CACHE_NAME}-metadata`);
  const metadataResponse = await cache.match(request.url + '-metadata');

  if (metadataResponse) {
    const metadata = await metadataResponse.json();
    return metadata.cachedAt;
  }

  return null;
}

// ========================================
// MESSAGES DU CLIENT
// ========================================
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls;
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urls))
    );
  }
});

console.log('[SW] Service Worker chargé');
