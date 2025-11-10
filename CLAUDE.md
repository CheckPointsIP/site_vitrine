# CLAUDE.md - Guide de Style Plan B CRM

## 🎨 Direction Artistique - Style Bauhaus

### Philosophie Générale
Le site Plan B CRM s'inspire du mouvement **Bauhaus** : formes géométriques pures, couleurs primaires, fonctionnalité avant tout, et clarté visuelle maximale. L'objectif est de transmettre professionnalisme, modernité et efficacité.

**Principes fondamentaux :**
- ✅ Forme suit la fonction
- ✅ Géométrie pure (carrés, rectangles, octogones)
- ✅ Pas d'ornements superflus
- ✅ Couleurs primaires et contrastées
- ✅ Typographie forte et géométrique
- ✅ Asymétrie équilibrée

---

## 🎨 Palette de Couleurs

### Couleurs Principales

```css
--primary-color: #0052CC;        /* Bleu Bauhaus fort - Action, confiance */
--secondary-color: #172B4D;      /* Bleu marine profond - Sérieux, stabilité */
--accent-color: #FF5630;         /* Rouge dynamique - Mouvement, urgence */
--accent-secondary: #FFAB00;     /* Jaune énergique - Optimisme, attention */
```

### Couleurs Neutres

```css
--text-dark: #172B4D;            /* Texte principal */
--text-light: #5E6C84;           /* Texte secondaire */
--bg-light: #F4F5F7;             /* Fond clair */
--bg-white: #FFFFFF;             /* Fond blanc */
--bg-geometric: #EBECF0;         /* Fond formes géométriques */
--border-color: #DFE1E6;         /* Bordures */
```

### Couleurs Fonctionnelles

```css
--success-color: #36B37E;        /* Succès, validation */
--warning-color: #FFAB00;        /* Avertissement */
```

### Utilisation des Couleurs

| Élément | Couleur | Usage |
|---------|---------|-------|
| **Boutons CTA principaux** | `--accent-color` (Rouge) | Attirer l'attention, actions importantes |
| **Boutons secondaires** | `--primary-color` (Bleu) | Actions moins prioritaires |
| **Liens et hover** | `--primary-color` | Éléments interactifs |
| **Icônes actives** | `--accent-color` | État actif, sélectionné |
| **Backgrounds hero** | `--secondary-color` | Sections d'en-tête importantes |
| **Accents géométriques** | `--accent-secondary` (Jaune) | Détails décoratifs, ombres |

**⚠️ Règle importante :** Ne jamais utiliser plus de 3 couleurs simultanément dans un même composant.

---

## 📐 Formes Géométriques

### Clip-path pour Formes Octogonales

**Icônes et boutons spéciaux :**
```css
clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
```

**Utilisation :**
- Icônes de fonctionnalités (`.feature-icon`)
- Bouton de retour en haut (`.scroll-to-top`)
- Éléments de navigation importants

### Border-radius

**Règle Bauhaus :** `border-radius: 0;` par défaut

**Exceptions autorisées :**
- Cartes légères : `border-radius: 8px;` (FAQ, Support)
- Éléments contextuels : `border-radius: 12px;` (Call-to-action)

### Ombres Géométriques

**Style Bauhaus :**
```css
box-shadow: 8px 8px 0 var(--bg-geometric);
```

Au lieu des ombres floues traditionnelles, utiliser des ombres **décalées et nettes** pour créer un effet de profondeur géométrique.

---

## 🔤 Typographie

### Police Principale

