# 💻 Commandes Utiles - Panel Analytics

Référence rapide de toutes les commandes et API disponibles.

---

## 🚀 Démarrage Serveur

### Node.js

```bash
# Installation dépendances
npm install

# Démarrer serveur production
npm start

# Démarrer serveur développement (auto-reload)
npm run dev

# Mode manuel
node api-server.js
```

### Windows

```cmd
start-server.bat
```

### Mac/Linux

```bash
chmod +x start-server.sh
./start-server.sh
```

---

## 🔧 Console JavaScript (Navigateur)

Ouvrir la console : `F12` ou `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)

### Statistiques Rapides

```javascript
// Obtenir les statistiques globales
window.PlanBAnalytics.getStats()
// → {totalPageviews: 123, totalClicks: 456, ...}

// Obtenir toutes les données
window.PlanBAnalytics.getAllData()
// → {pageviews: [...], clicks: [...], ...}

// Obtenir un type spécifique
window.PlanBAnalytics.getData('pageviews')
window.PlanBAnalytics.getData('clicks')
window.PlanBAnalytics.getData('form_submissions')
```

### Export

```javascript
// Exporter tout en JSON
window.PlanBAnalytics.exportJSON()
// → Télécharge analytics-export-{timestamp}.json

// Exporter un type en CSV
window.PlanBAnalytics.exportCSV('pageviews')
window.PlanBAnalytics.exportCSV('clicks')
window.PlanBAnalytics.exportCSV('form_submissions')
```

### Nettoyage

```javascript
// Supprimer toutes les données
window.PlanBAnalytics.clearAll()
// ⚠️ Irréversible !

// Vérifier après suppression
window.PlanBAnalytics.getStats()
// → Tout devrait être à 0
```

### Debug

```javascript
// Vérifier que le tracker est chargé
console.log(window.analyticsTracker)
// → AnalyticsTracker {sessionId: "...", userId: "..."}

// Vérifier le session ID
console.log(window.analyticsTracker.sessionId)

// Vérifier le user ID
console.log(window.analyticsTracker.userId)

// Forcer un envoi de données
window.analyticsTracker.sendData()
```

---

## 🌐 API REST (Node.js / PHP)

### Base URL

```
Node.js : http://localhost:3000/api/analytics
PHP     : http://votredomaine.fr/api.php
```

### POST - Envoyer des données

```bash
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d '{
    "events": [
      {
        "type": "pageview",
        "timestamp": 1699708800000,
        "sessionId": "xxx-xxx-xxx",
        "userId": "yyy-yyy-yyy",
        "page": {"url": "http://example.com", "title": "Test"}
      }
    ],
    "sessionId": "xxx-xxx-xxx",
    "userId": "yyy-yyy-yyy",
    "timestamp": 1699708800000
  }'
```

**Réponse** :
```json
{
  "success": true,
  "eventsReceived": 1,
  "message": "Analytics data saved successfully"
}
```

### GET - Statistiques globales

```bash
# Node.js
curl http://localhost:3000/api/analytics/stats

# PHP
curl http://votredomaine.fr/api.php/stats
```

**Réponse** :
```json
{
  "totalPageviews": 1523,
  "totalClicks": 4521,
  "totalButtonClicks": 234,
  "totalFormSubmissions": 45,
  "uniqueUsers": 342,
  "uniqueSessions": 567,
  "lastUpdated": 1699708800000
}
```

### GET - Données par type

```bash
# Pageviews
curl "http://localhost:3000/api/analytics/pageview?limit=50&offset=0"

# Clics
curl "http://localhost:3000/api/analytics/click?limit=100"

# Formulaires
curl "http://localhost:3000/api/analytics/form_submit"
```

**Paramètres disponibles** :
- `limit` : Nombre de résultats (défaut 1000)
- `offset` : Pagination (défaut 0)
- `startDate` : Date début (ISO format)
- `endDate` : Date fin (ISO format)

**Réponse** :
```json
{
  "data": [...],
  "total": 1523,
  "limit": 50,
  "offset": 0
}
```

### GET - Export JSON complet

```bash
# Node.js
curl http://localhost:3000/api/analytics/export/json > export.json

# PHP
curl http://votredomaine.fr/api.php/export > export.json
```

### DELETE - Supprimer toutes les données

```bash
curl -X DELETE http://localhost:3000/api/analytics/clear \
  -H "Content-Type: application/json" \
  -d '{"confirmToken": "DELETE_ALL_ANALYTICS_DATA"}'
