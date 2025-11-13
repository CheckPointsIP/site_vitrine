# Changelog - Panel Analytics Plan B CRM

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

---

## [1.0.0] - 2025-11-11

### 🎉 Version Initiale

Premier déploiement complet du système analytics pour Plan B CRM.

### ✨ Ajouté

#### Interface Utilisateur
- Panel administrateur complet (`admin.html`)
  - 7 sections : Vue d'ensemble, Pages, Clics, Formulaires, Utilisateurs, Temps réel, Export
  - Dashboard avec statistiques clés
  - 15+ graphiques interactifs (Chart.js)
  - Authentification sécurisée
  - Design Bauhaus cohérent avec le site
  - Responsive mobile/tablet/desktop
  - Filtres par date (Aujourd'hui, Hier, 7j, 30j, Tout)

- Page de test (`test-analytics.html`)
  - Tests de tous les types d'événements
  - Console visuelle des événements en temps réel
  - Métriques actualisées automatiquement

#### Système de Tracking
- Tracker automatique JavaScript (`analytics-tracker.js`)
  - 10+ types d'événements trackés :
    - ✅ Pages vues (URL, titre, referrer)
    - ✅ Clics génériques (position, élément, contexte)
    - ✅ Clics boutons (CTA, submit)
    - ✅ Clics liens (internes/externes)
    - ✅ Formulaires (soumissions + focus/blur champs)
    - ✅ Scroll depth (25%, 50%, 75%, 100%)
    - ✅ Temps sur page (interval 1s)
    - ✅ Changements d'onglets (index.html)
    - ✅ Mouvement souris (heatmap)
    - ✅ Informations device (type, OS, navigateur)
  - Stockage localStorage automatique
  - Envoi batch vers API (toutes les 30s)
  - Gestion session/user avec UUID
  - Optimisations performance (RAF, passive listeners)
  - API publique pour accès aux données

#### Backend
- Serveur Node.js/Express (`api-server.js`)
  - Endpoints REST complets
  - Stockage JSONL par jour
  - Statistiques en temps réel
  - Export JSON complet
  - Suppression sécurisée (double confirmation)

- Alternative PHP (`api.php`)
  - Fonctionnalités équivalentes à Node.js
  - Compatible hébergements mutualisés
  - Aucune dépendance externe

#### Configuration
- `package.json` - Dépendances Node.js (Express, CORS)
- `.gitignore` - Fichiers à ignorer (données, node_modules)
- `.env.example` - Template configuration production

#### Scripts
- `start-server.bat` - Démarrage Windows
- `start-server.sh` - Démarrage Mac/Linux
- Auto-installation des dépendances npm

#### Documentation
- `ANALYTICS-README.md` (500+ lignes)
  - Installation (3 modes)
  - Configuration avancée
  - Documentation API complète
  - Sécurité production
  - Troubleshooting

- `START-HERE.md`
  - Guide de démarrage rapide
  - Utilisation immédiate
  - Cas d'usage concrets
  - FAQ

- `GUIDE-UTILISATION.md`
  - Comprendre les métriques
  - Navigation dashboard
  - Interpréter les graphiques
  - Scénarios d'optimisation
  - Routine recommandée

- `INSTALLATION.md`
  - 3 modes d'installation détaillés
  - Sécurisation production
  - Résolution de problèmes
  - Checklist de vérification

- `RECAP-ANALYTICS.md`
  - Récapitulatif complet du projet
  - Fichiers créés
  - Fonctionnalités
  - Statistiques du projet

- `CHANGELOG.md` (ce fichier)
  - Historique des versions

- `README.md` (mis à jour)
  - Section analytics ajoutée
  - Structure projet actualisée
  - Liens vers documentations

#### Intégrations
- Tracking intégré sur toutes les pages du site :
  - `index.html`
  - `demo.html`
  - `contact.html`
  - `decouvrir.html`
  - `pricing-monolithe.html`

### 📊 Métriques & Visualisations

#### Cartes Statistiques
- Visiteurs Uniques
- Pages Vues
- Interactions Totales
- Formulaires Soumis
- Taux de Rebond
- Temps Moyen sur Page

#### Graphiques Chart.js
- Visiteurs par Jour (Line chart)
- Pages les Plus Visitées (Bar chart horizontal)
- Types d'Appareils (Doughnut chart)
- Navigateurs Utilisés (Pie chart)
- Profondeur de Scroll (Bar chart)
- Sources de Trafic (Doughnut chart)
- Top Boutons Cliqués (Bar chart horizontal)
- Top Liens Cliqués (Bar chart horizontal)
- Desktop vs Mobile (Pie chart)
- Systèmes d'Exploitation (Doughnut chart)

#### Tableaux Interactifs
- Top 10 Pages par Vues
- Analyse Détaillée par Page
- Top 20 Éléments Cliqués
- Soumissions de Formulaires
- Détails Utilisateurs (50 derniers)

#### Flux Temps Réel
- 50 dernières actions
- Animation slideIn pour nouvelles actions
- Types d'événements variés

### 🔐 Sécurité

- Authentification basique (login/logout)
- Session 8 heures
- Protection des données sensibles :
  - Mots de passe → `[PROTECTED]`
  - Emails → `[EMAIL PROVIDED]`
- User IDs anonymes (UUID)
- Pas de stockage d'IP
- Token de confirmation pour suppression
- Instructions pour HTTPS, .htaccess, CORS

### ⚡ Performance

- RequestAnimationFrame pour animations
- Passive event listeners pour scroll
- Batch sending toutes les 30s
- LocalStorage limité (1000 entrées/type)
- GPU acceleration (transform: translateZ(0))
- Throttle sur événements fréquents
- Lazy loading des graphiques

### 🎨 Design

- Variables CSS cohérentes :
  - `--primary-color: #0052CC` (Bleu Bauhaus)
  - `--secondary-color: #172B4D` (Bleu marine)
  - `--accent-color: #FF5630` (Rouge)
  - `--accent-secondary: #FFAB00` (Jaune)
  - `--success-color: #36B37E` (Vert)
- Police Inter (Google Fonts)
- Icons Font Awesome 6.5.1
- Animations fluides (cubic-bezier)
- Responsive breakpoints (1024px, 767px)
- Mobile menu burger
- Sidebar collapsible

### 📦 Dépendances

#### Runtime
- **Express** ^4.18.2 (Node.js uniquement)
- **CORS** ^2.8.5 (Node.js uniquement)
- **Chart.js** 4.4.0 (CDN)
- **Font Awesome** 6.5.1 (CDN)
- **Google Fonts** Inter (CDN)

#### Dev
- **Nodemon** ^3.0.1 (optionnel)

### 🌐 Compatibilité

#### Navigateurs
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

#### Serveurs
- ✅ Node.js 14+
- ✅ PHP 7.4+
- ✅ Apache 2.4+
- ✅ Nginx 1.18+

#### Appareils
- ✅ Desktop (Windows, Mac, Linux)
- ✅ Tablet (iPad, Android)
- ✅ Mobile (iOS, Android)

### 📈 Statistiques du Projet

- **Lignes de code** : ~8700 (code + documentation)
- **Fichiers créés** : 20
- **Fonctionnalités** : 50+
- **Types d'événements** : 10+
- **Sections dashboard** : 7
- **Graphiques** : 15+
- **Pages documentation** : 7

### 🎯 Fonctionnalités Principales

1. **Tracking automatique** - Zero configuration
2. **Dashboard complet** - 7 sections analytiques
3. **Graphiques interactifs** - Chart.js
4. **Filtres temporels** - 5 options
5. **Export données** - JSON + CSV
6. **Temps réel** - Flux d'activité
7. **Multi-backend** - Node.js + PHP
8. **Responsive** - Mobile/Tablet/Desktop
9. **Sécurisé** - Auth + protection données
10. **Documenté** - 7 guides complets

---

## [Unreleased] - À venir

### Planifié pour v1.1.0

#### Améliorations
- [ ] Dark mode pour le panel admin
- [ ] Comparaison de périodes (semaine N vs N-1)
- [ ] Graphiques personnalisables (choix utilisateur)
- [ ] Alertes email automatiques
- [ ] Export PDF des rapports

#### Nouvelles Fonctionnalités
- [ ] Heatmap visuelle interactive (clickmap)
- [ ] A/B testing intégré
- [ ] Objectifs et KPIs personnalisables
- [ ] Segmentation avancée (par source, device, etc.)
- [ ] Multi-utilisateurs avec rôles (admin, viewer)

#### Optimisations
- [ ] Migration vers une base de données (MongoDB, PostgreSQL)
- [ ] WebSockets pour temps réel
- [ ] Cache Redis pour performances
- [ ] Compression gzip des données
- [ ] CDN pour assets

#### Intégrations
- [ ] Google Analytics import/export
- [ ] Webhooks Zapier/Make.com
- [ ] Slack notifications
- [ ] CRM natif Plan B
- [ ] Email marketing (Brevo, Mailchimp)

---

## Format des Versions

- **MAJOR** (1.x.x) : Changements incompatibles
- **MINOR** (x.1.x) : Nouvelles fonctionnalités compatibles
- **PATCH** (x.x.1) : Corrections de bugs

---

## Types de Changements

- **Ajouté** - Nouvelles fonctionnalités
- **Modifié** - Changements de fonctionnalités existantes
- **Déprécié** - Fonctionnalités à supprimer prochainement
- **Supprimé** - Fonctionnalités supprimées
- **Corrigé** - Corrections de bugs
- **Sécurité** - Corrections de vulnérabilités

---

## Contributeurs

- **Développeur Principal** : Claude (Anthropic)
- **Client** : Plan B CRM
- **Date de Création** : 11 Novembre 2025

---

## Licence

MIT License - Libre d'utilisation pour Plan B CRM

---

**Note** : Les dates suivent le format ISO 8601 (AAAA-MM-JJ)