**Font Family :** `Inter` (Google Fonts)
- Weights utilisés : 400, 600, 700, 800, 900

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet">
```

### Hiérarchie Typographique

```css
h1 { font-size: 4rem; font-weight: 900; }      /* Hero uniquement */
h2 { font-size: 3rem; font-weight: 800; }      /* Titres de section */
h3 { font-size: 1.75rem; font-weight: 700; }   /* Sous-titres */
h4 { font-size: 1.25rem; font-weight: 600; }   /* Petits titres */
p  { font-size: 1rem; line-height: 1.7; }      /* Corps de texte */
```

### Règles Typographiques

- ✅ **Letter-spacing négatif** pour les titres : `-0.02em` à `-0.03em`
- ✅ **Text-transform: uppercase** pour les labels et boutons
- ✅ **Letter-spacing élargi** pour le texte en majuscules : `0.05em` à `0.08em`
- ✅ **Line-height réduit** pour les titres : `1` à `1.1`
- ✅ **Line-height confortable** pour le texte : `1.6` à `1.7`
- ❌ **Ne jamais** utiliser d'italique (non-Bauhaus)
- ❌ **Éviter** les polices décoratives

---

## ✨ Animations et Transitions

### Philosophie des Animations

**Objectif :** Les animations doivent **guider l'utilisateur** et **clarifier les interactions**, jamais distraire.

**Principes :**
- ⏱️ **Durée optimale :** 0.3s à 0.8s maximum
- 🎯 **Purpose-driven :** Chaque animation a un but précis
- 🌊 **Smoothness :** Utiliser des easings personnalisés
- 📱 **Performance :** Privilégier `transform` et `opacity`

### Easing Functions

**Easing principal (doux et naturel) :**
```css
cubic-bezier(0.25, 0.46, 0.45, 0.94)
```

**Easing avec rebond (hover icônes) :**
```css
cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

**Easing standard (transitions générales) :**
```css
cubic-bezier(0.4, 0.0, 0.2, 1)
```

### Keyframes Animations

#### fadeInUp
```css
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
```
**Usage :** Apparition d'éléments au scroll (cartes, sections)

#### fadeInLeft
```css
@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translateX(-30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
```
**Usage :** Hero title, éléments narratifs

#### fadeInRight
```css
@keyframes fadeInRight {
    from {
        opacity: 0;
        transform: translateX(30px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
```
**Usage :** Éléments de droite (images, visuels)

#### scaleIn
```css
@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
```
**Usage :** Pricing cards, modales

#### pulse (CTA)
```css
@keyframes pulse {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(0, 82, 204, 0.4);
    }
    50% {
        box-shadow: 0 0 0 8px rgba(0, 82, 204, 0);
    }
}
```
**Usage :** Boutons CTA principaux (attirer l'attention subtilement)

### Micro-interactions

#### Hover sur Cartes
```css
.card:hover {
    transform: translateY(-4px);
    border-color: var(--primary-color);
    box-shadow: 8px 8px 0 var(--bg-geometric);
}
```
**Distance :** `-4px` maximum (subtil, pas agressif)

#### Hover sur Boutons
```css
.btn:hover {
    transform: translate(-2px, -2px);
}
.btn:hover::after {
    transform: translateX(6px);  /* Flèche qui glisse */
}
```

#### Active State (Click)
```css
.btn:active {
    transform: translateY(1px);  /* Feedback tactile */
}
```

#### Hover sur Icônes
```css
.icon:hover {
    transform: scale(1.1) rotate(5deg);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

### Effet de Scan (Feature Cards)

**Effet hover subtil de gauche à droite :**
```css
.feature-card::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg,
        transparent 0%,
        rgba(0, 82, 204, 0.04) 50%,
        transparent 100%);
    pointer-events: none;
    transition: none;
}

.feature-card:hover::after {
    left: 100%;
    transition: left 0.8s ease-out;
}
```
**⚠️ Important :** `transition: none` par défaut pour éviter la propagation

---

## 🎭 Composants UI

### Boutons

#### Structure HTML
```html
<a href="#" class="btn btn-primary">Texte du bouton</a>
```

#### Classes disponibles
- `.btn-primary` : Rouge, actions principales
- `.btn-secondary` : Bleu, actions secondaires
- `.btn-outline` : Bordure seule, actions tertiaires

#### Règles de style
```css
.btn {
    padding: 16px 40px;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-radius: 0;
    transition: all 0.3s;
}

.btn::after {
    content: '→';
    margin-left: 8px;
    display: inline-block;
    transition: transform 0.4s;
}

.btn:hover::after {
    transform: translateX(6px);
}
```

**⚠️ À ne pas faire :**
- ❌ Boutons arrondis (`border-radius > 0`)
- ❌ Plus de 3 mots dans un bouton
- ❌ Boutons sans icône/flèche de direction

### Cartes (Cards)

#### Structure de base
```html
<div class="feature-card">
    <div class="feature-icon">
        <i class="fas fa-icon"></i>
    </div>
    <h3>Titre</h3>
    <p>Description...</p>
    <p class="feature-tagline"><strong>Message clé</strong></p>
