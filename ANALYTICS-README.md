# 📊 Plan B CRM - Panel Administrateur Analytics

Panel administrateur complet avec système de tracking avancé pour votre site vitrine Plan B CRM.

## 🎯 Fonctionnalités

### Tracking Automatique
- ✅ **Pages vues** : URL, titre, referrer, temps de chargement
- ✅ **Clics** : Tous les clics avec position, élément, contexte
- ✅ **Boutons** : Tracking spécifique des boutons et CTA
- ✅ **Liens** : Clics sur liens (internes/externes)
- ✅ **Formulaires** : Soumissions, champs remplis, validation
- ✅ **Scroll** : Profondeur de scroll (25%, 50%, 75%, 100%)
- ✅ **Temps sur page** : Temps réel passé sur chaque page
- ✅ **Changements d'onglets** : Pour index.html (système d'onglets)
- ✅ **Mouvement souris** : Heatmap des mouvements (pour analyse UX)
- ✅ **Informations device** : Type, OS, navigateur, résolution

### Dashboard Admin
- 📈 **Vue d'ensemble** : Stats clés, graphiques visiteurs, appareils
- 📄 **Analyse par page** : Performance, scroll depth, temps moyen
- 🖱️ **Clics & Interactions** : Top boutons/liens cliqués, heatmap
- 📧 **Formulaires** : Taux de conversion, champs problématiques
- 👥 **Utilisateurs** : Nouveaux/récurrents, sessions, appareils
- ⚡ **Temps réel** : Flux d'activité en direct
- 💾 **Export** : JSON, CSV pour analyse externe

### Visualisations
- 📊 **Graphiques Chart.js** : Line, bar, pie, doughnut charts
- 📋 **Tableaux interactifs** : Tri, filtrage par date
- 🎨 **Design Bauhaus** : Cohérent avec le site vitrine
- 📱 **Responsive** : Mobile, tablette, desktop

## 🚀 Installation

### Option 1 : Mode Local (LocalStorage uniquement)

**Aucune installation requise !** Le système fonctionne directement.

1. Ouvrez simplement `index.html` dans votre navigateur
2. Naviguez sur le site (les données sont trackées automatiquement)
3. Accédez au panel admin : `admin.html`
4. Connectez-vous avec :
   - **Username** : `admin`
   - **Password** : `admin123`

Les données sont stockées dans le localStorage du navigateur.

### Option 2 : Backend Node.js (Recommandé)

Pour sauvegarder les données côté serveur et partager entre navigateurs.

#### Prérequis
- Node.js 14+ installé
- npm ou yarn

#### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur
npm start

# Ou en mode développement avec auto-reload
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

#### Accès
- **Site vitrine** : http://localhost:3000/index.html
- **Panel admin** : http://localhost:3000/admin.html

#### Configuration

Éditez `analytics-tracker.js` ligne 9 :

```javascript
const CONFIG = {
    apiEndpoint: 'http://localhost:3000/api/analytics', // ← Décommenter
    localStorage: true,
    debugMode: true,
};
```

### Option 3 : Backend PHP

Si vous préférez PHP ou avez un hébergement PHP (OVH, etc.).

#### Installation

```bash
# 1. Placer tous les fichiers sur votre serveur PHP
# 2. Vérifier que le dossier est accessible en écriture
chmod 755 analytics-data/
```

#### Configuration

Éditez `analytics-tracker.js` ligne 9 :

```javascript
const CONFIG = {
    apiEndpoint: '/api.php', // ← Chemin vers api.php
    localStorage: true,
    debugMode: true,
};
```

#### API Endpoints (PHP)

```
POST   /api.php              → Sauvegarder analytics
GET    /api.php/stats        → Statistiques globales
GET    /api.php/{type}       → Données par type
GET    /api.php/export       → Exporter JSON
DELETE /api.php/clear        → Supprimer données
```

## 📖 Utilisation

### Accéder au Panel Admin

1. Ouvrez `admin.html` dans votre navigateur
2. Connectez-vous :
   - Username : `admin`
   - Password : `admin123`

⚠️ **IMPORTANT** : Changez ces identifiants en production !

### Changer les Identifiants

Éditez `admin-dashboard.js` lignes 18-21 :

```javascript
const ADMIN_CREDENTIALS = {
    username: 'votre_username',
    password: 'votre_mot_de_passe_securise'
};
```

### Navigation dans le Panel

#### Vue d'ensemble
- **Statistiques clés** : Visiteurs, pages vues, clics, formulaires
- **Graphiques** : Évolution visiteurs, top pages, appareils, navigateurs
- **Tableau** : Top 10 pages par engagement

#### Pages
- Analyse détaillée par page
- Taux de scroll 100% (combien lisent tout)
- Temps moyen passé
- Sources de trafic

