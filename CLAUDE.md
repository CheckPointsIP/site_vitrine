# GUIDE DE STYLE - Plan B CRM
## Documentation complète du Design System Bauhaus

> **Objectif :** Assurer une cohérence visuelle et structurelle parfaite sur toutes les pages du site web.

---

## 📋 TABLE DES MATIÈRES

1. [Philosophie du Design](#philosophie-du-design)
2. [Variables CSS](#variables-css)
3. [Typographie](#typographie)
4. [Composants Principaux](#composants-principaux)
5. [Structure des Pages](#structure-des-pages)
6. [Animations](#animations)
7. [Responsive Design](#responsive-design)
8. [Scripts et Fonctionnalités](#scripts-et-fonctionnalités)
9. [Checklist Nouvelle Page](#checklist-nouvelle-page)

---

## 🎨 PHILOSOPHIE DU DESIGN

### Style Bauhaus Moderne
Le site utilise un design inspiré du mouvement Bauhaus, caractérisé par :
- **Géométrie pure** : formes carrées, cercles, losanges
- **Couleurs primaires vives** : bleu, rouge, jaune
- **Typographie bold** : Inter font, poids 700-900
- **Absence de bordures arrondies** sur la plupart des éléments
- **Superpositions géométriques** : carrés décalés, ombres en bloc

### Principes clés
✅ **Simplicité** : Chaque élément a une fonction claire
✅ **Contraste** : Texte foncé sur fond clair, inversé dans le hero
✅ **Espacement généreux** : Padding confortable, sections bien séparées
✅ **Cohérence** : Réutilisation des composants sur toutes les pages

---

## 🎨 VARIABLES CSS

### Mode Clair (défaut)
```css
:root, [data-theme="light"] {
    /* Couleurs principales */
    --primary-color: #0052CC;        /* Bleu Bauhaus fort */
    --secondary-color: #172B4D;      /* Bleu marine profond */
    --accent-color: #FF5630;         /* Rouge dynamique */
    --accent-secondary: #FFAB00;     /* Jaune énergique */

    /* Textes */
    --text-dark: #172B4D;
    --text-light: #5E6C84;

    /* Fonds */
    --bg-light: #F4F5F7;
    --bg-white: #FFFFFF;
    --bg-geometric: #EBECF0;

    /* Bordures */
    --border-color: #DFE1E6;

    /* États */
    --success-color: #36B37E;
    --warning-color: #FFAB00;

    /* Effets */
    --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.15);
    --transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

### Mode Sombre
```css
[data-theme="dark"] {
    --primary-color: #3399FF;        /* Bleu plus clair */
    --secondary-color: #1a1a1a;      /* Gris très foncé */
    --accent-color: #FF6B4A;         /* Rouge plus clair */
    --accent-secondary: #FFB930;     /* Jaune plus clair */
    --text-dark: #f5f5f5;            /* Texte ultra clair */
    --text-light: #e0e0e0;           /* Texte secondaire clair */
    --bg-light: #1f1f1f;
    --bg-white: #2a2a2a;
    --bg-geometric: #1a1a1a;
    --border-color: #505050;
}
```

**⚠️ Important :** Toujours utiliser les variables CSS, jamais de couleurs en dur !

---

## ✍️ TYPOGRAPHIE

### Police
- **Famille :** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- **Import Google Fonts :**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
```

### Hiérarchie des titres
```css
h1 {
    font-size: clamp(2rem, 5vw + 1rem, 4rem);
    font-weight: 900;
    letter-spacing: -0.02em;
}

h2 {
    font-size: clamp(1.75rem, 3vw + 0.5rem, 3rem);
    font-weight: 800;
}

h3 {
    font-size: clamp(1.1rem, 2vw + 0.3rem, 1.75rem);
    font-weight: 700;
}

h4 {
    font-size: clamp(1rem, 1.5vw + 0.2rem, 1.25rem);
    font-weight: 600;
}
```

### Classes utilitaires
- `.section-title` : Titre de section centré avec barre rouge
- `.lead` : Paragraphe d'introduction (1.25rem, centré)

---

## 🧩 COMPOSANTS PRINCIPAUX

### 1. HERO SECTION STANDARD (index.html)

```html
<section class="hero">
    <div class="container">
        <div class="hero-label">PLAN B CRM</div>
        <h1 class="hero-title">Le CRM né de l'expérience terrain.</h1>
        <p class="hero-subtitle">
            Développé par ceux qui gèrent réellement des CFA...
        </p>
        <a href="#histoire" class="btn btn-primary">Découvrir Plan B</a>
    </div>
</section>
```

**Caractéristiques :**
- Fond bleu marine (`var(--secondary-color)`)
- Texte blanc
- Éléments décoratifs (cercle rouge, losange bleu) en pseudo-éléments
- Barre rouge verticale sur le titre (`:before`)

---

### 2. HERO BAUHAUS (demo.html, decouvrir.html, contact.html)

```html
<section class="hero-bauhaus">
    <div class="container">
        <div class="hero-label-bauhaus">DÉMONSTRATION</div>
        <h1>Découvrez le CRM en action</h1>
        <p>En 30 secondes, comprenez comment notre CRM transforme...</p>
    </div>
</section>
```

**Différences avec hero standard :**
- Classe `.hero-bauhaus` au lieu de `.hero`
- Label avec classe `.hero-label-bauhaus` (ombre jaune décalée)
- Pas de classes `.hero-title` / `.hero-subtitle` sur h1/p
- Animation via `animateHeroBauhaus('.hero-bauhaus')` en JavaScript

**⚠️ Animation obligatoire :**
```html
<script>
    document.addEventListener('DOMContentLoaded', function() {
        animateHeroBauhaus('.hero-bauhaus');
    });
</script>
```

---

### 3. SYSTÈME D'ONGLETS (index.html uniquement)

```html
<div class="tabs-container">
    <div class="tabs-nav">
        <button class="tab-button active" onclick="switchTab('histoire')">
            <i class="fas fa-book-open"></i> Notre Histoire
        </button>
        <button class="tab-button" onclick="switchTab('unique')">
            <i class="fas fa-gem"></i> Fonctionnalités
        </button>
        <!-- Autres onglets -->
        <div class="tabs-fill"></div>
    </div>
</div>

<div id="tab-histoire" class="tab-content active">
    <section id="histoire" class="histoire">
        <!-- Contenu -->
    </section>
</div>
```

**Caractéristiques :**
- Sticky header (reste visible au scroll)
- Onglet actif : `.active`
- Indicateur de scroll mobile : `.tabs-fill`
- Fonction `switchTab()` dans `script.js`

---

### 4. BOUTONS

#### Types de boutons
```html
<!-- Bouton principal (rouge) -->
<a href="#" class="btn btn-primary">Action Principale</a>

<!-- Bouton secondaire (bleu) -->
<a href="#" class="btn btn-secondary">Action Secondaire</a>

<!-- Bouton outline (bordure seulement) -->
<a href="#" class="btn btn-outline">Action Tertiaire</a>
```

**Caractéristiques :**
- Toujours en MAJUSCULES (`text-transform: uppercase`)
- Flèche animée (`::after` content: '→')
- Effet hover : translation (-2px, -2px)
- Animation pulse sur `.btn-primary`

---

### 5. SECTIONS DE CONTENU

#### Structure standard
```html
<section class="content-section" style="background: var(--bg-white);">
    <div class="container">
        <h2 class="section-title">Titre de la Section</h2>
        <p class="lead">Paragraphe d'introduction centré...</p>

        <!-- Contenu de la section -->
    </div>
</section>
```

**Alternance des fonds :**
- Section 1 : `background: var(--bg-white)`
- Section 2 : `background: var(--bg-light)`
- Section 3 : `background: var(--bg-white)`
- etc.

---

### 6. FEATURE CARDS (Fonctionnalités)

```html
<div class="features-grid">
    <div class="feature-card">
        <div class="feature-icon">
            <i class="fas fa-mouse-pointer"></i>
        </div>
        <h3>Simplicité totale</h3>
        <p>Description de la fonctionnalité...</p>
        <p class="feature-tagline"><strong>Slogan clé.</strong></p>
    </div>
</div>
```

**Caractéristiques :**
- Grid responsive : `grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))`
- Icône octogonale (clip-path polygon)
- Barre bleue verticale à gauche (`:before`)
- Effet de balayage lumineux au hover (`:after`)

---

### 7. PRICING CARDS (Tarifs)

```html
<div class="pricing-grid">
    <div class="pricing-card">
        <h3 class="pricing-title">Basic</h3>
        <div class="pricing-price">499€<span>/mois</span></div>
        <p class="pricing-desc">Pour structurer et centraliser...</p>
        <ul class="pricing-features">
            <li>Fonctionnalité 1</li>
            <li>Fonctionnalité 2</li>
        </ul>
        <a href="contact.html" class="btn btn-outline">Choisir Basic</a>
    </div>

    <!-- Card "Populaire" -->
    <div class="pricing-card featured">
        <div class="badge">Populaire</div>
        <!-- Contenu -->
    </div>
</div>
```

**Caractéristiques :**
- Barre colorée en haut (`:before`)
- Effet hover : translation + ombre en bloc
- Badge rouge "Populaire" sur carte featured
- Liste avec checkmarks verts

---

### 8. FAQ / SUPPORT ITEMS (Accordéons)

```html
<div class="faq-category">
    <h3 class="faq-category-title">Questions générales</h3>

    <div class="faq-item">
        <button class="faq-question" onclick="toggleFaq(this)">
            <span>C'est quoi un CRM ?</span>
            <span class="faq-arrow">+</span>
        </button>
        <div class="faq-answer">
            <p>Réponse à la question...</p>
        </div>
    </div>
</div>
```

**Comportement :**
- Clic sur `.faq-question` appelle `toggleFaq(this)`
- Classe `.active` ajoutée/retirée sur `.faq-item`
- Flèche tourne de 45° quand actif
- `max-height` animé pour effet d'ouverture

---

### 9. FORMULAIRES BAUHAUS

```html
<section class="form-section">
    <div class="container">
        <div class="form-container-bauhaus">
            <form id="demoForm">
                <div class="form-group">
                    <label>Nom <span class="required">*</span></label>
                    <input type="text" name="name" required>
                </div>

                <div class="form-group">
                    <label>Email <span class="required">*</span></label>
                    <input type="email" name="email" required>
                </div>

                <button type="submit" class="submit-btn-bauhaus">
                    Envoyer ma demande
                </button>
            </form>
        </div>
    </div>
</section>
```

**Caractéristiques :**
- Bordures de 3px
- Focus : outline rouge 3px + translation
- Bouton submit pleine largeur
- Message de succès : `.success-message-bauhaus.show`

---

### 10. FOOTER

```html
<footer class="footer">
    <div class="container">
        <div class="footer-content">
            <div class="footer-section">
                <h4>À propos</h4>
                <p>Description...</p>
            </div>
            <div class="footer-section">
                <h4>Navigation</h4>
                <ul>
                    <li><a href="#histoire">Notre histoire</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2025 - Tous droits réservés</p>
        </div>
    </div>
</footer>
```

**Caractéristiques :**
- Fond foncé (`var(--text-dark)` en light mode, `#1a1a1a` en dark mode)
- Texte blanc
- Grid responsive 3 colonnes
- Hover sur liens : padding-left animé

---

## 🏗️ STRUCTURE DES PAGES

### Template de base

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">

    <!-- Script anti-flash dark mode (OBLIGATOIRE en premier) -->
    <script>
        (function() {
            const theme = localStorage.getItem('theme') ||
                         (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', theme);
        })();
    </script>

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Titre de la Page - Plan B CRM</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- Styles -->
    <link rel="stylesheet" href="styles.css">

    <style>
        /* Styles spécifiques à la page (si nécessaire) */
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero-bauhaus">
        <div class="container">
            <div class="hero-label-bauhaus">LABEL</div>
            <h1>Titre Principal</h1>
            <p>Sous-titre ou description...</p>
        </div>
    </section>

    <!-- Section 1 -->
    <section class="content-section" style="background: var(--bg-white);">
        <div class="container">
            <h2 class="section-title">Section 1</h2>
            <p class="lead">Introduction...</p>
            <!-- Contenu -->
        </div>
    </section>

    <!-- Section 2 -->
    <section class="content-section" style="background: var(--bg-light);">
        <div class="container">
            <h2 class="section-title">Section 2</h2>
            <!-- Contenu -->
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <!-- Contenu footer -->
    </footer>

    <!-- Scripts -->
    <script src="script.js"></script>
    <script src="analytics-tracker.js"></script>

    <!-- Animation Hero Bauhaus -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            animateHeroBauhaus('.hero-bauhaus');
        });
    </script>
</body>
</html>
```

---

## 🎬 ANIMATIONS

### Classes d'animation au scroll

```css
.animate-on-scroll {
    opacity: 0;
}

.animate-on-scroll.fade-in-up {
    transform: translateY(40px);
}

.animate-on-scroll.fade-in-left {
    transform: translateX(-40px);
}

.animate-on-scroll.fade-in-right {
    transform: translateX(40px);
}

.animate-on-scroll.animated {
    opacity: 1;
    transform: translateY(0) translateX(0);
}
```

### Éléments animés automatiquement
Le fichier `script.js` applique automatiquement les animations sur :
- `.feature-card` → `fade-in-up`
- `.story-block` → `fade-in-left`
- `.pricing-card` → `scale-in`
- `.faq-category` → `fade-in-up`
- `.benefit-box` → `fade-in-up`
- `.why-item` → `fade-in-right`

### Animation Hero Bauhaus
```javascript
function animateHeroBauhaus(heroSelector) {
    setTimeout(() => {
        const heroLabel = document.querySelector(`${heroSelector} .hero-label-bauhaus`);
        const heroTitle = document.querySelector(`${heroSelector} h1`);
        const heroSubtitle = document.querySelector(`${heroSelector} p`);

        const elements = [
            { el: heroLabel, delay: '0s' },
            { el: heroTitle, delay: '0.2s' },
            { el: heroSubtitle, delay: '0.4s' }
        ];

        elements.forEach(({ el, delay }) => {
            if (el) {
                el.style.opacity = '0';
                el.style.animation = `fadeInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay} forwards`;
            }
        });
    }, 100);
}
```

**⚠️ Important :** Cette fonction est définie dans `script.js` et doit être appelée dans chaque page utilisant `.hero-bauhaus`

---

## 📱 RESPONSIVE DESIGN

### Breakpoints

```css
/* Tablette et Mobile */
@media (max-width: 1023px) {
    /* Réduction tailles hero */
}

/* Mobile */
@media (max-width: 767px) {
    /* Hero centré, padding réduit */
    /* Grids en 1 colonne */
    /* Touch targets 48px minimum */
    /* Boutons pleine largeur */
}

/* Petit Mobile */
@media (max-width: 480px) {
    /* Tailles réduites */
}
```

### Comportements Mobile

#### Hero
- Texte centré au lieu de gauche
- Barre rouge verticale masquée
- Padding réduit (80px au lieu de 140px)

#### Tabs
- Scroll horizontal avec snap
- Indicateur de scroll à droite (`.tabs-fill`)
- Touch targets 48px minimum

#### Grids
- Toujours 1 colonne (`grid-template-columns: 1fr`)

#### Buttons
- Pleine largeur (`width: 100%`)
- Min-height 48px pour accessibilité

---

## 🔧 SCRIPTS ET FONCTIONNALITÉS

### 1. Dark Mode

#### Script anti-flash (en `<head>`)
```html
<script>
    (function() {
        const theme = localStorage.getItem('theme') ||
                     (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    })();
</script>
```

#### Toggle button (index.html uniquement)
```html
<button id="dark-mode-toggle" class="dark-mode-toggle">
    <svg class="sun-icon">...</svg>
    <svg class="moon-icon">...</svg>
</button>
```

Le script dans `script.js` gère automatiquement le toggle.

---

### 2. Analytics

```html
<script src="analytics-tracker.js"></script>
```

Ce script track automatiquement :
- Vues de pages
- Clics sur boutons
- Clics sur liens
- Soumissions de formulaires
- Scroll depth

---

### 3. Fonctions JavaScript principales (script.js)

```javascript
// Changement d'onglet (index.html)
function switchTab(tabName)

// Toggle accordéons support
function toggleSupport(button)

// Toggle accordéons FAQ
function toggleFaq(button)

// Animation Hero Bauhaus
function animateHeroBauhaus(heroSelector)
```

---

## ✅ CHECKLIST NOUVELLE PAGE

### Structure HTML
- [ ] Script anti-flash dark mode en premier dans `<head>`
- [ ] Meta viewport
- [ ] Titre descriptif
- [ ] Import Google Fonts (Inter)
- [ ] Font Awesome CDN
- [ ] `<link rel="stylesheet" href="styles.css">`
- [ ] Hero section (`.hero` ou `.hero-bauhaus`)
- [ ] Sections avec alternance `var(--bg-white)` / `var(--bg-light)`
- [ ] Footer

### Scripts
- [ ] `<script src="script.js"></script>`
- [ ] `<script src="analytics-tracker.js"></script>`
- [ ] Animation Hero (si `.hero-bauhaus`) :
```javascript
document.addEventListener('DOMContentLoaded', function() {
    animateHeroBauhaus('.hero-bauhaus');
});
```

### Styles
- [ ] Utiliser uniquement les variables CSS (jamais de couleurs en dur)
- [ ] Réutiliser les classes existantes (`.btn`, `.section-title`, `.lead`, etc.)
- [ ] Styles spécifiques dans un `<style>` interne si nécessaire
- [ ] Responsive : tester sur mobile/tablette

### Composants
- [ ] Hero avec label (`.hero-label` ou `.hero-label-bauhaus`)
- [ ] Titre H1 dans le hero
- [ ] Sections avec `.container` pour centrer le contenu
- [ ] Boutons avec classes `.btn btn-primary` / `.btn-secondary` / `.btn-outline`
- [ ] Grids avec classes existantes (`.features-grid`, `.pricing-grid`, `.benefits-grid`)
- [ ] Footer identique aux autres pages

### Accessibilité
- [ ] Alt text sur images
- [ ] Labels sur formulaires
- [ ] Aria-labels sur boutons icônes
- [ ] Contraste de couleurs suffisant
- [ ] Touch targets 48px minimum mobile

### Performance
- [ ] Images optimisées
- [ ] Preconnect fonts
- [ ] Scripts en fin de body

---

## 🎯 EXEMPLES DE PAGES

### Page Simple (type "Découvrir")
1. Hero Bauhaus avec label
2. Section vidéo/image
3. Section benefits (grid 3 colonnes)
4. Section avantages (grid 2 colonnes)
5. CTA final
6. Footer

### Page Formulaire (type "Contact", "Demo")
1. Hero Bauhaus avec label
2. Section formulaire (`.form-section`)
3. Box de réassurance (`.reassurance-box-bauhaus`)
4. Liste bénéfices (`.benefits-list-bauhaus`)
5. Footer

### Page Complexe (type "index.html")
1. Hero standard
2. Système d'onglets sticky
3. Multiples sections dans chaque onglet
4. Footer

---

## 🚨 ERREURS À ÉVITER

❌ **Ne JAMAIS faire :**
- Utiliser des couleurs en dur (ex: `color: #0052CC` → utiliser `var(--primary-color)`)
- Oublier le script anti-flash dark mode
- Oublier l'animation Hero Bauhaus
- Créer des bordures arrondies excessives (Bauhaus = angles droits)
- Ignorer l'alternance des fonds de section
- Utiliser des grids personnalisées au lieu de celles existantes

✅ **Toujours faire :**
- Utiliser les variables CSS
- Réutiliser les classes existantes
- Tester en dark mode
- Tester sur mobile
- Vérifier l'accessibilité
- Maintenir la cohérence visuelle

---

## 📚 RESSOURCES

### Fichiers clés
- `styles.css` : Toutes les variables et classes
- `script.js` : Fonctions JavaScript principales
- `analytics-tracker.js` : Tracking automatique
- `index.html` : Exemple page complexe avec onglets
- `demo.html` / `contact.html` / `decouvrir.html` : Exemples pages simples

### Design System Bauhaus
- Formes géométriques : cercles, carrés, losanges
- Palette : bleu (#0052CC), rouge (#FF5630), jaune (#FFAB00)
- Typographie : Inter, bold (700-900)
- Espacement : généreux, aéré

### Documentation supplémentaire
- Font Awesome : https://fontawesome.com/icons
- Google Fonts : https://fonts.google.com/specimen/Inter
- CSS Variables : https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

---

## 🔄 HISTORIQUE DES MISES À JOUR

**2025-11-12** : Création du guide complet
- Analyse complète de index.html et styles.css
- Documentation de tous les composants
- Checklist de création de page
- Exemples et bonnes pratiques

---

**Pour toute question ou amélioration de ce guide, contactez l'équipe de développement.**

✨ **Ce guide est un document vivant : mettez-le à jour à chaque nouveau composant créé !**
