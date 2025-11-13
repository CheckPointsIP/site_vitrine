/**
 * PLAN B CRM - Cookie Consent Manager
 * Gestion du consentement cookies conforme RGPD
 * Version: 1.0.0
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        cookieName: 'planb_cookie_consent',
        expiryDays: 365,
        privacyPolicyUrl: '/confidentialite.html'
    };

    class CookieConsent {
        constructor() {
            this.consent = this.loadConsent();
            this.init();
        }

        init() {
            // Si consentement déjà donné, ne rien afficher
            if (this.consent) {
                this.applyConsent(this.consent);
                return;
            }

            // Sinon, afficher le banner
            this.createBanner();
            this.createPreferencesModal();
            this.showBanner();
        }

        // === GESTION CONSENTEMENT ===
        loadConsent() {
            try {
                const stored = localStorage.getItem(CONFIG.cookieName);
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                console.error('Error loading consent:', e);
                return null;
            }
        }

        saveConsent(consent) {
            try {
                const data = {
                    ...consent,
                    timestamp: Date.now(),
                    version: '1.0'
                };
                localStorage.setItem(CONFIG.cookieName, JSON.stringify(data));
                this.consent = data;
                this.applyConsent(data);
            } catch (e) {
                console.error('Error saving consent:', e);
            }
        }

        applyConsent(consent) {
            // Appliquer les préférences de cookies
            if (consent.analytics) {
                this.enableAnalytics();
            } else {
                this.disableAnalytics();
            }

            if (consent.marketing) {
                this.enableMarketing();
            } else {
                this.disableMarketing();
            }

            // Les cookies fonctionnels sont toujours actifs
            console.log('Cookie consent applied:', consent);
        }

        enableAnalytics() {
            // Activer analytics-tracker.js si présent
            if (window.AnalyticsTracker) {
                console.log('Analytics enabled');
                // Le tracker est déjà chargé et actif
            }
        }

        disableAnalytics() {
            // Bloquer analytics
            console.log('Analytics disabled by user');

            // Option 1: Empêcher le chargement du script analytics-tracker.js
            // (nécessite de charger ce script après le consent)

            // Option 2: Désactiver l'envoi de données si tracker déjà chargé
            if (window.AnalyticsTracker) {
                // Désactiver l'envoi au serveur
                window.AnalyticsTracker.CONFIG = window.AnalyticsTracker.CONFIG || {};
                window.AnalyticsTracker.CONFIG.sendToServer = false;
            }
        }

        enableMarketing() {
            console.log('Marketing cookies enabled');
            // Activer pixels marketing, Google Ads, etc.
        }

        disableMarketing() {
            console.log('Marketing cookies disabled');
            // Bloquer pixels marketing
        }

        // === CRÉATION UI ===
        createBanner() {
            // Overlay
            const overlay = document.createElement('div');
            overlay.className = 'cookie-consent-overlay';
            overlay.id = 'cookieConsentOverlay';

            // Banner
            const banner = document.createElement('div');
            banner.className = 'cookie-consent-banner';
            banner.id = 'cookieConsentBanner';
            banner.innerHTML = `
                <div class="cookie-consent-container">
                    <div class="cookie-consent-header">
                        <span class="cookie-consent-icon">🍪</span>
                        <h2 class="cookie-consent-title">Respect de votre vie privée</h2>
                    </div>
                    <div class="cookie-consent-content">
                        <p class="cookie-consent-text">
                            Nous utilisons des cookies pour améliorer votre expérience sur notre site
                            et analyser le trafic.
                            Vous pouvez accepter tous les cookies, les refuser ou personnaliser vos préférences.
                            <br><br>
                            Pour plus d'informations, consultez notre
                            <a href="${CONFIG.privacyPolicyUrl}" target="_blank">politique de confidentialité</a>.
                        </p>
                        <div class="cookie-consent-actions">
                            <button class="cookie-consent-btn cookie-consent-btn-primary" id="acceptAllCookies">
                                Tout accepter
                            </button>
                            <button class="cookie-consent-btn cookie-consent-btn-secondary" id="rejectAllCookies">
                                Tout refuser
                            </button>
                            <button class="cookie-consent-btn cookie-consent-btn-text" id="customizeCookies">
                                Personnaliser
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            document.body.appendChild(banner);

            // Event listeners
            document.getElementById('acceptAllCookies').addEventListener('click', () => this.acceptAll());
            document.getElementById('rejectAllCookies').addEventListener('click', () => this.rejectAll());
            document.getElementById('customizeCookies').addEventListener('click', () => this.showPreferences());
        }

        createPreferencesModal() {
            const modal = document.createElement('div');
            modal.className = 'cookie-preferences-modal';
            modal.id = 'cookiePreferencesModal';
            modal.innerHTML = `
                <div class="cookie-preferences-header">
                    <h2>Préférences de cookies</h2>
                    <p class="cookie-consent-text">
                        Gérez vos préférences de cookies. Vous pouvez activer ou désactiver
                        différentes catégories de cookies selon vos besoins.
                    </p>
                </div>
                <div class="cookie-preferences-body">
                    <!-- Cookies essentiels (obligatoires) -->
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <h3 class="cookie-category-title">Cookies essentiels</h3>
                            <div>
                                <label class="cookie-toggle">
                                    <input type="checkbox" checked disabled id="essential-cookies">
                                    <span class="cookie-toggle-slider"></span>
                                </label>
                                <span class="cookie-toggle-label">Obligatoire</span>
                            </div>
                        </div>
                        <p class="cookie-category-description">
                            Ces cookies sont nécessaires au fonctionnement du site.
                            Ils permettent des fonctionnalités de base comme la navigation
                            et l'accès aux zones sécurisées. Le site ne peut pas fonctionner
                            correctement sans ces cookies.
                        </p>
                    </div>

                    <!-- Cookies analytics -->
                    <div class="cookie-category">
                        <div class="cookie-category-header">
                            <h3 class="cookie-category-title">Cookies d'analyse</h3>
                            <label class="cookie-toggle">
                                <input type="checkbox" id="analytics-cookies">
                                <span class="cookie-toggle-slider"></span>
                            </label>
                        </div>
                        <p class="cookie-category-description">
                            Ces cookies nous permettent de mesurer l'audience et d'analyser
                            la façon dont les visiteurs utilisent notre site. Ces informations
                            nous aident à améliorer votre expérience utilisateur.
                            <br><br>
                            <strong>Données collectées :</strong> pages visitées, durée de session,
                            clics, navigateur utilisé.
                        </p>
                    </div>
                </div>
                <div class="cookie-preferences-footer">
                    <button class="cookie-consent-btn cookie-consent-btn-secondary" id="cancelPreferences">
                        Annuler
                    </button>
                    <button class="cookie-consent-btn cookie-consent-btn-primary" id="savePreferences">
                        Enregistrer mes préférences
                    </button>
                </div>
            `;

            document.body.appendChild(modal);

            // Event listeners
            document.getElementById('cancelPreferences').addEventListener('click', () => this.hidePreferences());
            document.getElementById('savePreferences').addEventListener('click', () => this.savePreferences());
        }

        // === ACTIONS ===
        showBanner() {
            setTimeout(() => {
                document.getElementById('cookieConsentOverlay').classList.add('active');
                document.getElementById('cookieConsentBanner').classList.add('active');
            }, 500);
        }

        hideBanner() {
            document.getElementById('cookieConsentOverlay').classList.remove('active');
            document.getElementById('cookieConsentBanner').classList.remove('active');

            // Supprimer les éléments du DOM après l'animation
            setTimeout(() => {
                const overlay = document.getElementById('cookieConsentOverlay');
                const banner = document.getElementById('cookieConsentBanner');
                if (overlay) overlay.remove();
                if (banner) banner.remove();
            }, 300);
        }

        acceptAll() {
            this.saveConsent({
                essential: true,
                analytics: true,
                marketing: false
            });
            this.hideBanner();
        }

        rejectAll() {
            this.saveConsent({
                essential: true,
                analytics: false,
                marketing: false
            });
            this.hideBanner();
        }

        showPreferences() {
            document.getElementById('cookiePreferencesModal').classList.add('active');

            // Charger les préférences actuelles si elles existent
            if (this.consent) {
                document.getElementById('analytics-cookies').checked = this.consent.analytics || false;
            }
        }

        hidePreferences() {
            document.getElementById('cookiePreferencesModal').classList.remove('active');
        }

        savePreferences() {
            const analytics = document.getElementById('analytics-cookies').checked;

            this.saveConsent({
                essential: true,
                analytics: analytics,
                marketing: false
            });

            this.hidePreferences();
            this.hideBanner();
        }

        // === RÉOUVERTURE PARAMÈTRES ===
        reopenSettings() {
            // Recréer le modal si il n'existe pas
            if (!document.getElementById('cookiePreferencesModal')) {
                this.createPreferencesModal();
            }
            this.showPreferences();
        }

        // === MÉTHODES PUBLIQUES ===
        static getConsent() {
            try {
                const stored = localStorage.getItem(CONFIG.cookieName);
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                return null;
            }
        }

        static hasAnalyticsConsent() {
            const consent = CookieConsent.getConsent();
            return consent ? consent.analytics === true : false;
        }

        static hasMarketingConsent() {
            const consent = CookieConsent.getConsent();
            return consent ? consent.marketing === true : false;
        }
    }

    // Initialiser au chargement de la page
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.CookieConsent = new CookieConsent();
        });
    } else {
        window.CookieConsent = new CookieConsent();
    }

    // Exposer la classe globalement
    window.CookieConsentManager = CookieConsent;

})();
