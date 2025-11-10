# Site Vitrine CRM - Documentation

## Structure du projet

```
site vitrine/
│
├── index.html              # Page d'accueil principale
├── decouvrir.html          # Page "Découvrir notre CRM"
├── demo.html               # Page de demande de démo
├── fonctionnalites.html    # Page des fonctionnalités détaillées
├── contact.html            # Page de contact
├── styles.css              # Fichier CSS principal
├── script.js               # Fichier JavaScript pour l'interactivité
└── README.md               # Ce fichier
```

## Pages du site

### 1. Page d'accueil (index.html)
La page principale contient toutes les sections importantes :
- **Hero Section** : Bannière d'accueil avec le titre principal et le CTA
- **Histoire** : Le storytelling complet de l'entreprise
- **Ce qui rend notre CRM unique** : 6 cartes présentant les avantages clés
- **Équipe engagée** : Section avec des boutons dépliables pour le support
- **Tarifs** : 4 formules tarifaires (Basic, Pro, Entreprise, Sur mesure)
- **FAQ** : Questions/réponses organisées par catégories
- **Footer** : Navigation et liens de contact

### 2. Page Découvrir (decouvrir.html)
- Emplacement pour vidéo de présentation (30 secondes)
- À qui s'adresse le CRM
- Les problèmes qu'il résout
- Ses points forts

### 3. Page Démo (demo.html)
- Formulaire de demande de démo
- Message de réassurance
- Liste des bénéfices de la démo

### 4. Page Fonctionnalités (fonctionnalites.html)
- Présentation détaillée de toutes les fonctionnalités
- 6 catégories principales avec icônes et descriptions
- Bénéfices concrets pour chaque fonctionnalité

### 5. Page Contact (contact.html)
- 3 moyens de contact (Démo, Email, Téléphone)
- Formulaire de contact avec différents sujets

## Fonctionnalités interactives

### Accordéons/Dépliables
- **Section Support** : Boutons dépliables pour les différents types d'accompagnement
- **FAQ** : Questions/réponses avec système d'ouverture/fermeture

### Formulaires
Les formulaires sont fonctionnels avec validation HTML5. Actuellement, ils affichent un message de succès simulé. Pour les rendre totalement opérationnels :

1. Dans `demo.html`, ligne ~150 : Décommenter et configurer l'appel API
2. Dans `contact.html`, ligne ~200 : Décommenter et configurer l'appel API

### Animations
- Scroll smooth pour les ancres
- Animations au défilement (fade in + translation)
- Effets hover sur les cartes et boutons

## Personnalisation

### Couleurs
Les couleurs principales sont définies dans `styles.css` (lignes 2-13) :
```css
--primary-color: #2563eb;    /* Bleu principal */
--secondary-color: #1e40af;   /* Bleu foncé */
--accent-color: #3b82f6;      /* Bleu accent */
```

Pour changer les couleurs, modifiez ces variables.

### Contenu
Tout le contenu textuel est directement modifiable dans les fichiers HTML.

### Vidéo de présentation
Dans `decouvrir.html` (ligne ~67), remplacez le placeholder par votre vidéo :
```html
<iframe width="100%" height="100%" src="VOTRE_URL_VIDEO" frameborder="0" allowfullscreen></iframe>
```

### Numéro de téléphone
Dans `contact.html` (ligne ~84), remplacez :
```html
<a href="tel:+33000000000" class="btn btn-outline">Appeler maintenant</a>
```

## Backend / API

Pour rendre les formulaires fonctionnels, vous devrez :

1. **Créer un backend** (Node.js, PHP, Python, etc.)
2. **Configurer les endpoints API** pour recevoir les données des formulaires
3. **Décommenter et adapter les appels fetch()** dans :
   - `demo.html` (fonction `handleSubmit`)
   - `contact.html` (fonction `handleContactSubmit`)

Exemple de structure d'API attendue :
```
POST /api/demo-request
POST /api/contact
```

Les données envoyées sont au format JSON.

## Intégrations suggérées