#### Clics & Interactions
- Top boutons cliqués
- Top liens cliqués
- Tableau des 20 éléments les plus cliqués

#### Formulaires
- Liste des soumissions
- Date, page, champs remplis
- Analyse du funnel de conversion

#### Utilisateurs
- Détails utilisateurs (anonymisés)
- Desktop vs Mobile vs Tablet
- Systèmes d'exploitation
- Nouveaux vs récurrents

#### Activité en Temps Réel
- Flux des 50 dernières actions
- Mises à jour automatiques
- Types : pageview, click, form_submit

#### Export
- **JSON** : Tout exporter pour analyse externe
- **CSV** : Par type de données (pageviews, clics, etc.)
- **Supprimer** : Zone dangereuse pour tout effacer

### Filtrage par Date

En haut à droite, sélectionnez :
- **Aujourd'hui** : Données du jour
- **Hier** : Données d'hier uniquement
- **7 derniers jours** (par défaut)
- **30 derniers jours**
- **Toutes les données**

## 🔧 Configuration Avancée

### Personnaliser le Tracking

Éditez `analytics-tracker.js` lignes 8-12 :

```javascript
const CONFIG = {
    apiEndpoint: '/api/analytics',     // URL API ou false
    localStorage: true,                 // Sauvegarder localement
    debugMode: true,                   // Console.log des événements
    sessionTimeout: 30 * 60 * 1000,    // 30 minutes
};
```

### Désactiver certains tracking

Dans `analytics-tracker.js`, commentez les lignes dans `init()` :

```javascript
init() {
    this.trackPageView();
    this.trackClicks();
    // this.trackMouseMovement(); // ← Désactiver heatmap
    // this.trackScrollDepth();   // ← Désactiver scroll tracking
    ...
}
```

### Limiter le stockage localStorage

Par défaut, 1000 entrées max par type. Éditez ligne 433 :

```javascript
if (stored.length >= 1000) { // ← Changer la limite
    stored = stored.slice(-900);
}
```

### Changer la fréquence d'envoi

Ligne 25 dans le constructeur :

```javascript
// Envoyer périodiquement
setInterval(() => this.sendData(), 30000); // ← 30 secondes (modifier ici)
```

## 📊 API Analytics

Si vous utilisez Node.js ou PHP, voici les endpoints disponibles.

### POST /api/analytics
Recevoir et sauvegarder les données analytics.

**Body** :
```json
{
  "events": [...],
  "sessionId": "uuid",
  "userId": "uuid",
  "timestamp": 1234567890
}
```

**Response** :
```json
{
  "success": true,
  "eventsReceived": 25,
  "message": "Analytics data saved successfully"
}
```

### GET /api/analytics/stats
Récupérer les statistiques globales.

**Response** :
```json
{
  "totalPageviews": 1523,
  "totalClicks": 4521,
  "totalButtonClicks": 234,
  "totalFormSubmissions": 45,
  "uniqueUsers": 342,
  "uniqueSessions": 567,
  "lastUpdated": 1234567890
}
```

### GET /api/analytics/:type
Récupérer des données par type.

**Types** : `pageview`, `click`, `button_click`, `link_click`, `form_submit`, `scroll_depth`, etc.

**Query params** :
- `limit` : Nombre de résultats (défaut 1000)
- `offset` : Pagination (défaut 0)
- `startDate` : Date de début (ISO format)
- `endDate` : Date de fin (ISO format)

**Exemple** :
```
GET /api/analytics/pageview?limit=50&offset=0
```

**Response** :
```json
{
  "data": [...],
  "total": 1523,
  "limit": 50,
  "offset": 0
}
```

### GET /api/analytics/export/json
Exporter toutes les données en JSON.

Télécharge un fichier `analytics-export-{timestamp}.json`

### DELETE /api/analytics/clear
Supprimer toutes les données (nécessite confirmation).

**Body** :
```json
{
  "confirmToken": "DELETE_ALL_ANALYTICS_DATA"
}
```

## 🔒 Sécurité

### En Production

1. **Changez les identifiants admin** dans `admin-dashboard.js`

2. **Utilisez HTTPS** pour les appels API

3. **Ajoutez une vraie authentification** :
   - JWT tokens
   - Session PHP
   - OAuth2

4. **Restreignez l'accès au panel** :
   - `.htaccess` pour Apache
   - nginx auth_basic
   - Firewall IP whitelist

5. **Validez et sanitizez** les données côté serveur

6. **Limitez les requêtes** (rate limiting)

### .htaccess Exemple (Apache)

```apache
# Protéger admin.html
<Files "admin.html">
    AuthType Basic
    AuthName "Admin Panel"
    AuthUserFile /path/to/.htpasswd
    Require valid-user
</Files>
```

