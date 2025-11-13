# 🚀 Déploiement GitHub Pages - Guide Complet

## ✅ Fichiers Préparés

Les fichiers suivants ont été créés et sont prêts pour GitHub Pages :

- ✅ `index.html` (racine) - Redirige vers `pages/index.html`
- ✅ `.nojekyll` - Désactive Jekyll pour préserver la structure
- ✅ `.github/workflows/pages.yml` - Workflow de déploiement automatique

---

## 📋 ÉTAPES D'ACTIVATION (5 minutes)

### Étape 1 : Commit et Push

Les fichiers sont prêts. Il faut maintenant les commiter et pusher :

```bash
git add -A
git commit -m "Configure GitHub Pages deployment"
git push
```

### Étape 2 : Activer GitHub Pages sur GitHub

1. **Aller sur votre repository GitHub**
   - URL : https://github.com/CheckPointsIP/site_vitrine

2. **Accéder aux Settings**
   - Cliquer sur l'onglet **"Settings"** (en haut à droite)

3. **Configurer Pages**
   - Dans le menu latéral gauche, cliquer sur **"Pages"**
   - Dans **"Build and deployment"** :
     - **Source :** Sélectionner "GitHub Actions"
   - Cliquer sur **"Save"**

4. **Attendre le déploiement**
   - Aller dans l'onglet **"Actions"** en haut
   - Vous verrez le workflow "Deploy to GitHub Pages" en cours
   - Attendre qu'il devienne vert ✅ (environ 1-2 minutes)

5. **Obtenir l'URL**
   - Retourner dans **Settings > Pages**
   - L'URL de votre site sera affichée :
     - Format : `https://checkpointsip.github.io/site_vitrine/`

---

## 🌐 URLs du Site

Une fois déployé, votre site sera accessible à :

**URL principale :**
```
https://checkpointsip.github.io/site_vitrine/
```

**Pages spécifiques :**
```
https://checkpointsip.github.io/site_vitrine/pages/index.html
https://checkpointsip.github.io/site_vitrine/pages/admin.html
https://checkpointsip.github.io/site_vitrine/pages/contact.html
https://checkpointsip.github.io/site_vitrine/pages/demo.html
https://checkpointsip.github.io/site_vitrine/pages/decouvrir.html
```

---

## ⚙️ Comment ça fonctionne

### 1. Redirection Automatique

Le fichier `index.html` à la racine redirige automatiquement vers `pages/index.html` :
- Via meta refresh (instantané)
- Via JavaScript (fallback)
- UX : Affiche un spinner pendant 0.1 seconde

### 2. Workflow GitHub Actions

Le fichier `.github/workflows/pages.yml` :
- Se déclenche à chaque push sur `main`
- Upload tout le contenu du repository
- Déploie sur GitHub Pages
- Déploiement automatique en ~1-2 minutes

### 3. Fichier .nojekyll

Le fichier `.nojekyll` :
- Désactive Jekyll (générateur de sites statiques de GitHub)
- Préserve la structure de dossiers (`_` et autres)
- Permet d'avoir des dossiers comme `assets/`, `pages/` sans transformation

---

## 🔧 Configuration Optionnelle

### Domaine Personnalisé (Optionnel)

Si vous avez un domaine personnalisé (ex: `planb-crm.com`) :

1. **Créer un fichier CNAME**
   ```bash
   echo "votredomaine.com" > CNAME
   git add CNAME
   git commit -m "Add custom domain"
   git push
   ```

2. **Configurer le DNS**
   - Chez votre registrar de domaine (OVH, Gandi, etc.)
   - Ajouter un enregistrement CNAME :
     ```
     www.votredomaine.com → checkpointsip.github.io
     ```
   - Ou un enregistrement A pour le domaine apex :
     ```
     votredomaine.com → 185.199.108.153
     votredomaine.com → 185.199.109.153
     votredomaine.com → 185.199.110.153
     votredomaine.com → 185.199.111.153
     ```

3. **Activer dans GitHub**
   - Settings > Pages > Custom domain
   - Entrer votre domaine
   - Cocher "Enforce HTTPS"

### HTTPS Automatique

