# 🔒 GUIDE DE SÉCURITÉ - PLAN B CRM

Ce document détaille toutes les mesures de sécurité implémentées dans Plan B CRM et comment les gérer.

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble de la sécurité](#vue-densemble)
2. [Authentification JWT](#authentification-jwt)
3. [Gestion des mots de passe](#gestion-des-mots-de-passe)
4. [Protection CORS](#protection-cors)
5. [Rate Limiting](#rate-limiting)
6. [Validation des données](#validation-des-données)
7. [Logs de sécurité](#logs-de-sécurité)
8. [Bonnes pratiques de déploiement](#bonnes-pratiques)
9. [FAQ Sécurité](#faq-sécurité)

---

## 🛡️ VUE D'ENSEMBLE

### Mesures de sécurité implémentées

✅ **Authentification JWT** - Tokens signés avec expiration automatique
✅ **Hachage bcrypt** - Mots de passe hashés avec 10 rounds de salage
✅ **CORS restreint** - Liste blanche de domaines autorisés
✅ **Rate limiting** - Protection contre force brute et DDoS
✅ **Validation stricte** - Toutes les données entrantes sont validées
✅ **Logs d'authentification** - Traçabilité complète des accès
✅ **Cookies httpOnly** - Tokens stockés dans des cookies sécurisés
✅ **Token refresh** - Renouvellement automatique avant expiration

### Architecture de sécurité

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ HTTPS (en production)
       ▼
┌─────────────────────────────────────┐
│         Express Server              │
│  ┌──────────────────────────────┐  │
│  │ 1. CORS Check                │  │
│  │ 2. Rate Limiting             │  │
│  │ 3. Body Parsing              │  │
│  │ 4. Cookie Parsing            │  │
│  │ 5. Request Logging           │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Routes Authentification    │  │
│  │   - POST /api/auth/login     │  │
│  │   - POST /api/auth/refresh   │  │
│  │   - POST /api/auth/logout    │  │
│  │   - GET  /api/auth/verify    │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   Routes Protégées (JWT)     │  │
│  │   - GET  /api/analytics/*    │  │
│  │   - DELETE /api/analytics/*  │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────┐
│    Logs     │
│  (Winston)  │
└─────────────┘
```

---

## 🔐 AUTHENTIFICATION JWT

### Comment ça fonctionne

1. **Login** : L'admin envoie username + password
2. **Vérification** : Le serveur vérifie avec bcrypt
3. **Génération tokens** : Si valide, génère :
   - **Access token** (8 heures) - Pour accéder aux routes protégées
   - **Refresh token** (7 jours) - Pour renouveler l'access token
4. **Stockage** : Tokens stockés dans des **cookies httpOnly** (invisible au JavaScript côté client)
5. **Auto-refresh** : Le frontend rafraîchit automatiquement le token 5 minutes avant expiration

### Fichiers concernés

- **Backend** : `server/auth.js` - Logique JWT
- **Frontend** : `admin-dashboard.js` - Gestion auth côté client
- **Configuration** : `.env` - Secrets et durées

### Configuration dans .env

```env
# Durée de validité du JWT (en secondes)
JWT_EXPIRATION=28800       # 8 heures

# Durée du refresh token (en secondes)
JWT_REFRESH_EXPIRATION=604800  # 7 jours

# Secret pour signer les JWT (TRÈS IMPORTANT - NE JAMAIS PARTAGER)
JWT_SECRET=votre-secret-de-64-bytes-en-hex
```

### Générer un nouveau JWT_SECRET

**Important** : Changez le JWT_SECRET en production !

```bash
npm run generate-secret
```

Copiez la valeur générée dans votre fichier `.env`.

⚠️ **Attention** : Changer le JWT_SECRET invalide tous les tokens existants. Les utilisateurs devront se reconnecter.

---

## 🔑 GESTION DES MOTS DE PASSE

### Comment sont stockés les mots de passe

Les mots de passe ne sont **JAMAIS** stockés en clair. Voici le processus :

1. **Hash bcrypt** - Le mot de passe est hashé avec 10 rounds de salage
2. **Stockage** - Seul le hash est stocké dans `.env`
3. **Vérification** - À chaque login, bcrypt compare le mot de passe saisi avec le hash

### Changer le mot de passe admin

**Méthode 1 - Via npm script (recommandé)**

```bash
npm run hash-password "MonNouveauMotDePasse123!"
```

Copiez le hash généré dans `.env` :

```env
ADMIN_PASSWORD_HASH=$2b$10$abc...xyz
```

**Méthode 2 - Manuellement avec Node.js**

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('MonNouveauMotDePasse', 10, (err, hash) => console.log(hash));"
```

### Politique de mots de passe recommandée

Pour un mot de passe fort :
- ✅ Minimum 12 caractères
- ✅ Mélange de majuscules et minuscules
- ✅ Au moins 1 chiffre
- ✅ Au moins 1 caractère spécial
- ❌ Pas de mots du dictionnaire
- ❌ Pas d'informations personnelles

**Exemples de bons mots de passe** :
- `P@$$w0rd_2024_Secure!`
- `MyC0mpl3x&Str0ng#Pass`
- `4Dm!n_S3cur3_2024`

---

## 🌐 PROTECTION CORS

### Qu'est-ce que CORS ?

CORS (Cross-Origin Resource Sharing) empêche des sites malveillants d'accéder à votre API.

### Configuration actuelle

Par défaut, seules ces origines sont autorisées :
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- `https://votredomaine.fr`
- `https://www.votredomaine.fr`

### Ajouter une nouvelle origine autorisée

Éditez le fichier `.env` :

```env
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://votredomaine.fr,https://www.votredomaine.fr,https://staging.votredomaine.fr
```

**Format** : Origines séparées par des virgules, **sans espaces**.

### Fichiers concernés

- **Configuration** : `.env` - Variable `ALLOWED_ORIGINS`
- **Implémentation** : `api-server.js:28-46` - Logique CORS

### Tester CORS

```bash
curl -H "Origin: http://malicious-site.com" http://localhost:3000/api/analytics/stats
# Devrait retourner une erreur CORS
```

---

## 🚦 RATE LIMITING

### Protection contre les attaques

Le rate limiting empêche :
- ✅ **Force brute** - Trop de tentatives de login
- ✅ **DDoS** - Surcharge du serveur
- ✅ **Spam** - Requêtes abusives

### Limites configurées

**API générale** :
- **100 requêtes** par IP toutes les **15 minutes**

**Authentification** :
- **5 tentatives** de login par IP toutes les **15 minutes**

### Configuration dans .env

```env
# Fenêtre de temps (en millisecondes)
RATE_LIMIT_WINDOW=900000    # 15 minutes

# Nombre max de requêtes
RATE_LIMIT_MAX=100
```

### Ajuster les limites

**Pour un site à fort trafic** :

```env
RATE_LIMIT_MAX=500          # 500 requêtes/15min
```

**Pour plus de sécurité** :

```env
RATE_LIMIT_MAX=50           # 50 requêtes/15min
```

### Fichiers concernés

- **Implémentation** : `api-server.js:51-84` - Configuration rate limiting

---

## ✅ VALIDATION DES DONNÉES

### Pourquoi valider ?

La validation protège contre :
- ❌ **Injection SQL** - Données malveillantes
- ❌ **XSS** - Scripts malveillants
- ❌ **Buffer overflow** - Données trop grandes

### Ce qui est validé

Toutes les données entrantes sont validées avec `express-validator` :

**POST /api/auth/login** :
```javascript
username: string, non vide, trimmed
password: string, non vide
```

**POST /api/analytics** :
```javascript
events: array, non vide
sessionId: string, non vide
userId: string, non vide
timestamp: integer
```

**GET /api/analytics/:type** :
```javascript
type: string, regex /^[a-z_]+$/
limit: integer (1-100000), optionnel
offset: integer (>= 0), optionnel
startDate: ISO8601 date, optionnel
endDate: ISO8601 date, optionnel
```

### Fichiers concernés

- **Implémentation** : `api-server.js` - Toutes les routes avec `[body(...), query(...)]`

---

## 📝 LOGS DE SÉCURITÉ

### Qu'est-ce qui est loggé ?

Le système enregistre :

| Événement | Fichier | Informations |
|-----------|---------|--------------|
| Login succès | `auth.log` | username, IP, user-agent, timestamp |
| Login échec | `auth.log` + `auth-failures.log` | username tenté, IP, raison |
| Token refresh | `auth.log` | username, IP, timestamp |
| Logout | `auth.log` | username, IP, timestamp |
| Accès protégé | `api.log` | route, username, IP, timestamp |
| Export données | `api.log` | format, username, IP, timestamp |
| Suppression données | `api.log` | username, IP, timestamp, severity:high |
| Erreurs système | `error.log` | stack trace, contexte |

### Consulter les logs

**Tous les logs d'authentification** :

```bash
cat logs/auth.log
```

**Seulement les échecs de login** :

```bash
cat logs/auth-failures.log
```

**Logs en temps réel** :

```bash
tail -f logs/auth.log
```

**Rechercher une IP spécifique** :

```bash
grep "192.168.1.100" logs/auth.log
```

### Format des logs

Les logs sont au format JSON pour faciliter le parsing :

```json
{
  "timestamp": "2025-11-12 14:30:15",
  "level": "info",
  "message": "Login successful",
  "event": "login_success",
  "username": "admin",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "method": "POST",
  "path": "/api/auth/login"
}
```

### Rotation automatique

Les logs sont automatiquement rotationnés :
- **Taille max** : 10MB par fichier
- **Fichiers gardés** : 5 versions
- **Comportement** : Quand un fichier atteint 10MB, il est renommé `.1`, puis `.2`, etc.

### Fichiers concernés

- **Implémentation** : `server/logger.js` - Système de logs winston
- **Stockage** : `logs/` - Dossier des logs

---

## 🚀 BONNES PRATIQUES DE DÉPLOIEMENT

### Checklist avant la production

- [ ] **1. Changer le JWT_SECRET**
  ```bash
  npm run generate-secret
  ```

- [ ] **2. Changer le mot de passe admin**
  ```bash
  npm run hash-password "VotreMotDePasseForт"
  ```

- [ ] **3. Configurer HTTPS**
  ```env
  NODE_ENV=production
  # Activer les cookies secure
  ```

- [ ] **4. Restreindre CORS**
  ```env
  ALLOWED_ORIGINS=https://votredomaine.fr,https://www.votredomaine.fr
  ```

- [ ] **5. Désactiver DEBUG_MODE**
  ```env
  DEBUG_MODE=false
  ```

- [ ] **6. Vérifier .gitignore**
  ```bash
  # S'assurer que .env et logs/ sont ignorés
  cat .gitignore
  ```

- [ ] **7. Configurer le firewall**
  ```bash
  # Autoriser seulement le port HTTPS (443)
  ufw allow 443/tcp
  ufw deny 3000/tcp  # Bloquer accès direct à Node.js
  ```

- [ ] **8. Utiliser un reverse proxy (Nginx/Apache)**
  ```nginx
  # Exemple Nginx
  server {
      listen 443 ssl;
      server_name votredomaine.fr;

      ssl_certificate /path/to/cert.pem;
      ssl_certificate_key /path/to/key.pem;

      location / {
          proxy_pass http://localhost:3000;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
      }
  }
  ```

- [ ] **9. Monitorer les logs**
  ```bash
  # Configurer logrotate ou équivalent
  # Alertes sur les échecs de login multiples
  ```

- [ ] **10. Sauvegardes régulières**
  ```bash
  # Sauvegarder analytics-data/ et logs/
  ```

### Environnements recommandés

**Développement** :
```env
NODE_ENV=development
DEBUG_MODE=true
ALLOWED_ORIGINS=http://localhost:3000
JWT_EXPIRATION=28800
```

**Staging** :
```env
NODE_ENV=staging
DEBUG_MODE=true
ALLOWED_ORIGINS=https://staging.votredomaine.fr
JWT_EXPIRATION=28800
```

**Production** :
```env
NODE_ENV=production
DEBUG_MODE=false
ALLOWED_ORIGINS=https://votredomaine.fr,https://www.votredomaine.fr
JWT_EXPIRATION=28800
```

---

## ❓ FAQ SÉCURITÉ

### Q1 : Les tokens JWT sont-ils vraiment sécurisés ?

**R :** Oui, si bien configurés :
- ✅ Secret de 64 bytes (512 bits) très difficile à bruteforce
- ✅ Expiration courte (8h) limite la fenêtre d'attaque
- ✅ Cookies httpOnly empêchent le vol par XSS
- ✅ sameSite='strict' protège contre CSRF

### Q2 : Que se passe-t-il si mon JWT_SECRET est compromis ?

**R :** Si un attaquant obtient votre JWT_SECRET :
1. Il peut générer des tokens valides
2. **Action immédiate** : Changez le JWT_SECRET
3. Tous les utilisateurs devront se reconnecter
4. Vérifiez les logs pour détecter les accès suspects

### Q3 : Puis-je avoir plusieurs admins ?

**R :** Actuellement, le système supporte 1 seul admin (stocké dans `.env`).

**Pour plusieurs admins**, il faudrait :
1. Migrer vers une base de données (MongoDB/PostgreSQL)
2. Créer une table `users`
3. Ajouter une interface de gestion des utilisateurs

### Q4 : Comment détecter une attaque en cours ?

**R :** Surveillez les logs pour :
- ❌ Multiples échecs de login depuis la même IP
- ❌ Tentatives de login avec des usernames variés
- ❌ Rate limit dépassé fréquemment
- ❌ Accès aux routes protégées sans token

**Commande utile** :
```bash
# Compter les échecs de login par IP
cat logs/auth-failures.log | grep -o '"ip":"[^"]*"' | sort | uniq -c | sort -rn
```

### Q5 : Les mots de passe sont-ils vraiment sécurisés avec bcrypt ?

**R :** Oui, bcrypt est un algorithme de hachage spécialement conçu pour les mots de passe :
- ✅ **Salage automatique** - Chaque hash est unique
- ✅ **Slow by design** - Ralentit les attaques bruteforce
- ✅ **10 rounds** - Équilibre sécurité/performance
- ✅ **Résistant aux GPU** - Difficile à paralléliser

Un hash bcrypt avec 10 rounds prend ~100ms à calculer. Une attaque bruteforce prendrait des **millénaires** pour tester toutes les combinaisons.

### Q6 : Puis-je utiliser ce système avec HTTPS ?

**R :** Absolument ! En production, HTTPS est **obligatoire**.

1. Obtenez un certificat SSL (Let's Encrypt gratuit)
2. Configurez dans `.env` :
   ```env
   NODE_ENV=production
   SSL_CERT_PATH=/path/to/cert.pem
   SSL_KEY_PATH=/path/to/key.pem
   ```
3. Les cookies seront automatiquement marqués `secure`

### Q7 : Que faire en cas de fuite du fichier .env ?

**R :** **Action immédiate** :
1. ✅ Changez immédiatement le JWT_SECRET
2. ✅ Changez le mot de passe admin
3. ✅ Vérifiez les logs pour accès suspects
4. ✅ Révoquez tous les tokens (redémarrez le serveur)
5. ✅ Ajoutez .env au .gitignore (s'il n'y est pas déjà)

### Q8 : Les logs peuvent-ils contenir des données sensibles ?

**R :** Non, le système est conçu pour **ne jamais** logger :
- ❌ Mots de passe
- ❌ Tokens JWT
- ❌ Cookies

Les logs contiennent seulement :
- ✅ Usernames
- ✅ IPs
- ✅ Timestamps
- ✅ Routes accédées
- ✅ User-agents

---

## 📞 SUPPORT SÉCURITÉ

Si vous découvrez une faille de sécurité :

1. **NE PAS** créer une issue publique sur GitHub
2. Envoyez un email à : `security@votredomaine.fr`
3. Incluez :
   - Description de la faille
   - Steps to reproduce
   - Impact potentiel
   - Votre solution proposée (optionnel)

---

## 📚 RESSOURCES ADDITIONNELLES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/rfc8725)
- [bcrypt Explained](https://en.wikipedia.org/wiki/Bcrypt)
- [CORS in Detail](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies)

---

**Version** : 2.0.0
**Dernière mise à jour** : 2025-11-12
**Auteur** : Plan B CRM Security Team
