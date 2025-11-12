# 🚀 Installation Rapide - Panel Analytics

## 🎯 3 Modes d'Installation

Choisissez le mode qui vous convient selon vos besoins.

---

## ⚡ MODE 1 : Démarrage Immédiat (Sans Installation)

**Temps** : 30 secondes
**Idéal pour** : Test, développement, démo

### Étapes

1. **Ouvrir le site**
   ```
   Double-clic sur index.html
   ```

2. **Générer des données**
   - Cliquez sur les boutons
   - Remplissez les formulaires
   - Naviguez entre les pages

3. **Accéder au panel**
   ```
   Double-clic sur admin.html
   ```

   Identifiants :
   - Username : `admin`
   - Password : `admin123`

✅ **C'est tout !** Les données sont dans le localStorage de votre navigateur.

---

## 🖥️ MODE 2 : Serveur Node.js (Recommandé)

**Temps** : 5 minutes
**Idéal pour** : Production, partage multi-utilisateurs

### Prérequis

- Node.js 14+ installé ([Télécharger](https://nodejs.org))

### Windows

1. **Double-clic sur `start-server.bat`**

   Le script va :
   - Vérifier Node.js
   - Installer les dépendances (npm install)
   - Démarrer le serveur

2. **Ouvrir le navigateur**
   ```
   http://localhost:3000/admin.html
   ```

### Mac / Linux

1. **Rendre le script exécutable**
   ```bash
   chmod +x start-server.sh
   ```

2. **Lancer le serveur**
   ```bash
   ./start-server.sh
   ```

3. **Ouvrir le navigateur**
   ```
   http://localhost:3000/admin.html
   ```

### Installation Manuelle (Alternative)

```bash
# 1. Installer les dépendances
npm install

# 2. Démarrer le serveur
npm start

# 3. Ouvrir le navigateur
http://localhost:3000/admin.html
```

### Configuration API

Éditez `analytics-tracker.js` ligne 9 :

```javascript
const CONFIG = {
    apiEndpoint: 'http://localhost:3000/api/analytics', // ← Décommenter
    localStorage: true,
    debugMode: true,
};
```

---

## 🌐 MODE 3 : Serveur PHP

**Temps** : 10 minutes
**Idéal pour** : Hébergement mutualisé (OVH, etc.)

### Prérequis

- Serveur PHP 7.4+
- Accès FTP ou cPanel

### Installation

1. **Upload des fichiers**
   ```
   Transférez TOUS les fichiers sur votre serveur
   via FTP (FileZilla, Cyberduck, etc.)
   ```

2. **Permissions**
   ```bash
   chmod 755 analytics-data/
   ```

3. **Configuration**

   Éditez `analytics-tracker.js` ligne 9 :
   ```javascript
   const CONFIG = {
       apiEndpoint: '/api.php', // ← Chemin vers api.php
       localStorage: true,
       debugMode: false, // ← Désactiver en production
   };
   ```

4. **Accès**
   ```
   https://votredomaine.fr/admin.html
   ```

### Hébergements testés

✅ OVH (mutualisé)
✅ Hostinger
✅ o2switch
✅ Infomaniak
✅ 1&1 IONOS

---

## 🔐 Sécurisation (IMPORTANT !)

### Étape 1 : Changer les Identifiants

Éditez `admin-dashboard.js` lignes 18-21 :

```javascript
const ADMIN_CREDENTIALS = {
    username: 'votre_nouveau_username',
    password: 'un_mot_de_passe_TRES_securise_123!'
};
```

### Étape 2 : Protection .htaccess (Apache)

Créez `.htaccess` dans le dossier racine :

```apache
# Protéger admin.html
<Files "admin.html">
    AuthType Basic
    AuthName "Admin Panel"
    AuthUserFile /chemin/complet/.htpasswd
    Require valid-user
</Files>
```

Créez `.htpasswd` :
```bash
htpasswd -c .htpasswd admin
```

### Étape 3 : HTTPS (Let's Encrypt)

```bash
# Ubuntu/Debian
sudo apt install certbot
sudo certbot --apache -d votredomaine.fr

# Ou via cPanel (dans la plupart des hébergements)
```

### Étape 4 : Configuration CORS (Production)

Éditez `api-server.js` ou `api.php` :

```javascript
// Node.js
app.use(cors({
    origin: ['https://votredomaine.fr', 'https://www.votredomaine.fr']
}));
```

```php
// PHP
header('Access-Control-Allow-Origin: https://votredomaine.fr');
```

---

## ✅ Vérification de l'Installation

### Checklist

- [ ] Le site s'ouvre correctement (index.html)
- [ ] Le panel admin s'ouvre (admin.html)
- [ ] Connexion réussie avec les identifiants
- [ ] Données apparaissent dans le dashboard
- [ ] Graphiques s'affichent
- [ ] Export JSON fonctionne
- [ ] Mode mobile responsive

### Tests

1. **Test tracking**
   ```
   Ouvrir test-analytics.html
   Effectuer toutes les actions
   Vérifier dans admin.html
   ```

2. **Test formulaire**
   ```
   Ouvrir demo.html
   Remplir et soumettre le formulaire
   Vérifier dans Panel → Formulaires
   ```

3. **Test multi-pages**
   ```
   Visiter index.html → demo.html → contact.html
   Vérifier dans Panel → Pages
   ```

---

## 🆘 Résolution de Problèmes

### "Node.js n'est pas reconnu"

**Cause** : Node.js pas installé ou pas dans le PATH

**Solution** :
1. Télécharger Node.js : https://nodejs.org
2. Installer avec option "Add to PATH"
3. Redémarrer le terminal/CMD
4. Vérifier : `node --version`

---

### "npm install échoue"

**Cause** : Proxy, firewall ou permissions

**Solution** :
```bash
# Essayer avec --force
npm install --force

# Ou nettoyer le cache
npm cache clean --force
npm install

# Ou utiliser yarn
npm install -g yarn
yarn install
```

---

### "Analytics-tracker.js not found"

**Cause** : Fichier mal placé ou chemin incorrect

**Solution** :
- Vérifier que `analytics-tracker.js` est dans le même dossier que `index.html`
- Vérifier la console (F12) pour voir le chemin exact de l'erreur
- Dans les fichiers HTML, le script doit être : `<script src="analytics-tracker.js"></script>`

---

### "Pas de données dans le panel"

**Cause** : Tracker pas initialisé ou localStorage vide

**Solution** :
1. Ouvrir la console (F12)
2. Taper : `window.PlanBAnalytics.getStats()`
3. Si retourne `{...}` avec des 0 : Naviguer d'abord sur le site
4. Si erreur : Vérifier que analytics-tracker.js est bien chargé

---

### "API endpoint not responding"

**Cause** : Serveur pas démarré ou mauvaise configuration

**Solution** :

**Node.js** :
```bash
# Vérifier que le serveur tourne
node api-server.js

# Vérifier le port
netstat -ano | findstr :3000  (Windows)
lsof -i :3000                 (Mac/Linux)
```

**PHP** :
```bash
# Vérifier les permissions
ls -la analytics-data/

# Vérifier les logs Apache
tail -f /var/log/apache2/error.log
```

---

### "Graphiques ne s'affichent pas"

**Cause** : Chart.js CDN bloqué ou pas de connexion internet

**Solution** :
1. Vérifier la connexion internet
2. Vérifier la console (F12) pour erreurs CDN
3. Alternative : Télécharger Chart.js localement
   ```html
   <script src="chart.min.js"></script>
   ```

---

### "LocalStorage quota exceeded"

**Cause** : Trop de données stockées (>5MB)

**Solution** :
```javascript
// Dans la console
window.PlanBAnalytics.exportJSON();  // Exporter d'abord
window.PlanBAnalytics.clearAll();    // Puis supprimer
```

Ou configurer une limite plus basse dans `analytics-tracker.js` ligne 433.

---

## 📞 Support

### Documentation

- **Démarrage rapide** : [START-HERE.md](START-HERE.md)
- **Guide complet** : [ANALYTICS-README.md](ANALYTICS-README.md)
- **Guide utilisateur** : [GUIDE-UTILISATION.md](GUIDE-UTILISATION.md)
- **Récapitulatif** : [RECAP-ANALYTICS.md](RECAP-ANALYTICS.md)

### Outils de Debug

**Console JavaScript** (F12) :
```javascript
// Vérifier les stats
window.PlanBAnalytics.getStats()

// Voir toutes les données
window.PlanBAnalytics.getAllData()

// Exporter
window.PlanBAnalytics.exportJSON()

// Supprimer
window.PlanBAnalytics.clearAll()
```

### Logs Serveur

**Node.js** :
```bash
# Les logs s'affichent directement dans le terminal
node api-server.js
```

**PHP** :
```bash
# Vérifier les logs Apache
tail -f /var/log/apache2/error.log

# Ou activer display_errors (DEV uniquement !)
ini_set('display_errors', 1);
```

---

## 🎯 Prochaines Étapes

Une fois installé :

1. **Lire le guide de démarrage**
   ```
   START-HERE.md
   ```

2. **Tester le système**
   ```
   Ouvrir test-analytics.html
   Effectuer toutes les actions
   Vérifier le panel admin
   ```

3. **Personnaliser**
   ```
   - Changer les identifiants
   - Configurer l'API
   - Ajuster les couleurs (optionnel)
   ```

4. **Déployer en production**
   ```
   - Activer HTTPS
   - Ajouter .htaccess
   - Désactiver debugMode
   ```

5. **Analyser et optimiser**
   ```
   - Consulter GUIDE-UTILISATION.md
   - Suivre les métriques
   - Optimiser le site
   ```

---

## 🎉 Installation Terminée !

Votre panel analytics est maintenant opérationnel.

**Accès rapide** :
- Site : `index.html` ou `http://localhost:3000`
- Panel Admin : `admin.html` ou `http://localhost:3000/admin.html`
- Test : `test-analytics.html`

**Identifiants par défaut** :
- Username : `admin`
- Password : `admin123`

⚠️ **N'oubliez pas de changer les identifiants avant la production !**

---

**Besoin d'aide ?** Consultez [ANALYTICS-README.md](ANALYTICS-README.md) pour la documentation complète.