GitHub Pages active automatiquement HTTPS (certificat Let's Encrypt gratuit) :
- ✅ Pour les URLs `*.github.io`
- ✅ Pour les domaines personnalisés (après configuration DNS)

---

## 🚨 Limitations à Connaître

### Backend Non Supporté

GitHub Pages est **statique uniquement** :
- ❌ `api-server.js` ne fonctionnera PAS
- ❌ Pas de Node.js côté serveur
- ❌ Pas de base de données

**Solutions :**

1. **Pour le panel admin** (sans backend) :
   - Le tracking analytics fonctionne en mode **LocalStorage**
   - Les données restent dans le navigateur de l'utilisateur
   - Parfait pour un portfolio ou démo

2. **Pour un backend complet** :
   - Héberger le backend séparément :
     - **Heroku** (gratuit)
     - **Vercel** (gratuit)
     - **Railway** (gratuit)
     - **Render** (gratuit)
   - Modifier `analytics-tracker.js` pour pointer vers l'API externe

### Fichiers Sensibles

⚠️ **ATTENTION : Le site est PUBLIC** (même si le dépôt est privé)

**Fichiers automatiquement exclus par .gitignore :**
- ✅ `.env` (pas versionné, pas déployé)
- ✅ `node_modules/` (pas versionné)
- ✅ `analytics-data/` (pas versionné)
- ✅ `logs/` (pas versionné)

**Fichiers déployés (publics) :**
- ✅ Tout le code HTML/CSS/JS
- ✅ Documentation dans `/docs/`
- ⚠️ `package.json` (visible mais sans danger)
- ⚠️ Code source JavaScript (visible mais obfusqué après build)

---

## 📊 Après le Déploiement

### Vérification

1. **Tester la page principale**
   ```
   https://checkpointsip.github.io/site_vitrine/
   ```

2. **Tester le panel admin**
   ```
   https://checkpointsip.github.io/site_vitrine/pages/admin.html
   ```
   - Login : `admin` / `admin123`
   - Mode LocalStorage (données dans le navigateur)

3. **Tester le responsive**
   - Ouvrir les DevTools (F12)
   - Tester différentes tailles d'écran

### Analytics

**Mode LocalStorage uniquement :**
- Les données analytics sont stockées dans le navigateur
- Chaque visiteur a ses propres données
- Parfait pour une démo ou portfolio
- Pour de vraies analytics, utiliser Google Analytics

### Mises à Jour

Pour mettre à jour le site :

```bash
# Modifier vos fichiers
# ...

# Commit et push
git add -A
git commit -m "Update site content"
git push

# GitHub Actions redéploie automatiquement en ~1-2 min
```

---

## 🎯 Alternatives avec Backend

Si vous avez besoin du backend complet :

### Option 1 : Heroku (Backend séparé)

```bash
# Frontend sur GitHub Pages
# Backend sur Heroku

# Modifier analytics-tracker.js :
const API_URL = 'https://votre-app.herokuapp.com/api';
```

### Option 2 : Vercel (Full Stack)

```bash
# Déployer tout sur Vercel (frontend + backend)
npm install -g vercel
vercel deploy
```

### Option 3 : Netlify (Full Stack)

```bash
# Déployer tout sur Netlify
npm install -g netlify-cli
netlify deploy
```

---

## 📝 Checklist de Déploiement

Avant de déployer en production :

- [ ] Commiter et pusher tous les fichiers
- [ ] Activer GitHub Pages dans Settings
- [ ] Attendre le déploiement (Actions)
- [ ] Tester l'URL GitHub Pages
- [ ] Vérifier le responsive
- [ ] Tester tous les liens
- [ ] Vérifier les formulaires (mode démo)
- [ ] Tester le dark mode
- [ ] Vérifier le panel admin (LocalStorage)
- [ ] Configurer domaine personnalisé (optionnel)
- [ ] Activer HTTPS (automatique)
- [ ] Ajouter à Google Search Console (SEO)

---

## 🆘 Dépannage

### Le site ne se charge pas

1. Vérifier que le workflow Actions est vert ✅
2. Attendre 5 minutes (propagation CDN)
3. Vider le cache du navigateur (Ctrl+Shift+R)
4. Vérifier les logs dans Actions

### Erreur 404

- Vérifier que `index.html` existe à la racine
- Vérifier que `.nojekyll` est présent
- Vérifier la configuration dans Settings > Pages

### CSS/JS ne se chargent pas

- Vérifier les chemins relatifs dans les HTML
- Tous les chemins doivent commencer par `../` ou être absolus
- Vérifier dans DevTools (F12 > Network)

### Le panel admin ne fonctionne pas

- Normal : mode LocalStorage uniquement
- Les données restent dans le navigateur
- Pour un backend complet, utiliser Heroku/Vercel

---

## 📞 Support

- **GitHub Pages Docs :** https://docs.github.com/pages
- **GitHub Actions Docs :** https://docs.github.com/actions
- **Votre documentation :** `docs/` dans le repository

---

**Prêt à déployer !** 🚀

Suivez les étapes ci-dessus et votre site sera en ligne en 5 minutes.