```

⚠️ **Token requis pour sécurité** : `DELETE_ALL_ANALYTICS_DATA`

---

## 📦 NPM Commands

### Installation

```bash
# Installer toutes les dépendances
npm install

# Installer une dépendance spécifique
npm install express
npm install cors

# Installer en dev
npm install --save-dev nodemon
```

### Scripts

```bash
# Lancer le serveur
npm start

# Lancer en mode dev (auto-reload)
npm run dev

# Vérifier la version
npm --version
node --version
```

### Mise à jour

```bash
# Vérifier les packages obsolètes
npm outdated

# Mettre à jour tous les packages
npm update

# Mettre à jour un package spécifique
npm update express
```

---

## 🗄️ LocalStorage (Navigateur)

### Lire les données

```javascript
// Lire toutes les pageviews
JSON.parse(localStorage.getItem('analytics_pageviews'))

// Lire tous les clics
JSON.parse(localStorage.getItem('analytics_clicks'))

// Lire les soumissions de formulaires
JSON.parse(localStorage.getItem('analytics_form_submissions'))

// Liste de toutes les clés
Object.keys(localStorage).filter(k => k.startsWith('analytics_'))
```

### Nettoyer

```javascript
// Supprimer un type spécifique
localStorage.removeItem('analytics_pageviews')

// Supprimer toutes les données analytics
Object.keys(localStorage)
  .filter(k => k.startsWith('analytics_'))
  .forEach(k => localStorage.removeItem(k))

// Vérifier l'espace utilisé (approximatif)
const used = JSON.stringify(localStorage).length
console.log(`LocalStorage utilisé: ${(used / 1024).toFixed(2)} KB`)
```

---

## 🔐 Authentification Panel Admin

### Modifier les identifiants

Éditer `admin-dashboard.js` lignes 18-21 :

```javascript
const ADMIN_CREDENTIALS = {
    username: 'votre_nouveau_username',
    password: 'votre_mot_de_passe_securise'
};
```

### Vérifier l'authentification (console)

```javascript
// Vérifier si authentifié
sessionStorage.getItem('admin_authenticated')
// → "true" ou null

// Déconnexion manuelle
sessionStorage.removeItem('admin_authenticated')
sessionStorage.removeItem('admin_login_time')
location.reload()
```

---

## 🐛 Debug & Logs

### Activer le mode debug

Éditer `analytics-tracker.js` ligne 11 :

```javascript
debugMode: true  // Les événements s'affichent dans la console
```

### Console logs serveur

**Node.js** :
Les logs s'affichent directement dans le terminal où vous avez lancé `npm start`

**PHP** :
```bash
# Apache error log
tail -f /var/log/apache2/error.log

# Nginx error log
tail -f /var/log/nginx/error.log

# PHP error log (si configuré)
tail -f /var/log/php-fpm/error.log
```

### Activer display_errors PHP (DEV uniquement)

Dans `api.php`, ajouter en haut :
```php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
```

⚠️ **DÉSACTIVER EN PRODUCTION !**

---

## 📊 Analyse Données avec jq (JSON)

Installer jq :
```bash
# Ubuntu/Debian
sudo apt install jq

# Mac
brew install jq

# Windows (via Chocolatey)
choco install jq
```

### Exemples

```bash
# Compter les pageviews
cat export.json | jq '.pageview | length'

# Lister les pages uniques
cat export.json | jq '.pageview[].page.path' | sort -u

# Compter les clics par page
cat export.json | jq '.click | group_by(.page) | map({page: .[0].page, count: length})'

# Top 5 boutons cliqués
cat export.json | jq '.button_click | group_by(.button.text) | map({button: .[0].button.text, count: length}) | sort_by(-.count) | .[0:5]'

# Répartition Desktop/Mobile
cat export.json | jq '.pageview | group_by(.device.type) | map({type: .[0].device.type, count: length})'
```

---

## 🔧 Configuration Serveur

### Port Node.js (changer de 3000 à autre)

Éditer `api-server.js` ligne 13 :
```javascript
const PORT = process.env.PORT || 3000; // Changer 3000
```

Ou via variable d'environnement :
```bash
PORT=8080 npm start
```

### CORS (autoriser domaines spécifiques)

Éditer `api-server.js` :
```javascript
app.use(cors({
    origin: ['https://votredomaine.fr', 'https://www.votredomaine.fr']
}));
```

### Chemin données (changer dossier)

Éditer `api-server.js` ligne 14 :
```javascript
const DATA_DIR = path.join(__dirname, 'analytics-data'); // Changer le chemin
```

---

## 📁 Gestion Fichiers

### Taille du dossier analytics-data

```bash
# Linux/Mac
du -sh analytics-data/

