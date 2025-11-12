# 🔒 SÉCURITÉ - GUIDE RAPIDE

Ce guide résume les mesures de sécurité implémentées dans Plan B CRM v2.0.

---

## ✅ MESURES IMPLÉMENTÉES

| Sécurité | Status | Description |
|----------|--------|-------------|
| **JWT Authentication** | ✅ Actif | Tokens signés, expiration 8h, refresh automatique |
| **Hachage bcrypt** | ✅ Actif | 10 rounds, salage automatique |
| **CORS restreint** | ✅ Actif | Liste blanche de domaines |
| **Rate Limiting** | ✅ Actif | 100 req/15min (API), 5 req/15min (auth) |
| **Validation stricte** | ✅ Actif | express-validator sur toutes les routes |
| **Logs structurés** | ✅ Actif | Winston, JSON format, rotation automatique |
| **Cookies httpOnly** | ✅ Actif | Tokens invisibles au JavaScript |

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration du .env

Le fichier `.env` est déjà créé avec :
- ✅ Hash bcrypt du mot de passe `admin123`
- ✅ JWT_SECRET aléatoire de 512 bits
- ✅ CORS configuré pour localhost + production
- ✅ Rate limiting : 100 req/15min

**⚠️ EN PRODUCTION** : Changez les credentials !

```bash
# Générer un nouveau JWT secret
npm run generate-secret

# Générer un hash pour un nouveau mot de passe
npm run hash-password "VotreNouveauMotDePasse"
```

### 3. Démarrer le serveur

```bash
npm start
```

Le serveur affichera :

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Plan B CRM Analytics Server (SECURED)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server running on http://localhost:3000
🛡️  JWT authentication: ENABLED
🚦 Rate limiting: 100 req/15min
🌐 CORS: 4 origins allowed
📝 Logs directory: C:\...\logs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Tester la sécurité

```bash
npm run test:security
```

Tous les tests doivent passer (✓).

---

## 🔑 CONNEXION ADMIN

### Credentials par défaut

**⚠️ À CHANGER EN PRODUCTION !**

- **Username** : `admin`
- **Password** : `admin123`

### Se connecter

1. Ouvrez [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
2. Entrez les credentials
3. Le token JWT est automatiquement stocké dans un cookie httpOnly
4. Session valide 8 heures, refresh automatique

---

## 📊 ROUTES API

### Routes publiques (pas d'auth)

```bash
POST /api/analytics              # Recevoir données analytics
```

### Routes authentifiées (JWT requis)

```bash
POST /api/auth/login             # Login admin
POST /api/auth/refresh           # Rafraîchir token
POST /api/auth/logout            # Déconnexion
GET  /api/auth/verify            # Vérifier token

GET  /api/analytics/stats        # Statistiques
GET  /api/analytics/:type        # Données par type
GET  /api/analytics/export/json  # Export JSON
DELETE /api/analytics/clear      # Supprimer données (+ token confirmation)
```

---

## 📝 CONSULTER LES LOGS

### Logs d'authentification

```bash
# Tous les événements d'auth
cat logs/auth.log

# Seulement les échecs
cat logs/auth-failures.log

# En temps réel
tail -f logs/auth.log
```

### Logs API

```bash
# Toutes les requêtes API
cat logs/api.log

# En temps réel
tail -f logs/api.log
```

### Logs d'erreurs

```bash
# Erreurs système
cat logs/error.log
```

---

## 🛠️ COMMANDES UTILES

```bash
# Démarrer le serveur
npm start

# Mode développement (auto-reload)
npm run dev

# Tests de sécurité
npm run test:security

# Générer un nouveau JWT secret
npm run generate-secret

# Générer un hash de mot de passe
npm run hash-password "MonMotDePasse123!"
```

---

## ⚙️ CONFIGURATION .env

### Variables principales

```env
# Port
PORT=3000

# Credentials admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2b$10$...   # Hash bcrypt

# JWT
JWT_SECRET=<64-bytes-hex>
JWT_EXPIRATION=28800              # 8 heures
JWT_REFRESH_EXPIRATION=604800     # 7 jours

# CORS (séparés par virgules, sans espaces)
ALLOWED_ORIGINS=http://localhost:3000,https://votredomaine.fr

# Rate Limiting
RATE_LIMIT_WINDOW=900000          # 15 min
RATE_LIMIT_MAX=100                # 100 req max

# Logs
DEBUG_MODE=true                   # false en production
LOG_LEVEL=info
```

---

## 🔒 CHECKLIST PRODUCTION

Avant de déployer en production :

- [ ] Changer `JWT_SECRET` → `npm run generate-secret`
- [ ] Changer mot de passe admin → `npm run hash-password "..."`
- [ ] Configurer `ALLOWED_ORIGINS` avec vos vrais domaines
- [ ] Mettre `DEBUG_MODE=false`
- [ ] Mettre `NODE_ENV=production`
- [ ] Configurer HTTPS (certificat SSL)
- [ ] Configurer firewall (bloquer port 3000, autoriser 443)
- [ ] Utiliser reverse proxy (Nginx/Apache)
- [ ] Monitorer les logs régulièrement
- [ ] Sauvegarder `analytics-data/` et `logs/`

---

## 🐛 DÉPANNAGE

### Erreur : JWT_SECRET must be defined

**Solution** : Le fichier `.env` n'est pas chargé.

```bash
# Vérifier que .env existe
ls -la .env

# Vérifier le contenu
cat .env | grep JWT_SECRET
```

### Erreur : Too many login attempts

**Solution** : Rate limit déclenché (5 tentatives max/15min).

Attendez 15 minutes OU redémarrez le serveur :

```bash
npm start
```

### Les cookies ne sont pas envoyés

**Solution** : Vérifiez que `credentials: 'include'` est dans les requêtes fetch.

```javascript
fetch('/api/auth/login', {
    credentials: 'include',  // ← Important !
    // ...
});
```

### CORS bloque les requêtes

**Solution** : Ajoutez votre domaine dans `ALLOWED_ORIGINS`.

```env
ALLOWED_ORIGINS=http://localhost:3000,https://votredomaine.fr,https://nouveau-domaine.fr
```

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consultez :

- **Guide complet** : `docs/SECURITY.md`
- **Installation** : `INSTALLATION.md`
- **Architecture** : `PRESENTATION-SYSTEME.md`
- **Analytics** : `ANALYTICS-README.md`

---

## 📞 SUPPORT

**Faille de sécurité détectée ?**

⚠️ **NE PAS** créer une issue publique. Envoyez un email à : `security@votredomaine.fr`

**Questions générales ?**

- GitHub Issues
- Documentation complète dans `docs/`

---

**Version** : 2.0.0 (Secured)
**Date** : 2025-11-12
**Status** : ✅ Production Ready
