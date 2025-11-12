/**
 * PLAN B CRM - Service Worker Registration
 * Enregistrement et gestion du Service Worker
 * Version: 1.0.0
 *
 * UTILISATION:
 * Ajoutez cette ligne avant la balise </body> de vos pages HTML:
 * <script src="sw-register.js"></script>
 */

(function() {
  'use strict';

  // Vérifier le support du Service Worker
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Worker non supporté par ce navigateur');
    return;
  }

  // Configuration
  const SW_PATH = '/service-worker.js';
  const SW_SCOPE = '/';

  // Utilitaires de log
  const log = {
    info: (msg) => console.log('%c[SW] ' + msg, 'color: #2196F3'),
    success: (msg) => console.log('%c[SW] ' + msg, 'color: #4CAF50'),
    error: (msg) => console.error('%c[SW] ' + msg, 'color: #f44336'),
    warn: (msg) => console.warn('%c[SW] ' + msg, 'color: #FF9800')
  };

  /**
   * Enregistrer le Service Worker
   */
  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register(SW_PATH, {
        scope: SW_SCOPE
      });

      log.success('Service Worker enregistré avec succès');
      log.info(`Scope: ${registration.scope}`);

      // Gérer les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        log.info('Nouvelle version du Service Worker détectée');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nouveau Service Worker installé, demander à l'utilisateur de recharger
            showUpdateNotification();
          }
        });
      });

      // Vérifier les mises à jour toutes les heures
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      return registration;
    } catch (error) {
      log.error('Échec de l\'enregistrement: ' + error.message);
      throw error;
    }
  }

  /**
   * Afficher une notification de mise à jour
   */
  function showUpdateNotification() {
    log.warn('Une nouvelle version est disponible');

    // Créer une notification visuelle (optionnel)
    const shouldReload = confirm(
      'Une nouvelle version de l\'application est disponible. Recharger maintenant ?'
    );

    if (shouldReload) {
      window.location.reload();
    }
  }

  /**
   * Vérifier le statut du Service Worker
   */
  function checkServiceWorkerStatus() {
    navigator.serviceWorker.ready.then(registration => {
      log.success('Service Worker actif et prêt');

      // Exposer les méthodes utiles sur window
      window.serviceWorker = {
        /**
         * Forcer la mise à jour du Service Worker
         */
        update: () => {
          log.info('Vérification des mises à jour...');
          return registration.update();
        },

        /**
         * Désinstaller le Service Worker
         */
        unregister: () => {
          log.info('Désinstallation du Service Worker...');
          return registration.unregister().then(success => {
            if (success) {
              log.success('Service Worker désinstallé');
              window.location.reload();
            }
          });
        },

        /**
         * Mettre en cache des URLs supplémentaires
         */
        cacheUrls: (urls) => {
          if (!registration.active) {
            log.error('Service Worker pas encore actif');
            return;
          }

          registration.active.postMessage({
            type: 'CACHE_URLS',
            urls: urls
          });

          log.info(`${urls.length} URL(s) ajoutée(s) au cache`);
        },

        /**
         * Obtenir les informations du Service Worker
         */
        getInfo: async () => {
          const cacheNames = await caches.keys();
          const cacheInfo = {};

          for (const cacheName of cacheNames) {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            cacheInfo[cacheName] = {
              name: cacheName,
              entries: keys.length,
              urls: keys.map(req => req.url)
            };
          }

          return {
            registration: {
              scope: registration.scope,
              updateViaCache: registration.updateViaCache,
              active: !!registration.active,
              installing: !!registration.installing,
              waiting: !!registration.waiting
            },
            caches: cacheInfo
          };
        },

        /**
         * Nettoyer tous les caches
         */
        clearCache: async () => {
          log.info('Nettoyage des caches...');
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
          log.success('Tous les caches supprimés');
          window.location.reload();
        }
      };

      // Afficher les commandes disponibles en mode debug
      if (sessionStorage.getItem('sw-debug') === 'true') {
        console.group('[SW] Commandes disponibles');
        console.log('window.serviceWorker.update()     - Vérifier les mises à jour');
        console.log('window.serviceWorker.unregister() - Désinstaller le SW');
        console.log('window.serviceWorker.getInfo()    - Infos détaillées');
        console.log('window.serviceWorker.clearCache() - Nettoyer les caches');
        console.log('window.serviceWorker.cacheUrls([urls]) - Ajouter des URLs au cache');
        console.groupEnd();
      }
    });
  }

  /**
   * Gérer les messages du Service Worker
   */
  function setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', event => {
      const { data } = event;

      if (data && data.type === 'CACHE_UPDATED') {
        log.info('Cache mis à jour pour: ' + data.url);
      }

      if (data && data.type === 'OFFLINE') {
        log.warn('Application en mode hors ligne');
      }
    });
  }

  /**
   * Gérer la connexion/déconnexion
   */
  function setupOnlineOfflineHandlers() {
    window.addEventListener('online', () => {
      log.success('Connexion rétablie');
    });

    window.addEventListener('offline', () => {
      log.warn('Hors ligne - Utilisation du cache');
    });

    // Log l'état initial
    if (!navigator.onLine) {
      log.warn('Démarrage en mode hors ligne');
    }
  }

  /**
   * Initialisation
   */
  async function init() {
    try {
      await registerServiceWorker();
      checkServiceWorkerStatus();
      setupMessageListener();
      setupOnlineOfflineHandlers();

      log.success('Initialisation terminée');
    } catch (error) {
      log.error('Erreur lors de l\'initialisation: ' + error.message);
    }
  }

  // Lancer l'initialisation quand le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Activer le mode debug avec: sessionStorage.setItem('sw-debug', 'true')
  // Désactiver avec: sessionStorage.removeItem('sw-debug')

})();
