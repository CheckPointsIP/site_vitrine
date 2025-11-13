# Plan B CRM - Site Vitrine avec Analytics

> Site vitrine professionnel avec système d'analytics intégré

## Structure du Projet

```
/
├── pages/                  # Pages HTML
│   ├── index.html         # Page d'accueil
│   ├── admin.html         # Panel administrateur
│   ├── contact.html       # Page contact
│   ├── demo.html          # Demande de démo
│   ├── decouvrir.html     # Découvrir le CRM
│   ├── pricing-monolithe.html  # Détails techniques
│   ├── confidentialite.html    # Politique de confidentialité
│   ├── manifest.json      # PWA manifest
│   ├── robots.txt         # SEO robots
│   └── sitemap.xml        # Sitemap SEO
│
├── assets/                # Assets statiques
│   ├── js/               # JavaScript
│   │   ├── admin-dashboard.js
│   │   ├── analytics-tracker.js
│   │   ├── cookie-consent.js
│   │   ├── script.js
│   │   ├── service-worker.js
│   │   └── sw-register.js
│   ├── css/              # CSS
│   │   ├── styles.css
│   │   └── cookie-consent.css
│   └── images/           # Images (vide actuellement)
│
├── server/               # Backend
│   ├── auth.js          # Authentification JWT
│   └── logger.js        # Logging Winston
│
├── scripts/              # Scripts utilitaires
│   ├── build.js         # Build et minification
│   ├── integrate-cookies.js
│   ├── optimize-images.js
│   └── test-security.js
│
├── docs/                 # Documentation
│   ├── START-HERE.md    # Démarrage rapide
│   ├── ANALYTICS-README.md
│   ├── INSTALLATION.md
│   ├── GUIDE-UTILISATION.md
│   └── ... (12 fichiers)
│
├── config/               # Configuration
│   ├── start-server.bat # Démarrage Windows
│   └── start-server.sh  # Démarrage Linux/Mac
│
├── dist/                 # Build output (généré)
├── analytics-data/       # Données analytics
├── logs/                 # Logs applicatifs
│
├── api-server.js         # Serveur Express
├── package.json          # Dépendances npm
└── README.md            # Ce fichier
```

## Démarrage Rapide

### 1. Installation

```bash
npm install
```

### 2. Démarrer le site

**Option A : Sans serveur (LocalStorage)**
- Ouvrir `pages/index.html` dans un navigateur

**Option B : Avec serveur Node.js**
```bash
npm start
```
Le site sera accessible à `http://localhost:3000`

### 3. Accéder au panel analytics

- Ouvrir `pages/admin.html`
- Identifiants par défaut : `admin` / `admin123`
- ⚠️ **À changer avant production !**

## Scripts NPM Disponibles

```bash
npm start              # Démarrer le serveur
npm run dev            # Mode développement (nodemon)
npm run build          # Build et minification
npm run test:security  # Tests de sécurité
npm run optimize-images # Optimiser les images
```

## Documentation

📚 **Documentation complète disponible dans `/docs/`**

- **START-HERE.md** : Démarrage rapide (5 min)
- **INSTALLATION.md** : Installation détaillée
- **GUIDE-UTILISATION.md** : Guide utilisateur du panel
- **ANALYTICS-README.md** : Documentation technique complète
- **INDEX-DOCUMENTATION.md** : Navigation dans la documentation

## Fonctionnalités

### Site Vitrine
- ✅ Design Bauhaus moderne
- ✅ Responsive (Desktop, Tablet, Mobile)
- ✅ Dark mode intégré
- ✅ PWA (Progressive Web App)
- ✅ SEO optimisé
- ✅ RGPD compliant (consentement cookies)

### Panel Analytics
- ✅ Tracking automatique des interactions
- ✅ Dashboard avec 7 sections
- ✅ Graphiques interactifs (Chart.js)
- ✅ Export JSON/CSV
- ✅ Filtres par date
- ✅ Temps réel

### Backend
- ✅ Serveur Express sécurisé
- ✅ Authentification JWT
- ✅ Rate limiting
- ✅ Validation des données
- ✅ Logs structurés (Winston)

## Technologies

- **Frontend :** HTML5, CSS3, JavaScript (Vanilla)
- **Backend :** Node.js, Express
- **Base de données :** LocalStorage (client) + JSONL (serveur)
- **Build :** Terser, CleanCSS
- **Sécurité :** JWT, bcrypt, CORS, Rate limiting

## Configuration

### Variables d'environnement

Copier `.env.example` vers `.env` et configurer :

```env
# Serveur
PORT=3000
NODE_ENV=development

# Sécurité
JWT_SECRET=votre_secret_jwt_128_caracteres
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=votre_hash_bcrypt

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Générer des credentials sécurisés

```bash
# Générer un JWT secret
npm run generate-secret

# Hasher un mot de passe
npm run hash-password VotreMotDePasse123!
```

## Avant la Production

⚠️ **ACTIONS CRITIQUES**

1. **Changer les credentials admin**
   ```bash
   npm run hash-password NouveauMotDePasse
   ```

2. **Générer nouveau JWT_SECRET**
   ```bash
   npm run generate-secret
   ```

3. **Activer HTTPS** (Let's Encrypt gratuit)

4. **Protéger admin.html** (.htaccess ou nginx auth)

5. **Configurer CORS** (domaines autorisés)

📖 Voir `docs/SECURITE-URGENTE.md` pour tous les détails

## Hébergement

### Options recommandées

- **Netlify** : Gratuit, simple, CI/CD
- **Vercel** : Gratuit, ultra-rapide
- **Heroku** : Pour Node.js + backend
- **OVH / Hostinger** : Hébergement classique

### Déploiement

```bash
# Build pour production
npm run build

# Démarrer en mode production
npm run start:prod
```

## Support

- **Issues :** Consulter la documentation dans `/docs/`
- **Questions :** Voir `docs/GUIDE-UTILISATION.md` (FAQ)
- **Sécurité :** Voir `docs/SECURITE-URGENTE.md`

## Licence

Propriétaire - Plan B CRM

---

**Version :** 1.0.0
**Dernière mise à jour :** Novembre 2025