</div>
```

#### Règles de style
- Bordure : `3px solid var(--border-color)`
- Padding : `2.5rem`
- Barre gauche bleue : `6px` de large
- Pas de `border-radius` (Bauhaus pur)

### Icônes

**Bibliothèque :** Font Awesome 6.5.1
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
```

#### Style des icônes principales
```css
.feature-icon {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
}
```

**⚠️ Ne jamais :**
- ❌ Mélanger des icônes de styles différents
- ❌ Utiliser des émojis (non-professionnel)
- ❌ Icônes sans contexte visuel clair

### Accordéons (FAQ, Support)

#### Structure HTML
```html
<div class="faq-item">
    <button class="faq-question" onclick="toggleFaq(this)">
        <span>Question ?</span>
        <span class="faq-arrow">+</span>
    </button>
    <div class="faq-answer">
        <p>Réponse...</p>
    </div>
</div>
```

#### Animations
```css
.faq-item.active .faq-arrow {
    transform: rotate(45deg);  /* + devient × */
}

.faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.faq-item.active .faq-answer {
    max-height: 1000px;
}
```

**Comportement :**
- Un seul item ouvert à la fois par catégorie
- Scroll doux vers l'élément ouvert
- Transition fluide de `max-height`

---

## 🗂️ Structure et Organisation

### Architecture des Sections

#### 1. Hero Section
```html
<section class="hero">
    <div class="container">
        <div class="hero-label">PLAN B CRM</div>
        <h1 class="hero-title">Titre principal</h1>
        <p class="hero-subtitle">Sous-titre explicatif</p>
        <a href="#" class="btn btn-primary">CTA</a>
    </div>
</section>
```

**Caractéristiques :**
- Fond : `--secondary-color` (bleu marine)
- Éléments décoratifs : cercle rouge, losange bleu (CSS pseudo-elements)
- Animations initiales : `opacity: 0` puis `fadeInLeft` séquentiel

#### 2. Système d'Onglets
```html
<div class="tabs-container">
    <div class="tabs-nav">
        <button class="tab-button active" onclick="switchTab('name')">
            <i class="fas fa-icon"></i> Label
        </button>
    </div>
</div>

<div id="tab-name" class="tab-content active">
    <!-- Contenu de l'onglet -->
</div>
```

**Règles :**
- Position : `sticky` avec `top: 0`
- Fond : `--secondary-color`
- Bordure inférieure : `4px solid var(--accent-color)`
- Maximum 5 onglets
- Icône + Texte obligatoires

#### 3. Section Standard
```html
<section id="section-id" class="section-class">
    <div class="container">
        <h2 class="section-title">Titre de Section</h2>
        <p class="lead">Introduction...</p>
        <!-- Contenu -->
    </div>
</section>
```

**Spacing :**
- Padding vertical : `80px` (desktop), `60px` (mobile)
- Container max-width : `1200px`
- Container padding : `0 20px`

### Grilles (Grid Layout)

#### Features Grid
```css
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 2rem;
}
```

#### Pricing Grid
```css
.pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}
```

**⚠️ Responsive :** Sur mobile, toujours `grid-template-columns: 1fr;`

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 480px) { }

/* Tablette */
@media (max-width: 768px) { }

