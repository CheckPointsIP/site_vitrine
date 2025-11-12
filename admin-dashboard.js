/**
 * PLAN B CRM - Admin Dashboard (SECURED)
 * Interface complète pour visualiser les analytics
 * Version: 2.0.0 - JWT Authentication
 */

(function() {
    'use strict';

    // Configuration API
    const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
        ? 'http://localhost:3000'
        : window.location.origin;

    // État global
    let currentSection = 'overview';
    let dateFilter = '7days';
    let charts = {};
    let tokenRefreshInterval = null;

    // === AUTHENTIFICATION JWT ===
    class AuthManager {
        constructor() {
            this.authenticated = false;
            this.username = null;
            this.init();
        }

        init() {
            const loginForm = document.getElementById('loginForm');
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));

            // Vérifier si déjà connecté (via cookie httpOnly)
            this.checkAuthentication();
        }

        async checkAuthentication() {
            try {
                const response = await fetch(`${API_BASE}/api/auth/verify`, {
                    method: 'GET',
                    credentials: 'include' // Important pour envoyer les cookies
                });

                if (response.ok) {
                    const data = await response.json();
                    this.authenticated = true;
                    this.username = data.username;
                    this.showDashboard();
                    this.startTokenRefresh(data.expiresIn);
                } else {
                    // Pas authentifié, rester sur l'écran de login
                    this.authenticated = false;
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                this.authenticated = false;
            }
        }

        async handleLogin(e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorMessage = document.getElementById('errorMessage');
            const loginBtn = e.target.querySelector('button[type="submit"]');

            // Désactiver le bouton pendant la requête
            loginBtn.disabled = true;
            loginBtn.textContent = 'Connexion...';

            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include', // Important pour recevoir les cookies httpOnly
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Succès
                    this.authenticated = true;
                    this.username = username;
                    this.showDashboard();
                    this.startTokenRefresh(data.expiresIn);
                } else {
                    // Erreur
                    errorMessage.textContent = data.message || 'Identifiants incorrects';
                    errorMessage.style.display = 'block';
                    setTimeout(() => {
                        errorMessage.style.display = 'none';
                    }, 5000);
                }
            } catch (error) {
                console.error('Login error:', error);
                errorMessage.textContent = 'Erreur de connexion. Vérifiez que le serveur est démarré.';
                errorMessage.style.display = 'block';
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 5000);
            } finally {
                loginBtn.disabled = false;
                loginBtn.textContent = 'Se connecter';
            }
        }

        /**
         * Rafraîchir automatiquement le token avant expiration
         * @param {number} expiresIn - Secondes avant expiration
         */
        startTokenRefresh(expiresIn) {
            // Rafraîchir 5 minutes avant l'expiration
            const refreshTime = (expiresIn - 300) * 1000;

            if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
            }

            tokenRefreshInterval = setInterval(async () => {
                await this.refreshToken();
            }, refreshTime);
        }

        async refreshToken() {
            try {
                const response = await fetch(`${API_BASE}/api/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    this.startTokenRefresh(data.expiresIn);
                    console.log('Token refreshed successfully');
                } else {
                    // Échec du refresh, déconnecter
                    this.handleAuthError();
                }
            } catch (error) {
                console.error('Token refresh error:', error);
                this.handleAuthError();
            }
        }

        async logout() {
            try {
                await fetch(`${API_BASE}/api/auth/logout`, {
                    method: 'POST',
                    credentials: 'include'
                });
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                if (tokenRefreshInterval) {
                    clearInterval(tokenRefreshInterval);
                }
                this.authenticated = false;
                this.username = null;
                location.reload();
            }
        }

        /**
         * Gérer les erreurs d'authentification (token expiré, etc.)
         */
        handleAuthError() {
            if (tokenRefreshInterval) {
                clearInterval(tokenRefreshInterval);
            }
            this.authenticated = false;
            this.username = null;

            // Afficher message et rediriger vers login
            alert('Votre session a expiré. Veuillez vous reconnecter.');
            location.reload();
        }

        isAuthenticated() {
            return this.authenticated;
        }

        showDashboard() {
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('dashboard').classList.add('active');

            // Afficher le nom d'utilisateur dans l'interface
            const usernameDisplay = document.querySelector('.username-display');
            if (usernameDisplay && this.username) {
                usernameDisplay.textContent = this.username;
            }

            dashboardManager.init();
        }
    }

    /**
     * Wrapper fetch avec gestion automatique des erreurs 401
     */
    async function authenticatedFetch(url, options = {}) {
        options.credentials = 'include'; // Toujours inclure les cookies

        try {
            const response = await fetch(url, options);

            // Si 401, token expiré ou invalide
            if (response.status === 401) {
                authManager.handleAuthError();
                throw new Error('Unauthorized');
            }

            return response;
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                console.error('Fetch error:', error);
            }
            throw error;
        }
    }

    // === GESTIONNAIRE DASHBOARD ===
    class DashboardManager {
        constructor() {
            this.data = null;
        }

        async init() {
            await this.loadData();
            this.setupNavigation();
            this.setupEventListeners();
            this.renderSection('overview');
        }

        async loadData() {
            try {
                // Essayer de charger depuis le serveur d'abord
                const response = await authenticatedFetch(`${API_BASE}/api/analytics/export/json`);

                if (response.ok) {
                    this.data = await response.json();
                    console.log('[Dashboard] Data loaded from server:', this.data);
                    return;
                }
            } catch (error) {
                console.warn('[Dashboard] Server unavailable, using localStorage:', error);
            }

            // Fallback : charger depuis localStorage
            this.data = window.PlanBAnalytics.getAllData();
            console.log('[Dashboard] Data loaded from localStorage:', this.data);
        }

        setupNavigation() {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => {
                    // Retirer active de tous
                    navItems.forEach(nav => nav.classList.remove('active'));
                    // Ajouter active
                    item.classList.add('active');
                    // Changer section
                    const section = item.dataset.section;
                    this.renderSection(section);
                });
            });
        }

        setupEventListeners() {
            // Bouton refresh
            document.getElementById('refreshBtn').addEventListener('click', () => {
                this.refresh();
            });

            // Bouton logout
            document.getElementById('logoutBtn').addEventListener('click', () => {
                authManager.logout();
            });

            // Date range
            document.getElementById('dateRange').addEventListener('change', (e) => {
                dateFilter = e.target.value;
                this.renderSection(currentSection);
            });

            // Mobile menu
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            const sidebar = document.getElementById('sidebar');
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
        }

        async refresh() {
            const btn = document.getElementById('refreshBtn');
            const icon = btn.querySelector('i');
            icon.classList.add('fa-spin');

            await this.loadData();
            this.renderSection(currentSection);

            setTimeout(() => {
                icon.classList.remove('fa-spin');
            }, 1000);
        }

        renderSection(section) {
            currentSection = section;
            const contentArea = document.getElementById('contentArea');
            const pageTitle = document.getElementById('pageTitle');

            const titles = {
                overview: 'Vue d\'ensemble',
                pages: 'Analyse par Page',
                clicks: 'Clics & Interactions',
                forms: 'Formulaires',
                users: 'Utilisateurs',
                activity: 'Activité en temps réel',
                export: 'Exporter les données'
            };

            pageTitle.textContent = titles[section];

            // Render le contenu selon la section
            switch(section) {
                case 'overview':
                    contentArea.innerHTML = this.renderOverview();
                    break;
                case 'pages':
                    contentArea.innerHTML = this.renderPages();
                    break;
                case 'clicks':
                    contentArea.innerHTML = this.renderClicks();
                    break;
                case 'forms':
                    contentArea.innerHTML = this.renderForms();
                    break;
                case 'users':
                    contentArea.innerHTML = this.renderUsers();
                    break;
                case 'activity':
                    contentArea.innerHTML = this.renderActivity();
                    break;
                case 'export':
                    contentArea.innerHTML = this.renderExport();
                    break;
            }

            // Initialiser les graphiques après render
            setTimeout(() => this.initCharts(section), 100);
        }

        // === FILTRAGE PAR DATE ===
        filterByDate(data) {
            if (!dateFilter || dateFilter === 'all') return data;

            const now = Date.now();
            const filters = {
                'today': 24 * 60 * 60 * 1000,
                'yesterday': 48 * 60 * 60 * 1000,
                '7days': 7 * 24 * 60 * 60 * 1000,
                '30days': 30 * 24 * 60 * 60 * 1000
            };

            const timeLimit = filters[dateFilter];
            if (!timeLimit) return data;

            return data.filter(item => {
                const itemTime = item.timestamp;
                if (dateFilter === 'yesterday') {
                    return itemTime > (now - 48 * 60 * 60 * 1000) && itemTime < (now - 24 * 60 * 60 * 1000);
                }
                return (now - itemTime) < timeLimit;
            });
        }

        // === RENDER OVERVIEW ===
        renderOverview() {
            const pageviews = this.filterByDate(this.data.pageviews);
            const clicks = this.filterByDate(this.data.clicks);
            const buttonClicks = this.filterByDate(this.data.button_clicks);
            const formSubmissions = this.filterByDate(this.data.form_submissions);

            const uniqueUsers = new Set(pageviews.map(p => p.userId)).size;
            const uniqueSessions = new Set(pageviews.map(p => p.sessionId)).size;

            // Calculer taux de rebond (sessions avec 1 seule pageview)
            const sessionPageviews = {};
            pageviews.forEach(pv => {
                sessionPageviews[pv.sessionId] = (sessionPageviews[pv.sessionId] || 0) + 1;
            });
            const bouncedSessions = Object.values(sessionPageviews).filter(count => count === 1).length;
            const bounceRate = uniqueSessions > 0 ? ((bouncedSessions / uniqueSessions) * 100).toFixed(1) : 0;

            // Temps moyen sur page
            const timeData = this.filterByDate(this.data.time_on_page);
            const avgTime = timeData.length > 0
                ? Math.floor(timeData.reduce((sum, t) => sum + t.timeOnPage, 0) / timeData.length)
                : 0;

            return `
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Visiteurs Uniques</span>
                            <div class="stat-icon blue">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                        <div class="stat-value">${uniqueUsers}</div>
                        <div class="stat-change positive">
                            <i class="fas fa-arrow-up"></i>
                            Sessions: ${uniqueSessions}
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Pages Vues</span>
                            <div class="stat-icon green">
                                <i class="fas fa-eye"></i>
                            </div>
                        </div>
                        <div class="stat-value">${pageviews.length}</div>
                        <div class="stat-change positive">
                            <i class="fas fa-arrow-up"></i>
                            ${(pageviews.length / Math.max(uniqueUsers, 1)).toFixed(1)} par utilisateur
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Interactions Totales</span>
                            <div class="stat-icon orange">
                                <i class="fas fa-mouse-pointer"></i>
                            </div>
                        </div>
                        <div class="stat-value">${clicks.length + buttonClicks.length}</div>
                        <div class="stat-change">
                            <i class="fas fa-info-circle"></i>
                            ${buttonClicks.length} clics sur boutons
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Formulaires Soumis</span>
                            <div class="stat-icon red">
                                <i class="fas fa-paper-plane"></i>
                            </div>
                        </div>
                        <div class="stat-value">${formSubmissions.length}</div>
                        <div class="stat-change ${formSubmissions.length > 0 ? 'positive' : ''}">
                            <i class="fas fa-${formSubmissions.length > 0 ? 'check' : 'info'}-circle"></i>
                            ${formSubmissions.length > 0 ? 'Conversions actives' : 'Aucune soumission'}
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Taux de Rebond</span>
                            <div class="stat-icon ${bounceRate < 50 ? 'green' : 'orange'}">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                        <div class="stat-value">${bounceRate}%</div>
                        <div class="stat-change ${bounceRate < 50 ? 'positive' : 'negative'}">
                            <i class="fas fa-${bounceRate < 50 ? 'check' : 'exclamation'}-circle"></i>
                            ${bounceRate < 50 ? 'Excellent' : 'À améliorer'}
                        </div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Temps Moyen sur Page</span>
                            <div class="stat-icon blue">
                                <i class="fas fa-clock"></i>
                            </div>
                        </div>
                        <div class="stat-value">${Math.floor(avgTime / 60)}:${(avgTime % 60).toString().padStart(2, '0')}</div>
                        <div class="stat-change">
                            <i class="fas fa-info-circle"></i>
                            ${avgTime} secondes
                        </div>
                    </div>
                </div>

                <!-- Charts -->
                <div class="charts-grid">
                    <div class="chart-card">
                        <h3>Visiteurs par Jour</h3>
                        <div class="chart-container">
                            <canvas id="visitorsChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Pages les Plus Visitées</h3>
                        <div class="chart-container">
                            <canvas id="pagesChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Types d'Appareils</h3>
                        <div class="chart-container">
                            <canvas id="devicesChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Navigateurs Utilisés</h3>
                        <div class="chart-container">
                            <canvas id="browsersChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Top Pages Table -->
                <div class="table-card">
                    <h3>Top 10 Pages par Vues</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Vues</th>
                                <th>Visiteurs Uniques</th>
                                <th>Temps Moyen</th>
                                <th>Engagement</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getTopPages(pageviews, 10)}
                        </tbody>
                    </table>
                </div>
            `;
        }

        getTopPages(pageviews, limit = 10) {
            const pageStats = {};

            pageviews.forEach(pv => {
                const path = pv.page.path;
                if (!pageStats[path]) {
                    pageStats[path] = {
                        views: 0,
                        users: new Set(),
                        totalTime: 0,
                        timeCount: 0
                    };
                }
                pageStats[path].views++;
                pageStats[path].users.add(pv.userId);
            });

            // Ajouter temps moyen
            const timeData = this.filterByDate(this.data.time_on_page);
            timeData.forEach(t => {
                if (pageStats[t.page]) {
                    pageStats[t.page].totalTime += t.timeOnPage;
                    pageStats[t.page].timeCount++;
                }
            });

            // Convertir en array et trier
            const sorted = Object.entries(pageStats)
                .map(([path, stats]) => ({
                    path,
                    views: stats.views,
                    users: stats.users.size,
                    avgTime: stats.timeCount > 0 ? Math.floor(stats.totalTime / stats.timeCount) : 0
                }))
                .sort((a, b) => b.views - a.views)
                .slice(0, limit);

            return sorted.map(page => {
                const engagement = page.avgTime > 30 ? 'high' : page.avgTime > 10 ? 'medium' : 'low';
                const engagementText = page.avgTime > 30 ? 'Élevé' : page.avgTime > 10 ? 'Moyen' : 'Faible';

                return `
                    <tr>
                        <td><strong>${page.path}</strong></td>
                        <td>${page.views}</td>
                        <td>${page.users}</td>
                        <td>${Math.floor(page.avgTime / 60)}:${(page.avgTime % 60).toString().padStart(2, '0')}</td>
                        <td><span class="badge ${engagement}">${engagementText}</span></td>
                    </tr>
                `;
            }).join('');
        }

        // === RENDER PAGES ===
        renderPages() {
            const pageviews = this.filterByDate(this.data.pageviews);
            const scrollData = this.filterByDate(this.data.scroll_depth);

            return `
                <div class="table-card">
                    <h3>Analyse Détaillée par Page</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Page</th>
                                <th>Vues</th>
                                <th>Visiteurs Uniques</th>
                                <th>Taux de Scroll 100%</th>
                                <th>Temps Moyen</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getPagesDetailedStats(pageviews, scrollData)}
                        </tbody>
                    </table>
                </div>

                <div class="charts-grid">
                    <div class="chart-card">
                        <h3>Profondeur de Scroll par Page</h3>
                        <div class="chart-container">
                            <canvas id="scrollDepthChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Sources de Trafic</h3>
                        <div class="chart-container">
                            <canvas id="trafficSourcesChart"></canvas>
                        </div>
                    </div>
                </div>
            `;
        }

        getPagesDetailedStats(pageviews, scrollData) {
            const pageStats = {};

            pageviews.forEach(pv => {
                const path = pv.page.path;
                if (!pageStats[path]) {
                    pageStats[path] = {
                        views: 0,
                        users: new Set(),
                        scroll100: 0,
                        totalTime: 0,
                        timeCount: 0
                    };
                }
                pageStats[path].views++;
                pageStats[path].users.add(pv.userId);
            });

            // Compter les scrolls 100%
            scrollData.forEach(scroll => {
                if (scroll.depth === 100 && pageStats[scroll.page]) {
                    pageStats[scroll.page].scroll100++;
                }
            });

            // Temps moyen
            const timeData = this.filterByDate(this.data.time_on_page);
            timeData.forEach(t => {
                if (pageStats[t.page]) {
                    pageStats[t.page].totalTime += t.timeOnPage;
                    pageStats[t.page].timeCount++;
                }
            });

            return Object.entries(pageStats)
                .map(([path, stats]) => {
                    const scrollRate = stats.views > 0 ? ((stats.scroll100 / stats.views) * 100).toFixed(1) : 0;
                    const avgTime = stats.timeCount > 0 ? Math.floor(stats.totalTime / stats.timeCount) : 0;

                    return `
                        <tr>
                            <td><strong>${path}</strong></td>
                            <td>${stats.views}</td>
                            <td>${stats.users.size}</td>
                            <td>${scrollRate}%</td>
                            <td>${Math.floor(avgTime / 60)}:${(avgTime % 60).toString().padStart(2, '0')}</td>
                        </tr>
                    `;
                })
                .join('');
        }

        // === RENDER CLICKS ===
        renderClicks() {
            const clicks = this.filterByDate(this.data.clicks);
            const buttonClicks = this.filterByDate(this.data.button_clicks);
            const linkClicks = this.filterByDate(this.data.link_clicks);

            return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Clics Totaux</span>
                            <div class="stat-icon blue">
                                <i class="fas fa-mouse-pointer"></i>
                            </div>
                        </div>
                        <div class="stat-value">${clicks.length}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Clics sur Boutons</span>
                            <div class="stat-icon green">
                                <i class="fas fa-hand-pointer"></i>
                            </div>
                        </div>
                        <div class="stat-value">${buttonClicks.length}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Clics sur Liens</span>
                            <div class="stat-icon orange">
                                <i class="fas fa-link"></i>
                            </div>
                        </div>
                        <div class="stat-value">${linkClicks.length}</div>
                    </div>
                </div>

                <div class="charts-grid">
                    <div class="chart-card">
                        <h3>Boutons les Plus Cliqués</h3>
                        <div class="chart-container">
                            <canvas id="topButtonsChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Liens les Plus Cliqués</h3>
                        <div class="chart-container">
                            <canvas id="topLinksChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="table-card">
                    <h3>Top 20 Éléments Cliqués</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Élément</th>
                                <th>Type</th>
                                <th>Texte</th>
                                <th>Nombre de Clics</th>
                                <th>Page</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getTopClickedElements(clicks, 20)}
                        </tbody>
                    </table>
                </div>
            `;
        }

        getTopClickedElements(clicks, limit = 20) {
            const elementClicks = {};

            clicks.forEach(click => {
                const key = `${click.element.tagName}-${click.element.id || click.element.className}`;
                if (!elementClicks[key]) {
                    elementClicks[key] = {
                        element: click.element,
                        page: click.page,
                        count: 0
                    };
                }
                elementClicks[key].count++;
            });

            return Object.values(elementClicks)
                .sort((a, b) => b.count - a.count)
                .slice(0, limit)
                .map(item => `
                    <tr>
                        <td><code>${item.element.id || item.element.className || 'N/A'}</code></td>
                        <td><span class="badge medium">${item.element.tagName}</span></td>
                        <td>${(item.element.text || '').substring(0, 50)}</td>
                        <td><strong>${item.count}</strong></td>
                        <td>${item.page}</td>
                    </tr>
                `)
                .join('');
        }

        // === RENDER FORMS ===
        renderForms() {
            const formSubmissions = this.filterByDate(this.data.form_submissions);

            return `
                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-title">Formulaires Soumis</span>
                        <div class="stat-icon green">
                            <i class="fas fa-paper-plane"></i>
                        </div>
                    </div>
                    <div class="stat-value">${formSubmissions.length}</div>
                </div>

                <div class="table-card" style="margin-top: 24px;">
                    <h3>Soumissions de Formulaires</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Page</th>
                                <th>Formulaire ID</th>
                                <th>Nombre de Champs</th>
                                <th>Méthode</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getFormSubmissions(formSubmissions)}
                        </tbody>
                    </table>
                </div>
            `;
        }

        getFormSubmissions(submissions) {
            if (submissions.length === 0) {
                return `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 40px; color: var(--text-light);">
                            <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                            Aucune soumission de formulaire pour le moment
                        </td>
                    </tr>
                `;
            }

            return submissions
                .sort((a, b) => b.timestamp - a.timestamp)
                .map(sub => {
                    const date = new Date(sub.timestamp);
                    return `
                        <tr>
                            <td>${date.toLocaleString('fr-FR')}</td>
                            <td>${sub.page}</td>
                            <td><code>${sub.form.id || 'N/A'}</code></td>
                            <td>${sub.form.fieldCount || Object.keys(sub.form.fields || {}).length}</td>
                            <td><span class="badge medium">${sub.form.method}</span></td>
                        </tr>
                    `;
                })
                .join('');
        }

        // === RENDER USERS ===
        renderUsers() {
            const pageviews = this.filterByDate(this.data.pageviews);
            const deviceInfo = this.data.device_info;

            const userStats = this.getUserStats(pageviews, deviceInfo);

            return `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Utilisateurs Totaux</span>
                            <div class="stat-icon blue">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                        <div class="stat-value">${userStats.total}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Nouveaux Utilisateurs</span>
                            <div class="stat-icon green">
                                <i class="fas fa-user-plus"></i>
                            </div>
                        </div>
                        <div class="stat-value">${userStats.new}</div>
                    </div>

                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-title">Sessions Totales</span>
                            <div class="stat-icon orange">
                                <i class="fas fa-stream"></i>
                            </div>
                        </div>
                        <div class="stat-value">${userStats.sessions}</div>
                    </div>
                </div>

                <div class="charts-grid">
                    <div class="chart-card">
                        <h3>Répartition Desktop vs Mobile</h3>
                        <div class="chart-container">
                            <canvas id="deviceTypeChart"></canvas>
                        </div>
                    </div>

                    <div class="chart-card">
                        <h3>Systèmes d'Exploitation</h3>
                        <div class="chart-container">
                            <canvas id="osChart"></canvas>
                        </div>
                    </div>
                </div>

                <div class="table-card">
                    <h3>Détails des Utilisateurs</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>User ID</th>
                                <th>Première Visite</th>
                                <th>Dernière Visite</th>
                                <th>Nb Sessions</th>
                                <th>Pages Vues</th>
                                <th>Appareil</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getUserDetailsTable(pageviews)}
                        </tbody>
                    </table>
                </div>
            `;
        }

        getUserStats(pageviews, deviceInfo) {
            const users = new Set(pageviews.map(p => p.userId));
            const sessions = new Set(pageviews.map(p => p.sessionId));

            // Nouveaux utilisateurs (première visite dans la période filtrée)
            const userFirstVisit = {};
            pageviews.forEach(pv => {
                if (!userFirstVisit[pv.userId] || pv.timestamp < userFirstVisit[pv.userId]) {
                    userFirstVisit[pv.userId] = pv.timestamp;
                }
            });

            const now = Date.now();
            const newUsers = Object.values(userFirstVisit).filter(timestamp => {
                return (now - timestamp) < 7 * 24 * 60 * 60 * 1000; // 7 jours
            }).length;

            return {
                total: users.size,
                new: newUsers,
                sessions: sessions.size
            };
        }

        getUserDetailsTable(pageviews) {
            const userDetails = {};

            pageviews.forEach(pv => {
                if (!userDetails[pv.userId]) {
                    userDetails[pv.userId] = {
                        firstVisit: pv.timestamp,
                        lastVisit: pv.timestamp,
                        sessions: new Set(),
                        pageviews: 0,
                        device: pv.device?.type || 'unknown'
                    };
                }

                const user = userDetails[pv.userId];
                if (pv.timestamp < user.firstVisit) user.firstVisit = pv.timestamp;
                if (pv.timestamp > user.lastVisit) user.lastVisit = pv.timestamp;
                user.sessions.add(pv.sessionId);
                user.pageviews++;
            });

            return Object.entries(userDetails)
                .sort((a, b) => b[1].lastVisit - a[1].lastVisit)
                .slice(0, 50)
                .map(([userId, details]) => {
                    const firstVisit = new Date(details.firstVisit).toLocaleDateString('fr-FR');
                    const lastVisit = new Date(details.lastVisit).toLocaleString('fr-FR');
                    const deviceIcon = details.device === 'mobile' ? 'mobile-alt' : details.device === 'tablet' ? 'tablet-alt' : 'desktop';

                    return `
                        <tr>
                            <td><code>${userId.substring(0, 8)}...</code></td>
                            <td>${firstVisit}</td>
                            <td>${lastVisit}</td>
                            <td>${details.sessions.size}</td>
                            <td>${details.pageviews}</td>
                            <td><i class="fas fa-${deviceIcon}"></i> ${details.device}</td>
                        </tr>
                    `;
                })
                .join('');
        }

        // === RENDER ACTIVITY ===
        renderActivity() {
            // Activité en temps réel (dernières 50 actions)
            const allEvents = [
                ...this.data.pageviews.map(e => ({...e, type: 'pageview'})),
                ...this.data.clicks.map(e => ({...e, type: 'click'})),
                ...this.data.button_clicks.map(e => ({...e, type: 'button_click'})),
                ...this.data.form_submissions.map(e => ({...e, type: 'form_submit'}))
            ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);

            return `
                <div class="activity-feed">
                    <h3>Activité en Temps Réel (50 dernières actions)</h3>
                    ${this.getActivityFeed(allEvents)}
                </div>
            `;
        }

        getActivityFeed(events) {
            if (events.length === 0) {
                return '<p style="color: var(--text-light); padding: 20px;">Aucune activité récente</p>';
            }

            return events.map(event => {
                const time = new Date(event.timestamp).toLocaleTimeString('fr-FR');
                let description = '';

                switch(event.type) {
                    case 'pageview':
                        description = `👁️ Visite de la page <strong>${event.page?.path || 'N/A'}</strong>`;
                        break;
                    case 'click':
                        description = `🖱️ Clic sur <strong>${event.element?.tagName || 'élément'}</strong>`;
                        break;
                    case 'button_click':
                        description = `🔘 Clic sur bouton <strong>"${event.button?.text || 'N/A'}"</strong>`;
                        break;
                    case 'form_submit':
                        description = `📧 Soumission de formulaire sur <strong>${event.page}</strong>`;
                        break;
                }

                return `
                    <div class="activity-item">
                        <div class="activity-time">${time}</div>
                        <div class="activity-description">${description}</div>
                    </div>
                `;
            }).join('');
        }

        // === RENDER EXPORT ===
        renderExport() {
            return `
                <div class="export-section">
                    <h3>Exporter les Données Analytics</h3>
                    <p style="margin-bottom: 24px; color: var(--text-light);">
                        Téléchargez vos données d'analytics dans différents formats pour analyse externe.
                    </p>

                    <div class="export-buttons">
                        <button class="export-btn" onclick="window.PlanBAnalytics.exportJSON()">
                            <i class="fas fa-file-code"></i>
                            Exporter tout en JSON
                        </button>

                        <button class="export-btn" onclick="dashboardManager.exportCSV('pageviews')">
                            <i class="fas fa-file-csv"></i>
                            Exporter Pages Vues (CSV)
                        </button>

                        <button class="export-btn" onclick="dashboardManager.exportCSV('clicks')">
                            <i class="fas fa-file-csv"></i>
                            Exporter Clics (CSV)
                        </button>

                        <button class="export-btn" onclick="dashboardManager.exportCSV('form_submissions')">
                            <i class="fas fa-file-csv"></i>
                            Exporter Formulaires (CSV)
                        </button>
                    </div>
                </div>

                <div class="table-card">
                    <h3>Statistiques Globales</h3>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Métrique</th>
                                <th>Valeur</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.getGlobalStats()}
                        </tbody>
                    </table>
                </div>

                <div class="export-section" style="margin-top: 24px; background: #FFF4E6; border: 2px solid var(--accent-secondary);">
                    <h3 style="color: var(--accent-color);">
                        <i class="fas fa-exclamation-triangle"></i> Zone Dangereuse
                    </h3>
                    <p style="margin-bottom: 16px; color: var(--text-dark);">
                        Attention : Cette action supprimera TOUTES les données analytics de manière irréversible.
                    </p>
                    <button class="export-btn" style="background: var(--accent-color);" onclick="dashboardManager.clearAllData()">
                        <i class="fas fa-trash-alt"></i>
                        Supprimer Toutes les Données
                    </button>
                </div>
            `;
        }

        getGlobalStats() {
            const stats = window.PlanBAnalytics.getStats();
            return `
                <tr><td>Pages Vues Totales</td><td><strong>${stats.totalPageviews}</strong></td></tr>
                <tr><td>Clics Totaux</td><td><strong>${stats.totalClicks}</strong></td></tr>
                <tr><td>Clics sur Boutons</td><td><strong>${stats.totalButtonClicks}</strong></td></tr>
                <tr><td>Clics sur Liens</td><td><strong>${stats.totalLinkClicks}</strong></td></tr>
                <tr><td>Formulaires Soumis</td><td><strong>${stats.totalFormSubmissions}</strong></td></tr>
                <tr><td>Utilisateurs Uniques</td><td><strong>${stats.uniqueUsers}</strong></td></tr>
                <tr><td>Sessions Uniques</td><td><strong>${stats.uniqueSessions}</strong></td></tr>
            `;
        }

        exportCSV(type) {
            window.PlanBAnalytics.exportCSV(type);
        }

        clearAllData() {
            if (confirm('⚠️ ATTENTION : Voulez-vous vraiment supprimer TOUTES les données analytics ? Cette action est irréversible !')) {
                if (confirm('Dernière confirmation : Êtes-vous absolument sûr ?')) {
                    window.PlanBAnalytics.clearAll();
                    alert('✅ Toutes les données ont été supprimées.');
                    this.refresh();
                }
            }
        }

        // === GRAPHIQUES ===
        initCharts(section) {
            // Détruire les anciens graphiques
            Object.values(charts).forEach(chart => {
                if (chart) chart.destroy();
            });
            charts = {};

            switch(section) {
                case 'overview':
                    this.createVisitorsChart();
                    this.createPagesChart();
                    this.createDevicesChart();
                    this.createBrowsersChart();
                    break;
                case 'pages':
                    this.createScrollDepthChart();
                    this.createTrafficSourcesChart();
                    break;
                case 'clicks':
                    this.createTopButtonsChart();
                    this.createTopLinksChart();
                    break;
                case 'users':
                    this.createDeviceTypeChart();
                    this.createOSChart();
                    break;
            }
        }

        createVisitorsChart() {
            const ctx = document.getElementById('visitorsChart');
            if (!ctx) return;

            const pageviews = this.filterByDate(this.data.pageviews);
            const dayData = this.groupByDay(pageviews);

            charts.visitorsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dayData.labels,
                    datasets: [{
                        label: 'Visiteurs',
                        data: dayData.values,
                        borderColor: '#0052CC',
                        backgroundColor: 'rgba(0, 82, 204, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        createPagesChart() {
            const ctx = document.getElementById('pagesChart');
            if (!ctx) return;

            const pageviews = this.filterByDate(this.data.pageviews);
            const pageCounts = {};

            pageviews.forEach(pv => {
                const path = pv.page.path;
                pageCounts[path] = (pageCounts[path] || 0) + 1;
            });

            const sorted = Object.entries(pageCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            charts.pagesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sorted.map(([path]) => path),
                    datasets: [{
                        label: 'Vues',
                        data: sorted.map(([, count]) => count),
                        backgroundColor: '#36B37E'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        createDevicesChart() {
            const ctx = document.getElementById('devicesChart');
            if (!ctx) return;

            const pageviews = this.filterByDate(this.data.pageviews);
            const devices = {};

            pageviews.forEach(pv => {
                const type = pv.device?.type || 'unknown';
                devices[type] = (devices[type] || 0) + 1;
            });

            charts.devicesChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(devices),
                    datasets: [{
                        data: Object.values(devices),
                        backgroundColor: ['#0052CC', '#36B37E', '#FFAB00', '#FF5630']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        createBrowsersChart() {
            const ctx = document.getElementById('browsersChart');
            if (!ctx) return;

            const pageviews = this.filterByDate(this.data.pageviews);
            const browsers = {};

            pageviews.forEach(pv => {
                const browser = pv.browser?.name || 'Unknown';
                browsers[browser] = (browsers[browser] || 0) + 1;
            });

            charts.browsersChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(browsers),
                    datasets: [{
                        data: Object.values(browsers),
                        backgroundColor: ['#0052CC', '#36B37E', '#FFAB00', '#FF5630', '#172B4D']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        createScrollDepthChart() {
            const ctx = document.getElementById('scrollDepthChart');
            if (!ctx) return;

            const scrollData = this.filterByDate(this.data.scroll_depth);
            const depths = { 25: 0, 50: 0, 75: 0, 100: 0 };

            scrollData.forEach(s => {
                if (depths.hasOwnProperty(s.depth)) {
                    depths[s.depth]++;
                }
            });

            charts.scrollDepthChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['25%', '50%', '75%', '100%'],
                    datasets: [{
                        label: 'Utilisateurs',
                        data: Object.values(depths),
                        backgroundColor: ['#36B37E', '#FFAB00', '#FF5630', '#0052CC']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        createTrafficSourcesChart() {
            const ctx = document.getElementById('trafficSourcesChart');
            if (!ctx) return;

            const pageviews = this.filterByDate(this.data.pageviews);
            const sources = { 'Direct': 0, 'Referral': 0, 'Search': 0, 'Social': 0 };

            pageviews.forEach(pv => {
                const ref = pv.page.referrer;
                if (!ref || ref === '') {
                    sources['Direct']++;
                } else if (ref.includes('google') || ref.includes('bing')) {
                    sources['Search']++;
                } else if (ref.includes('facebook') || ref.includes('twitter') || ref.includes('linkedin')) {
                    sources['Social']++;
                } else {
                    sources['Referral']++;
                }
            });

            charts.trafficSourcesChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(sources),
                    datasets: [{
                        data: Object.values(sources),
                        backgroundColor: ['#0052CC', '#36B37E', '#FFAB00', '#FF5630']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        createTopButtonsChart() {
            const ctx = document.getElementById('topButtonsChart');
            if (!ctx) return;

            const buttonClicks = this.filterByDate(this.data.button_clicks);
            const buttons = {};

            buttonClicks.forEach(click => {
                const text = click.button?.text || 'Unknown';
                buttons[text] = (buttons[text] || 0) + 1;
            });

            const sorted = Object.entries(buttons)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            charts.topButtonsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sorted.map(([text]) => text.substring(0, 30)),
                    datasets: [{
                        label: 'Clics',
                        data: sorted.map(([, count]) => count),
                        backgroundColor: '#36B37E'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        createTopLinksChart() {
            const ctx = document.getElementById('topLinksChart');
            if (!ctx) return;

            const linkClicks = this.filterByDate(this.data.link_clicks);
            const links = {};

            linkClicks.forEach(click => {
                const text = click.link?.text || click.link?.href || 'Unknown';
                links[text] = (links[text] || 0) + 1;
            });

            const sorted = Object.entries(links)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            charts.topLinksChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: sorted.map(([text]) => text.substring(0, 30)),
                    datasets: [{
                        label: 'Clics',
                        data: sorted.map(([, count]) => count),
                        backgroundColor: '#FFAB00'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }

        createDeviceTypeChart() {
            const ctx = document.getElementById('deviceTypeChart');
            if (!ctx) return;

            const pageviews = this.filterByDate(this.data.pageviews);
            const deviceTypes = {};

            pageviews.forEach(pv => {
                const type = pv.device?.type || 'unknown';
                deviceTypes[type] = (deviceTypes[type] || 0) + 1;
            });

            charts.deviceTypeChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(deviceTypes),
                    datasets: [{
                        data: Object.values(deviceTypes),
                        backgroundColor: ['#0052CC', '#36B37E', '#FFAB00']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        createOSChart() {
            const ctx = document.getElementById('osChart');
            if (!ctx) return;

            const pageviews = this.filterByDate(this.data.pageviews);
            const oses = {};

            pageviews.forEach(pv => {
                const os = pv.device?.os || 'Unknown';
                oses[os] = (oses[os] || 0) + 1;
            });

            charts.osChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(oses),
                    datasets: [{
                        data: Object.values(oses),
                        backgroundColor: ['#0052CC', '#36B37E', '#FFAB00', '#FF5630', '#172B4D']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        groupByDay(data) {
            const days = {};

            data.forEach(item => {
                const date = new Date(item.timestamp);
                const day = date.toLocaleDateString('fr-FR');
                days[day] = (days[day] || 0) + 1;
            });

            return {
                labels: Object.keys(days),
                values: Object.values(days)
            };
        }
    }

    // === INITIALISATION ===
    let authManager, dashboardManager;

    document.addEventListener('DOMContentLoaded', () => {
        authManager = new AuthManager();
        dashboardManager = new DashboardManager();

        // Exposer pour accès externe
        window.dashboardManager = dashboardManager;
    });

})();
