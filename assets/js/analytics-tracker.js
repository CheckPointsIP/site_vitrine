/**
 * PLAN B CRM - Analytics Tracker
 * Système de tracking complet pour toutes les interactions utilisateur
 * Version: 1.0.0
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        apiEndpoint: 'http://localhost:3000/api/analytics', // Backend Node.js
        localStorage: true, // Utiliser localStorage comme backup
        debugMode: true, // Mode debug pour console.log
        sessionTimeout: 30 * 60 * 1000, // 30 minutes
        sendToServer: true // Activer l'envoi au serveur
    };

    // Classe principale Analytics
    class AnalyticsTracker {
        constructor() {
            this.sessionId = this.getOrCreateSessionId();
            this.userId = this.getOrCreateUserId();
            this.pageLoadTime = Date.now();
            this.events = [];
            this.init();
        }

        init() {
            this.trackPageView();
            this.trackClicks();
            this.trackFormSubmissions();
            this.trackScrollDepth();
            this.trackTimeOnPage();
            this.trackTabSwitches();
            this.trackButtonClicks();
            this.trackLinkClicks();
            this.trackMouseMovement();
            this.trackDeviceInfo();

            // Envoyer les données avant de quitter
            window.addEventListener('beforeunload', () => {
                this.sendBeacon();
            });

            // Envoyer périodiquement
            setInterval(() => this.sendData(), 30000); // Toutes les 30 secondes
        }

        // === GESTION SESSION ET USER ===
        getOrCreateSessionId() {
            let sessionId = sessionStorage.getItem('analytics_session_id');
            if (!sessionId) {
                sessionId = this.generateId();
                sessionStorage.setItem('analytics_session_id', sessionId);
                sessionStorage.setItem('analytics_session_start', Date.now());
            }
            return sessionId;
        }

        getOrCreateUserId() {
            let userId = localStorage.getItem('analytics_user_id');
            if (!userId) {
                userId = this.generateId();
                localStorage.setItem('analytics_user_id', userId);
                localStorage.setItem('analytics_first_visit', Date.now());
            }
            return userId;
        }

        generateId() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        // === TRACKING PAGE VIEW ===
        trackPageView() {
            const pageData = {
                type: 'pageview',
                timestamp: Date.now(),
                sessionId: this.sessionId,
                userId: this.userId,
                page: {
                    url: window.location.href,
                    path: window.location.pathname,
                    title: document.title,
                    referrer: document.referrer,
                    queryParams: this.getQueryParams()
                },
                device: this.getDeviceInfo(),
                browser: this.getBrowserInfo(),
                screen: {
                    width: window.screen.width,
                    height: window.screen.height,
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight
                }
            };

            this.logEvent(pageData);
            this.saveToLocalStorage('pageviews', pageData);
        }

        // === TRACKING CLICS ===
        trackClicks() {
            document.addEventListener('click', (e) => {
                const target = e.target;
                const clickData = {
                    type: 'click',
                    timestamp: Date.now(),
                    sessionId: this.sessionId,
                    userId: this.userId,
                    element: {
                        tagName: target.tagName,
                        id: target.id || null,
                        className: target.className || null,
                        text: target.innerText?.substring(0, 100) || null,
                        href: target.href || null,
                        type: target.type || null
                    },
                    position: {
                        x: e.clientX,
                        y: e.clientY,
                        pageX: e.pageX,
                        pageY: e.pageY
                    },
                    page: window.location.pathname
                };

                this.logEvent(clickData);
                this.saveToLocalStorage('clicks', clickData);
            }, true);
        }

        // === TRACKING BOUTONS SPÉCIFIQUES ===
        trackButtonClicks() {
            const buttons = document.querySelectorAll('button, .btn, [role="button"]');
            buttons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const buttonData = {
                        type: 'button_click',
                        timestamp: Date.now(),
                        sessionId: this.sessionId,
                        userId: this.userId,
                        button: {
                            text: button.innerText?.trim(),
                            id: button.id,
                            classes: button.className,
                            type: button.type || 'button'
                        },
                        page: window.location.pathname
                    };

                    this.logEvent(buttonData);
                    this.saveToLocalStorage('button_clicks', buttonData);
                });
            });
        }

        // === TRACKING LIENS ===
        trackLinkClicks() {
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    const linkData = {
                        type: 'link_click',
                        timestamp: Date.now(),
                        sessionId: this.sessionId,
                        userId: this.userId,
                        link: {
                            href: link.href,
                            text: link.innerText?.trim(),
                            target: link.target,
                            isExternal: !link.href.includes(window.location.hostname)
                        },
                        page: window.location.pathname
                    };

                    this.logEvent(linkData);
                    this.saveToLocalStorage('link_clicks', linkData);
                });
            });
        }

        // === TRACKING FORMULAIRES ===
        trackFormSubmissions() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const formData = new FormData(form);
                    const data = {};

                    // Collecter les champs (sans les valeurs sensibles)
                    for (let [key, value] of formData.entries()) {
                        // Ne pas stocker les mots de passe
                        if (key.toLowerCase().includes('password')) {
                            data[key] = '[PROTECTED]';
                        } else if (key.toLowerCase().includes('email')) {
                            data[key] = value ? '[EMAIL PROVIDED]' : '[EMPTY]';
                        } else {
                            data[key] = value ? '[PROVIDED]' : '[EMPTY]';
                        }
                    }

                    const formSubmitData = {
                        type: 'form_submit',
                        timestamp: Date.now(),
                        sessionId: this.sessionId,
                        userId: this.userId,
                        form: {
                            id: form.id,
                            action: form.action,
                            method: form.method,
                            fields: data,
                            fieldCount: formData.entries().length
                        },
                        page: window.location.pathname
                    };

                    this.logEvent(formSubmitData);
                    this.saveToLocalStorage('form_submissions', formSubmitData);
                });

                // Tracking des champs de formulaire
                const inputs = form.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.addEventListener('focus', () => {
                        this.logEvent({
                            type: 'form_field_focus',
                            timestamp: Date.now(),
                            field: input.name || input.id,
                            page: window.location.pathname
                        });
                    });

                    input.addEventListener('blur', () => {
                        this.logEvent({
                            type: 'form_field_blur',
                            timestamp: Date.now(),
                            field: input.name || input.id,
                            hasValue: !!input.value,
                            page: window.location.pathname
                        });
                    });
                });
            });
        }

        // === TRACKING SCROLL DEPTH ===
        trackScrollDepth() {
            let maxScroll = 0;
            const milestones = [25, 50, 75, 100];
            const reached = new Set();

            const checkScroll = () => {
                const scrollPercentage = Math.round(
                    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                );

                if (scrollPercentage > maxScroll) {
                    maxScroll = scrollPercentage;
                }

                milestones.forEach(milestone => {
                    if (scrollPercentage >= milestone && !reached.has(milestone)) {
                        reached.add(milestone);
                        this.logEvent({
                            type: 'scroll_depth',
                            timestamp: Date.now(),
                            sessionId: this.sessionId,
                            userId: this.userId,
                            depth: milestone,
                            page: window.location.pathname
                        });
                        this.saveToLocalStorage('scroll_depth', {
                            depth: milestone,
                            timestamp: Date.now(),
                            page: window.location.pathname
                        });
                    }
                });
            };

            window.addEventListener('scroll', this.throttle(checkScroll, 500));
        }

        // === TRACKING TEMPS SUR PAGE ===
        trackTimeOnPage() {
            setInterval(() => {
                const timeOnPage = Math.floor((Date.now() - this.pageLoadTime) / 1000);

                this.logEvent({
                    type: 'time_on_page',
                    timestamp: Date.now(),
                    sessionId: this.sessionId,
                    userId: this.userId,
                    timeOnPage: timeOnPage,
                    page: window.location.pathname
                });

                // Sauvegarder toutes les 30 secondes
                if (timeOnPage % 30 === 0) {
                    this.saveToLocalStorage('time_on_page', {
                        timeOnPage: timeOnPage,
                        timestamp: Date.now(),
                        page: window.location.pathname
                    });
                }
            }, 1000);
        }

        // === TRACKING CHANGEMENTS D'ONGLETS ===
        trackTabSwitches() {
            if (typeof document.getElementById('tab-histoire') !== 'undefined') {
                // Pour index.html avec système d'onglets
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.target.classList.contains('active')) {
                            const tabName = mutation.target.id.replace('tab-', '');
                            this.logEvent({
                                type: 'tab_switch',
                                timestamp: Date.now(),
                                sessionId: this.sessionId,
                                userId: this.userId,
                                tab: tabName,
                                page: window.location.pathname
                            });
                            this.saveToLocalStorage('tab_switches', {
                                tab: tabName,
                                timestamp: Date.now()
                            });
                        }
                    });
                });

                const tabs = document.querySelectorAll('[id^="tab-"]');
                tabs.forEach(tab => {
                    observer.observe(tab, { attributes: true, attributeFilter: ['class'] });
                });
            }
        }

        // === TRACKING MOUVEMENT SOURIS (heatmap) ===
        trackMouseMovement() {
            let movements = [];
            let lastSave = Date.now();

            const saveMovements = () => {
                if (movements.length > 0) {
                    this.saveToLocalStorage('mouse_movements', {
                        timestamp: Date.now(),
                        page: window.location.pathname,
                        movements: movements.slice() // Clone
                    });
                    movements = [];
                }
            };

            window.addEventListener('mousemove', this.throttle((e) => {
                movements.push({
                    x: e.clientX,
                    y: e.clientY,
                    time: Date.now()
                });

                // Sauvegarder toutes les 10 secondes
                if (Date.now() - lastSave > 10000) {
                    saveMovements();
                    lastSave = Date.now();
                }

                // Limiter le nombre de points
                if (movements.length > 1000) {
                    saveMovements();
                }
            }, 100));

            // Sauvegarder avant de quitter
            window.addEventListener('beforeunload', saveMovements);
        }

        // === INFORMATIONS DEVICE ===
        getDeviceInfo() {
            const ua = navigator.userAgent;
            return {
                type: this.getDeviceType(),
                os: this.getOS(),
                browser: this.getBrowserInfo().name,
                language: navigator.language,
                online: navigator.onLine,
                cookiesEnabled: navigator.cookieEnabled,
                doNotTrack: navigator.doNotTrack === '1',
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        }

        getDeviceType() {
            const ua = navigator.userAgent;
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                return 'tablet';
            }
            if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
                return 'mobile';
            }
            return 'desktop';
        }

        getOS() {
            const ua = navigator.userAgent;
            if (ua.indexOf('Win') !== -1) return 'Windows';
            if (ua.indexOf('Mac') !== -1) return 'MacOS';
            if (ua.indexOf('Linux') !== -1) return 'Linux';
            if (ua.indexOf('Android') !== -1) return 'Android';
            if (ua.indexOf('iOS') !== -1) return 'iOS';
            return 'Unknown';
        }

        getBrowserInfo() {
            const ua = navigator.userAgent;
            let name = 'Unknown';
            let version = 'Unknown';

            if (ua.indexOf('Firefox') > -1) {
                name = 'Firefox';
                version = ua.match(/Firefox\/(\d+\.\d+)/)?.[1];
            } else if (ua.indexOf('Chrome') > -1) {
                name = 'Chrome';
                version = ua.match(/Chrome\/(\d+\.\d+)/)?.[1];
            } else if (ua.indexOf('Safari') > -1) {
                name = 'Safari';
                version = ua.match(/Version\/(\d+\.\d+)/)?.[1];
            } else if (ua.indexOf('Edge') > -1) {
                name = 'Edge';
                version = ua.match(/Edge\/(\d+\.\d+)/)?.[1];
            }

            return { name, version };
        }

        trackDeviceInfo() {
            const deviceData = {
                type: 'device_info',
                timestamp: Date.now(),
                sessionId: this.sessionId,
                userId: this.userId,
                device: this.getDeviceInfo(),
                performance: {
                    memory: performance.memory ? {
                        usedJSHeapSize: performance.memory.usedJSHeapSize,
                        totalJSHeapSize: performance.memory.totalJSHeapSize
                    } : null,
                    connection: navigator.connection ? {
                        effectiveType: navigator.connection.effectiveType,
                        downlink: navigator.connection.downlink
                    } : null
                }
            };

            this.saveToLocalStorage('device_info', deviceData);
        }

        // === UTILITIES ===
        getQueryParams() {
            const params = {};
            const urlParams = new URLSearchParams(window.location.search);
            for (const [key, value] of urlParams) {
                params[key] = value;
            }
            return params;
        }

        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }

        // === STORAGE ===
        saveToLocalStorage(key, data) {
            if (!CONFIG.localStorage) return;

            try {
                const storageKey = `analytics_${key}`;
                let stored = JSON.parse(localStorage.getItem(storageKey) || '[]');

                // Limiter à 1000 entrées par type
                if (stored.length >= 1000) {
                    stored = stored.slice(-900); // Garder les 900 plus récentes
                }

                stored.push(data);
                localStorage.setItem(storageKey, JSON.stringify(stored));
            } catch (e) {
                console.error('LocalStorage error:', e);
            }
        }

        logEvent(event) {
            if (CONFIG.debugMode) {
                console.log('[Analytics]', event.type, event);
            }
            this.events.push(event);
        }

        // === ENVOI DES DONNÉES ===
        sendData() {
            if (this.events.length === 0) return;

            const payload = {
                events: this.events.slice(),
                sessionId: this.sessionId,
                userId: this.userId,
                timestamp: Date.now()
            };

            // Sauvegarder localement (backup)
            this.saveToLocalStorage('batches', payload);

            // Envoyer à l'API si activé
            if (CONFIG.sendToServer && CONFIG.apiEndpoint) {
                fetch(CONFIG.apiEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (CONFIG.debugMode) {
                        console.log('[Analytics] Data sent successfully:', data);
                    }
                })
                .catch(err => {
                    console.error('[Analytics] API error:', err);
                    console.log('[Analytics] Data saved to localStorage as fallback');
                });
            }

            // Vider les événements
            this.events = [];
        }

        sendBeacon() {
            if (this.events.length === 0) return;

            const payload = JSON.stringify({
                events: this.events,
                sessionId: this.sessionId,
                userId: this.userId,
                timestamp: Date.now()
            });

            // Utiliser sendBeacon pour garantir l'envoi avant fermeture page
            if (CONFIG.sendToServer && navigator.sendBeacon && CONFIG.apiEndpoint) {
                const blob = new Blob([payload], { type: 'application/json' });
                navigator.sendBeacon(CONFIG.apiEndpoint, blob);
            }

            // Sauvegarder localement de toute façon (backup)
            this.saveToLocalStorage('batches', JSON.parse(payload));
        }
    }

    // === FONCTIONS PUBLIQUES POUR ANALYTICS ADMIN ===
    window.PlanBAnalytics = {
        // Récupérer toutes les données
        getAllData: function() {
            const data = {};
            const keys = [
                'pageviews', 'clicks', 'button_clicks', 'link_clicks',
                'form_submissions', 'scroll_depth', 'time_on_page',
                'tab_switches', 'mouse_movements', 'device_info', 'batches'
            ];

            keys.forEach(key => {
                const storageKey = `analytics_${key}`;
                data[key] = JSON.parse(localStorage.getItem(storageKey) || '[]');
            });

            return data;
        },

        // Récupérer données par type
        getData: function(type) {
            const storageKey = `analytics_${type}`;
            return JSON.parse(localStorage.getItem(storageKey) || '[]');
        },

        // Nettoyer toutes les données
        clearAll: function() {
            const keys = [
                'pageviews', 'clicks', 'button_clicks', 'link_clicks',
                'form_submissions', 'scroll_depth', 'time_on_page',
                'tab_switches', 'mouse_movements', 'device_info', 'batches'
            ];

            keys.forEach(key => {
                localStorage.removeItem(`analytics_${key}`);
            });

            console.log('Analytics data cleared');
        },

        // Exporter en JSON
        exportJSON: function() {
            const data = this.getAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-export-${Date.now()}.json`;
            a.click();
        },

        // Exporter en CSV
        exportCSV: function(type = 'pageviews') {
            const data = this.getData(type);
            if (data.length === 0) {
                console.warn('No data to export');
                return;
            }

            // Convertir en CSV
            const headers = Object.keys(data[0]);
            let csv = headers.join(',') + '\n';

            data.forEach(row => {
                const values = headers.map(header => {
                    const val = row[header];
                    return typeof val === 'object' ? JSON.stringify(val) : val;
                });
                csv += values.join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${type}-${Date.now()}.csv`;
            a.click();
        },

        // Stats rapides
        getStats: function() {
            const allData = this.getAllData();
            return {
                totalPageviews: allData.pageviews.length,
                totalClicks: allData.clicks.length,
                totalButtonClicks: allData.button_clicks.length,
                totalLinkClicks: allData.link_clicks.length,
                totalFormSubmissions: allData.form_submissions.length,
                uniqueUsers: new Set(allData.pageviews.map(p => p.userId)).size,
                uniqueSessions: new Set(allData.pageviews.map(p => p.sessionId)).size
            };
        }
    };

    // Initialiser le tracker automatiquement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.analyticsTracker = new AnalyticsTracker();
        });
    } else {
        window.analyticsTracker = new AnalyticsTracker();
    }

})();