/* Desktop */
@media (min-width: 769px) { }
```

### Règles Responsive Clés

#### Mobile (max-width: 768px)
- Hero title : `2.5rem` (au lieu de 4.5rem)
- Section padding : `60px 20px` (au lieu de 80px)
- Grids : `1fr` (une colonne)
- Onglets : `flex-direction: column`, icône au-dessus

#### Tablette (max-width: 768px)
- Hero : `text-align: center`
- Navigation : `justify-content: flex-start` avec scroll horizontal
- Font-sizes réduits de 10-15%

**⚠️ Mobile-first :** Penser d'abord au mobile, puis enrichir pour desktop

---

## 🎯 Système d'Animation au Scroll

### Intersection Observer

**Configuration :**
```javascript
const observerOptions = {
    threshold: 0.15,           // 15% de l'élément visible
    rootMargin: '0px 0px -80px 0px'  // Déclenche avant l'arrivée
};
```

### Classes d'Animation

```css
.animate-on-scroll {
    opacity: 0;
    transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.animate-on-scroll.fade-in-up { transform: translateY(40px); }
.animate-on-scroll.fade-in-left { transform: translateX(-40px); }
.animate-on-scroll.fade-in-right { transform: translateX(40px); }
.animate-on-scroll.scale-in { transform: scale(0.9); }

.animate-on-scroll.animated {
    opacity: 1;
    transform: translateY(0) translateX(0) scale(1);
}
```

### Mapping des Animations

```javascript
const animateElements = [
    { selector: '.feature-card', animation: 'fade-in-up' },
    { selector: '.story-block', animation: 'fade-in-left' },
    { selector: '.pricing-card', animation: 'scale-in' },
    { selector: '.faq-category', animation: 'fade-in-up' },
];
```

### Cascade d'Animations

**Délai progressif :**
```javascript
setTimeout(() => {
    entry.target.classList.add('animated');
}, index * 100);  // 100ms entre chaque élément
```

---

## 🔍 Indicateurs Visuels

### Scroll Progress Indicator

```javascript
const scrollIndicator = document.createElement('div');
scrollIndicator.className = 'scroll-indicator';
document.body.appendChild(scrollIndicator);

function updateScrollIndicator() {
    const scrollPercentage = (scrollTop / scrollHeight) * 100;
    scrollIndicator.style.width = scrollPercentage + '%';
}
```

**Style :**
```css
.scroll-indicator {
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
    z-index: 9999;
}
```

### Bouton Retour en Haut

```css
.scroll-to-top {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
    opacity: 0;
    transition: all 0.4s;
}

.scroll-to-top.visible {
    opacity: 1;
}
```

**Apparition :** Après 300px de scroll

---

## 📋 Checklist de Cohérence

Avant d'ajouter un nouveau composant, vérifier :

### Design
- [ ] Utilise uniquement les couleurs de la palette
- [ ] Pas de `border-radius` (sauf exceptions documentées)
- [ ] Typographie : Inter uniquement
- [ ] Ombres géométriques (pas de flou sauf exceptions)
- [ ] Icônes : Font Awesome 6.5.1

### Animations
- [ ] Durée entre 0.3s et 0.8s
- [ ] Easing : `cubic-bezier(0.25, 0.46, 0.45, 0.94)`
- [ ] Distance de translation : max 40px
- [ ] Hover : max -4px de translateY
- [ ] Active state présent

### Accessibilité
- [ ] Focus states visuels clairs
- [ ] Contrast ratio > 4.5:1
- [ ] Zone de clic > 44x44px (mobile)
- [ ] Texte alternatif sur icônes importantes
- [ ] Navigation au clavier fonctionnelle

### Performance
- [ ] Utilise `transform` et `opacity` pour animations
- [ ] Pas d'animations sur `width`, `height`, `left`, `right`
- [ ] `will-change` uniquement si nécessaire
- [ ] Images optimisées
- [ ] CSS/JS minifiés en production

### Responsive
- [ ] Testé sur mobile (< 480px)
- [ ] Testé sur tablette (768px)
- [ ] Scroll horizontal géré sur mobile
- [ ] Textes lisibles sur petit écran
- [ ] Touch targets suffisamment larges

---

## 🚀 Bonnes Pratiques de Développement

### Structure des Fichiers

```
site-vitrine/
├── index.html              # Page principale avec onglets
├── index-monolite.html     # Version monolithique (déploiement)
├── styles.css              # Tous les styles
├── script.js               # Toutes les interactions
├── contact.html            # Page de contact
├── demo.html               # Page demande de démo
├── decouvrir.html          # Page découverte produit
├── fonctionnalites.html    # Page fonctionnalités détaillées
└── CLAUDE.md               # Ce fichier - Guide de style
```

### Conventions de Nommage

**Classes CSS :**
- **BEM-like** : `.block-element--modifier`
- **Descriptif** : `.hero-title` pas `.ht`
- **Kebab-case** : `.feature-card` pas `.featureCard`

**IDs :**
- **Sections** : `#histoire`, `#tarifs`, `#faq`
- **Onglets** : `#tab-histoire`, `#tab-tarifs`

**JavaScript :**
- **camelCase** : `switchTab()`, `toggleFaq()`
- **Descriptif** : `updateScrollIndicator()` pas `upd()`

### Commentaires

**CSS :**
```css
/* Section Title - Bauhaus */
.section-title { }
```

**JavaScript :**
```javascript
// Fonction de changement d'onglet
function switchTab(tabName) { }
```

### Version Monolithique

**Génération :**
```python
# Intégrer CSS et JS dans index.html
html_content.replace('<link rel="stylesheet" href="styles.css">', f'<style>{css_content}</style>')
html_content.replace('<script src="script.js"></script>', f'<script>{js_content}</script>')
```

**Quand regénérer :**
- Après chaque modification de `styles.css` ou `script.js`
- Avant chaque déploiement
- Lors de changements majeurs

---

## 🎓 Exemples de Code Réutilisables

### Nouvelle Section
```html
<section id="ma-section" class="ma-section">
    <div class="container">
        <h2 class="section-title">Mon Titre</h2>
        <p class="lead">Introduction en une phrase claire.</p>

        <div class="content-grid">
            <!-- Contenu -->
        </div>
    </div>
</section>
```

```css
.ma-section {
    padding: 80px 20px;
    background-color: var(--bg-light);
}
```

### Nouvelle Card
```html
<div class="card animate-on-scroll fade-in-up">
    <div class="card-icon">
        <i class="fas fa-star"></i>
    </div>
    <h3>Titre Card</h3>
    <p>Description...</p>
</div>
```

```css
.card {
    background: white;
    padding: 2.5rem;
    border: 3px solid var(--border-color);
    border-radius: 0;
    transition: all 0.3s;
}

.card:hover {
    transform: translateY(-4px);
    border-color: var(--primary-color);
}
```

### Nouveau Bouton
```html
<a href="#" class="btn btn-primary">
    Action <i class="fas fa-arrow-right"></i>
</a>
```

**Avec icône personnalisée :**
```css
.btn-custom::after {
    content: '→';
    margin-left: 8px;
}
```

---

## 🔧 Maintenance et Évolution

### Quand Mettre à Jour ce Guide

- ✅ Ajout d'une nouvelle couleur à la palette
- ✅ Création d'un nouveau type d'animation
- ✅ Modification des breakpoints responsive
- ✅ Ajout d'un nouveau composant UI
- ✅ Changement de philosophie design

### Tests de Régression

Avant de valider des modifications :

1. **Visuel :**
   - [ ] Toutes les pages s'affichent correctement
   - [ ] Cohérence des couleurs
   - [ ] Animations fluides

2. **Fonctionnel :**
   - [ ] Onglets fonctionnent
   - [ ] Accordéons s'ouvrent/ferment
   - [ ] Scroll smooth actif
   - [ ] Bouton retour en haut apparaît

3. **Responsive :**
   - [ ] Mobile (320px, 375px, 414px)
   - [ ] Tablette (768px, 1024px)
   - [ ] Desktop (1280px, 1920px)

4. **Performance :**
   - [ ] Temps de chargement < 3s
   - [ ] Animations 60fps
   - [ ] Pas de FOUC (Flash of Unstyled Content)

---

## 📚 Ressources Externes

### Fonts
- **Inter** : https://fonts.google.com/specimen/Inter
- **Font Awesome** : https://fontawesome.com/

### Documentation
- **Bauhaus Design** : https://www.bauhaus100.com/
- **CSS Clip-path** : https://bennettfeely.com/clippy/
- **Cubic Bezier** : https://cubic-bezier.com/

### Outils
- **Contrast Checker** : https://webaim.org/resources/contrastchecker/
- **Responsive Tester** : https://responsivedesignchecker.com/

---

## ✍️ Notes Finales

### À Faire
- ✅ Design Bauhaus cohérent
- ✅ Animations douces et guidantes
- ✅ Système d'onglets sticky
- ✅ Responsive mobile/tablette/desktop
- ✅ Indicateurs de progression

### À Ne Jamais Faire
- ❌ Utiliser des emojis à la place d'icônes
- ❌ Ajouter des border-radius partout
- ❌ Animations > 1 seconde
- ❌ Mélanger plusieurs styles de design
- ❌ Ignorer le mobile

---

**Version du document :** 1.0
**Dernière mise à jour :** 2025
**Auteur :** Claude (Anthropic)
**Projet :** Plan B CRM - Site Vitrine

---

**💡 Conseil final :** En cas de doute sur un choix de design, revenir aux principes Bauhaus fondamentaux : simplicité, géométrie, fonctionnalité. Less is more.
