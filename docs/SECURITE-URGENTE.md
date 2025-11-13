# 🚨 ACTIONS DE SÉCURITÉ URGENTES

## ⚠️ PROBLÈME CRITIQUE DÉTECTÉ

Le fichier `.env` contenant vos secrets (JWT_SECRET, mots de passe hashés) est actuellement tracké par Git et potentiellement visible dans votre historique de commits.

---

## 🔧 SOLUTION : Supprimer .env de Git (3 étapes)

### Étape 1 : Retirer .env du tracking Git

```bash
# Retirer le fichier du tracking sans le supprimer localement
git rm --cached .env

# Vérifier que le fichier est bien retiré
git status
```

Vous devriez voir `.env` dans les "Changes to be committed" comme "deleted".

### Étape 2 : Commit la suppression

```bash
git add .gitignore
git commit -m "Security: Remove .env from version control"
```

### Étape 3 : Push les changements

```bash
git push origin main
```

---

## 🔑 REGÉNÉRER LES SECRETS (OBLIGATOIRE)

Maintenant que le `.env` a été exposé dans Git, vous DEVEZ régénérer tous les secrets :

### 1. Nouveau JWT_SECRET

```bash
npm run generate-secret
```

Copiez le nouveau secret dans `.env` :
```env
JWT_SECRET=<nouveau_secret_généré>
```

### 2. Nouveau mot de passe admin

```bash
npm run hash-password VotreNouveauMotDePasseSecurise123!
```

Copiez le hash dans `.env` :
```env
ADMIN_PASSWORD_HASH=<nouveau_hash_généré>
```

### 3. Mettre à jour .env

Éditez `.env` et remplacez les anciennes valeurs par les nouvelles.

---

## 📋 NETTOYAGE HISTORIQUE GIT (AVANCÉ)

Si vous voulez **supprimer complètement** `.env` de l'historique Git (recommandé pour éviter que les anciens secrets soient accessibles) :

### ⚠️ ATTENTION : Cette opération réécrit l'historique Git

```bash
# Installer BFG Repo Cleaner (plus simple que git filter-branch)
# Télécharger depuis : https://rtyley.github.io/bfg-repo-cleaner/

# OU utiliser git filter-branch (natif)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Forcer le push (⚠️ réécrit l'historique distant)
git push origin --force --all
git push origin --force --tags
```

### Alternative : Utiliser BFG (plus rapide et sûr)

```bash
# Télécharger bfg.jar depuis https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --delete-files .env

# Nettoyer le repo
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push forcé
git push origin --force --all
```

---

## 📄 CRÉER .env.example (TEMPLATE SANS SECRETS)

Créez un fichier `.env.example` pour documenter les variables nécessaires :

```bash
# Copier .env vers .env.example
cp .env .env.example
```

Éditez `.env.example` et remplacez les valeurs sensibles par des exemples :

```env
# .env.example - Template de configuration (SANS SECRETS RÉELS)

# SERVEUR
PORT=3000
NODE_ENV=development

# SÉCURITÉ JWT (⚠️ GÉNÉRER UN NOUVEAU SECRET AVEC: npm run generate-secret)
JWT_SECRET=CHANGEZ_MOI_UTILISEZ_npm_run_generate-secret
JWT_EXPIRATION=28800
JWT_REFRESH_EXPIRATION=604800

# AUTHENTIFICATION ADMIN (⚠️ GÉNÉRER UN HASH AVEC: npm run hash-password VotreMotDePasse)
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=CHANGEZ_MOI_UTILISEZ_npm_run_hash-password

# STOCKAGE
DATA_DIR=./analytics-data

# LOGS
LOG_LEVEL=info
LOG_DIR=./logs

# RATE LIMITING
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_WINDOW=900000
AUTH_RATE_LIMIT_MAX=5

# CORS (Séparer par virgules)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# SESSION
SESSION_TIMEOUT=1800000

# ANALYTICS
API_ENDPOINT=/api/analytics
AUTO_SEND_INTERVAL=30000
LOCALSTORAGE_LIMIT=1000
```

Commitez ce template :

```bash
git add .env.example
git commit -m "Docs: Add .env.example template"
git push
```

---

## 🔒 BONNES PRATIQUES POUR LA SUITE

### 1. Ne JAMAIS commiter de secrets

Vérifiez toujours avant de commit :
```bash
git status
git diff
```

### 2. Utiliser des secrets différents par environnement

- **Développement** : `.env` (local uniquement)
- **Production** : Variables d'environnement serveur (Heroku, AWS, etc.)

### 3. Rotation des secrets

Changez vos secrets régulièrement (tous les 6-12 mois) :
- JWT_SECRET
- Mots de passe admin
- Clés API tierces

### 4. Utiliser un gestionnaire de secrets (production)

Pour la production, utilisez :
- **HashiCorp Vault**
- **AWS Secrets Manager**
- **Azure Key Vault**
- **Google Secret Manager**

### 5. Audit de sécurité

```bash
# Vérifier qu'aucun fichier sensible n'est tracké
git ls-files | grep -E '\.(env|key|pem|p12)$'

# Si des fichiers apparaissent, les retirer :
git rm --cached <fichier>
```

---

## 📊 CHECKLIST DE SÉCURITÉ

Après avoir appliqué ces corrections :

- [ ] `.env` retiré du tracking Git (`git rm --cached .env`)
- [ ] Nouveau `JWT_SECRET` généré et configuré
- [ ] Nouveau mot de passe admin généré et configuré
- [ ] `.env.example` créé et committé
- [ ] Historique Git nettoyé (optionnel mais recommandé)
- [ ] Serveur redémarré avec les nouveaux secrets
- [ ] Test de connexion admin avec le nouveau mot de passe
- [ ] Documentation mise à jour (README, INSTALLATION.md)

---

## 🧪 TESTER LES NOUVEAUX SECRETS

### Test 1 : Connexion admin

1. Arrêter le serveur : `Ctrl+C`
2. Redémarrer : `npm start`
3. Ouvrir : `http://localhost:3000/admin.html`
4. Se connecter avec le nouveau mot de passe
5. ✅ Connexion réussie → Secrets OK

### Test 2 : JWT valide

```bash
# Dans la console navigateur (après login)
console.log(document.cookie); // Devrait afficher auth_token
```

---

## 📚 RESSOURCES

- **Secrets dans Git** : https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository
- **BFG Repo Cleaner** : https://rtyley.github.io/bfg-repo-cleaner/
- **OWASP Secrets Management** : https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- **Git Filter-Branch** : https://git-scm.com/docs/git-filter-branch

---

## 🚨 EN CAS DE COMPROMISSION

Si vous suspectez que vos secrets ont été compromis (repo public, leak, etc.) :

1. **IMMÉDIATEMENT** : Régénérer TOUS les secrets
2. **IMMÉDIATEMENT** : Révoquer les tokens JWT actifs
3. Forcer la déconnexion de tous les utilisateurs
4. Auditer les logs d'accès (`logs/auth.log`, `logs/auth-failures.log`)
5. Changer tous les mots de passe liés au projet
6. Notifier votre équipe

---

**Date de création** : 12 novembre 2025
**Priorité** : 🔴 CRITIQUE
**À effectuer** : IMMÉDIATEMENT

---

Besoin d'aide ? Consultez la documentation officielle ou contactez un expert en sécurité.