# Windows (PowerShell)
(Get-ChildItem analytics-data -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
```

### Compresser les données

```bash
# Créer une archive
tar -czf analytics-backup-$(date +%Y%m%d).tar.gz analytics-data/

# Avec zip
zip -r analytics-backup-$(date +%Y%m%d).zip analytics-data/
```

### Restaurer depuis backup

```bash
# Depuis tar.gz
tar -xzf analytics-backup-20251111.tar.gz

# Depuis zip
unzip analytics-backup-20251111.zip
```

---

## 🔄 Git Commands (si projet versionné)

```bash
# Ajouter tous les nouveaux fichiers
git add .

# Commit
git commit -m "Add analytics panel system"

# Push
git push origin main

# Voir les fichiers non trackés
git status

# Voir les différences
git diff
```

---

## 🧪 Tests

### Tester l'API avec curl

```bash
# Test GET stats
curl -v http://localhost:3000/api/analytics/stats

# Test POST data
curl -X POST http://localhost:3000/api/analytics \
  -H "Content-Type: application/json" \
  -d @test-data.json

# Test avec verbose
curl -v http://localhost:3000/api/analytics/pageview
```

### Tester avec Postman

1. Importer collection :
   - New Collection → "Plan B Analytics"
   - Add Request → GET `http://localhost:3000/api/analytics/stats`
   - Add Request → POST `http://localhost:3000/api/analytics`

2. Tester tous les endpoints

### Load Testing (Apache Bench)

```bash
# Installer
sudo apt install apache2-utils  # Linux
brew install apr-util            # Mac

# Tester 100 requêtes, 10 concurrentes
ab -n 100 -c 10 http://localhost:3000/api/analytics/stats
```

---

## 🛡️ Sécurité

### Générer .htpasswd

```bash
# Créer le fichier
htpasswd -c .htpasswd admin

# Ajouter un utilisateur
htpasswd .htpasswd user2
```

### .htaccess pour protéger admin.html

```apache
<Files "admin.html">
    AuthType Basic
    AuthName "Admin Panel"
    AuthUserFile /chemin/complet/.htpasswd
    Require valid-user
</Files>
```

### Obtenir certificat SSL (Let's Encrypt)

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-apache

# Obtenir certificat
sudo certbot --apache -d votredomaine.fr -d www.votredomaine.fr

# Auto-renouvellement
sudo certbot renew --dry-run
```

---

## 📈 Monitoring

### PM2 (pour Node.js en production)

```bash
# Installer PM2 globalement
npm install -g pm2

# Démarrer avec PM2
pm2 start api-server.js --name "analytics-api"

# Voir les logs
pm2 logs analytics-api

# Redémarrer
pm2 restart analytics-api

# Auto-démarrage au boot
pm2 startup
pm2 save

# Monitoring
pm2 monit
```

### Logs en production

```bash
# Logs Node.js (via PM2)
pm2 logs analytics-api --lines 100

# Logs Apache
tail -f /var/log/apache2/access.log
tail -f /var/log/apache2/error.log

# Logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔍 Raccourcis Utiles

| Action | Raccourci |
|--------|-----------|
| Ouvrir console | F12 |
| Rafraîchir page | Ctrl+R / Cmd+R |
| Rafraîchir (vider cache) | Ctrl+Shift+R / Cmd+Shift+R |
| Copier console | Ctrl+C |
| Rechercher dans page | Ctrl+F / Cmd+F |
| Inspecter élément | Ctrl+Shift+C / Cmd+Option+C |

---

## 📚 Documentation Rapide

| Besoin | Fichier |
|--------|---------|
| Démarrer rapidement | START-HERE.md |
| Installer | INSTALLATION.md |
| Utiliser le panel | GUIDE-UTILISATION.md |
| Config avancée | ANALYTICS-README.md |
| Toute la doc | INDEX-DOCUMENTATION.md |

---

## 💡 Astuces

### Copier-coller dans console

```javascript
// Multi-lignes : Shift+Enter pour nouvelle ligne
const stats = window.PlanBAnalytics.getStats()
console.table(stats)

// Tableaux : console.table()
const data = window.PlanBAnalytics.getData('pageviews')
console.table(data.slice(0, 10))
```

### Bookmarklet pour accès rapide

```javascript
javascript:(function(){window.open('admin.html','_blank')})()
```

Créer un favori avec cette URL pour ouvrir le panel en 1 clic.

---

**Dernière mise à jour** : 11 Novembre 2025