### Service d'emailing
- **Brevo** (ex-Sendinblue) : pour automatiser les emails de confirmation
- **Mailchimp** : alternative pour la gestion des contacts

### CRM / Base de données
- Connecter les formulaires directement à votre CRM
- Ou stocker dans une base de données (MySQL, PostgreSQL, MongoDB)

### Analytics
Ajouter Google Analytics ou autre solution de tracking avant la balise `</head>` :
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

## Responsive Design

Le site est entièrement responsive avec des breakpoints à :
- **768px** : Tablettes
- **480px** : Mobiles

Testé sur :
- Desktop (1920px, 1440px, 1280px)
- Tablette (768px)
- Mobile (375px, 414px)

## Compatibilité navigateurs

- Chrome / Edge (dernières versions)
- Firefox (dernières versions)
- Safari (dernières versions)
- Pas de support pour Internet Explorer

## Optimisations suggérées

### Performance
1. Compresser les images (si vous en ajoutez)
2. Minifier CSS et JS pour la production
3. Utiliser un CDN pour l'hébergement des assets

### SEO
1. Ajouter des balises meta description sur chaque page
2. Ajouter les balises Open Graph pour les réseaux sociaux
3. Créer un fichier `sitemap.xml`
4. Ajouter un fichier `robots.txt`

Exemple de meta à ajouter dans le `<head>` :
```html
<meta name="description" content="Le CRM né de l'expérience terrain pour les CFA et centres de formation">
<meta name="keywords" content="CRM, formation, alternance, gestion">

<!-- Open Graph -->
<meta property="og:title" content="CRM Terrain - La solution pour les CFA">
<meta property="og:description" content="Un CRM pensé par des professionnels pour des professionnels">
<meta property="og:type" content="website">
```

### Sécurité
Si vous ajoutez un backend :
1. Valider toutes les entrées côté serveur
2. Protéger contre les injections SQL
3. Utiliser HTTPS (obligatoire)
4. Ajouter des CAPTCHA sur les formulaires (Google reCAPTCHA)

## Hébergement

### Options recommandées
1. **Netlify** : Gratuit, simple, CI/CD automatique
2. **Vercel** : Gratuit, très rapide
3. **GitHub Pages** : Gratuit pour sites statiques
4. **Hostinger / OVH** : Hébergement traditionnel

### Déploiement rapide
Pour un déploiement rapide sur Netlify :
1. Créer un compte sur netlify.com
2. Glisser-déposer le dossier complet
3. Le site est en ligne !

## Support et maintenance

### Pour modifier le contenu
- Ouvrir les fichiers `.html` avec un éditeur de texte
- Modifier le texte souhaité
- Sauvegarder et recharger la page

### Pour modifier les styles
- Ouvrir `styles.css`
- Rechercher la section concernée
- Modifier les propriétés CSS
- Sauvegarder

## Propositions de noms pour le CRM

D'après le brief, voici les suggestions de noms :

**Catégorie professionnelle :**
1. Praxis CRM (le passage à la pratique)
2. Axis CRM (la colonne vertébrale)
3. Perspectivia CRM (votre projet le plus audacieux)
4. Axiom CRM (vérité évidente de terrain)
5. Nexus CRM (point central de connexion)

**Catégorie originale :**
1. Elan CRM (dynamisme et croissance)
2. Opus CRM (l'œuvre majeure)
3. Atria CRM (le cœur de la maison)
4. Kinesis CRM (mouvement et agilité)
5. Le Cap CRM (direction et pilotage)

## Notes importantes

- Les formulaires sont actuellement en mode "démo" et n'envoient pas réellement de données
- Les liens téléphone sont à configurer avec vos vrais numéros
- L'emplacement vidéo dans decouvrir.html attend votre vidéo YouTube/Vimeo
- Pensez à ajouter un favicon (icône du site)
- Ajoutez une page de mentions légales et politique de confidentialité (RGPD)

## Contact développeur

Pour toute question sur la structure du code ou des modifications à apporter, n'hésitez pas à consulter les commentaires dans le code source.

---

**Version :** 1.0
**Date :** 2025
**Licence :** Propriétaire