### HTTPS (Let's Encrypt)

```bash
# Installer certbot
sudo apt install certbot

# Obtenir un certificat
sudo certbot --standalone -d votredomaine.fr
```

## 📈 Intégration avec d'autres outils

### Google Analytics

Combinez avec GA pour avoir le meilleur des deux mondes :

```html
<!-- Dans <head> de chaque page -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXX');
</script>
```

### Exporter vers Excel

1. Allez dans "Exporter les données"
2. Cliquez "Exporter Pages Vues (CSV)"
3. Ouvrez le fichier CSV dans Excel
4. Utilisez les tableaux croisés dynamiques pour analyse

### Webhooks

Ajoutez dans `api-server.js` pour envoyer des notifications :

```javascript
// Après avoir sauvé les événements
if (event.type === 'form_submit') {
    // Envoyer webhook à Zapier, Make.com, etc.
    await fetch('https://hooks.zapier.com/hooks/catch/...', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
    });
}
```

## 🐛 Debugging

### Mode Debug

Activé par défaut. Voir `analytics-tracker.js` ligne 11 :

```javascript
debugMode: true  // Les événements s'affichent dans la console
```

Ouvrez la console (F12) pour voir tous les événements trackés en temps réel.

### Tester le tracking

```javascript
// Dans la console du navigateur
console.log(window.PlanBAnalytics.getAllData());
console.log(window.PlanBAnalytics.getStats());
```

### Vider les données de test

```javascript
// Dans la console
window.PlanBAnalytics.clearAll();
```

Ou via le panel admin : Section "Exporter" → "Supprimer Toutes les Données"

### Erreurs communes

**"analytics_tracker.js not found"**
→ Vérifiez que le fichier est bien dans le même dossier que vos HTML

**"LocalStorage quota exceeded"**
→ Trop de données stockées, exportez et supprimez

**"API endpoint not responding"**
→ Vérifiez que le serveur Node.js/PHP est bien démarré

**"Charts not displaying"**
→ Vérifiez la connexion internet (Chart.js est chargé depuis CDN)

## 📦 Structure des Données

### Event Structure (exemple pageview)

```json
{
  "type": "pageview",
  "timestamp": 1234567890123,
  "sessionId": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "userId": "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx",
  "page": {
    "url": "http://localhost/index.html",
    "path": "/index.html",
    "title": "Plan B CRM",
    "referrer": "https://google.com",
    "queryParams": {}
  },
  "device": {
    "type": "desktop",
    "os": "Windows",
    "browser": "Chrome",
    "language": "fr-FR"
  },
  "screen": {
    "width": 1920,
    "height": 1080,
    "viewportWidth": 1200,
    "viewportHeight": 800
  }
}
```

### Storage Structure (localStorage)

```
analytics_pageviews        → Array d'objets pageview
analytics_clicks           → Array d'objets click
analytics_button_clicks    → Array d'objets button_click
analytics_link_clicks      → Array d'objets link_click
analytics_form_submissions → Array d'objets form_submit
analytics_scroll_depth     → Array d'objets scroll_depth
analytics_time_on_page     → Array d'objets time
analytics_tab_switches     → Array d'objets tab_switch
analytics_mouse_movements  → Array d'objets mouse movements
analytics_device_info      → Array d'objets device
analytics_batches          → Array de batches complets
```

## 🎨 Personnalisation du Design

Le panel admin utilise les mêmes variables CSS que le site :

```css
:root {
    --primary-color: #0052CC;
    --secondary-color: #172B4D;
    --accent-color: #FF5630;
    --accent-secondary: #FFAB00;
    /* ... */
}
```

Modifiez ces valeurs dans `admin.html` (ligne 42) pour changer les couleurs.

## 📚 Ressources

- **Chart.js Documentation** : https://www.chartjs.org/docs/
- **LocalStorage API** : https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Express.js** : https://expressjs.com/
- **Intersection Observer** : https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

## 🆘 Support

Pour toute question ou problème :

1. Vérifiez la console (F12) pour les erreurs
2. Consultez ce README
3. Testez en mode debug
4. Contactez le développeur

## 📝 TODO Future

Améliorations futures possibles :

- [ ] Dashboard temps réel avec WebSockets
- [ ] Heatmap visuelle interactive
- [ ] A/B testing intégré
- [ ] Alertes email (conversion, erreur)
- [ ] Multi-utilisateurs avec rôles
- [ ] Dark mode pour le panel
- [ ] Export PDF des rapports
- [ ] Comparaison périodes
- [ ] Objectifs et KPIs personnalisés
- [ ] Intégration CRM native

## 📄 Licence

MIT License - Libre d'utilisation pour Plan B CRM

---

**Créé avec ❤️ pour Plan B CRM**

Version 1.0.0 - Novembre 2025
