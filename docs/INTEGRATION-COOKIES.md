# Guide d'intégration du banner de consentement cookies

## Fichiers créés

✅ **sitemap.xml** - Plan du site pour les moteurs de recherche
✅ **robots.txt** - Instructions pour les robots d'indexation
✅ **cookie-consent.css** - Styles du banner de cookies
✅ **cookie-consent.js** - Logique de gestion du consentement
✅ **confidentialite.html** - Page de politique de confidentialité
✅ **INTEGRATION-COOKIES.md** - Ce guide

---

## 🚀 Étape 1 : Intégrer le banner sur toutes les pages

### Pages à modifier :
- index.html
- decouvrir.html
- pricing-monolithe.html
- contact.html
- demo.html
- test-analytics.html
- admin.html

### Code à ajouter dans le `<head>` de chaque page :

```html
<!-- Cookie Consent -->
<link rel="stylesheet" href="cookie-consent.css">
```

### Code à ajouter avant la fermeture `</body>` de chaque page :

```html
<!-- Cookie Consent Script -->
<script src="cookie-consent.js"></script>
```

**⚠️ IMPORTANT** : Le script `cookie-consent.js` doit être chargé **AVANT** `analytics-tracker.js` pour bloquer le tracking si l'utilisateur refuse les cookies.

### Ordre de chargement recommandé :

```html
<!-- Juste avant </body> -->
<script src="script.js"></script>
<script src="cookie-consent.js"></script>  <!-- D'ABORD -->
<script src="analytics-tracker.js"></script> <!-- ENSUITE -->
```

---

## 🔐 Étape 2 : Modifier analytics-tracker.js (optionnel)

Pour que l'analytics respecte le consentement, ajoutez cette vérification au début de `analytics-tracker.js` :

```javascript
// Vérifier le consentement AVANT d'initialiser le tracker
(function() {
    'use strict';

    // Vérifier si l'utilisateur a accepté les cookies analytics
    function hasAnalyticsConsent() {
        try {
            const consent = localStorage.getItem('planb_cookie_consent');
            if (consent) {
                const data = JSON.parse(consent);
                return data.analytics === true;
            }
            // Si pas de consentement enregistré, ne pas tracker (attendre le choix)
            return false;
        } catch (e) {
            return false;
        }
    }

    // Ne démarrer le tracker que si consentement accepté
    if (!hasAnalyticsConsent()) {
        console.log('Analytics disabled - waiting for user consent');

        // Écouter les changements de consentement
        window.addEventListener('storage', function(e) {
            if (e.key === 'planb_cookie_consent' && hasAnalyticsConsent()) {
                window.location.reload(); // Recharger pour activer le tracking
            }
        });

        return; // Arrêter l'exécution du script
    }

    // VOTRE CODE ANALYTICS EXISTANT ICI
    // ...
})();
```

---

## 📋 Étape 3 : Ajouter des liens vers la politique de confidentialité

### Dans le footer de chaque page, ajoutez :

```html
<footer>
    <div class="footer-links">
        <a href="confidentialite.html">Politique de confidentialité</a>
        <a href="javascript:void(0)" onclick="window.CookieConsent.reopenSettings()">
            Gérer les cookies
        </a>
    </div>
</footer>
```

---

## 🎨 Étape 4 : Personnalisation (optionnel)

### Modifier les couleurs du banner

Dans `cookie-consent.css`, ajustez les variables CSS :

```css
.cookie-consent-banner {
    --primary-color: #0066CC;  /* Votre couleur principale */
    --accent-color: #FF4757;   /* Votre couleur d'accent */
}
```

### Modifier le texte du banner

Dans `cookie-consent.js`, ligne ~250, modifiez le innerHTML du banner.

---

## 📊 Étape 5 : Mettre à jour sitemap.xml et robots.txt

### sitemap.xml

Remplacez `https://votredomaine.fr` par votre véritable nom de domaine.

**Exemple :**
```xml
<loc>https://planb-crm.fr/</loc>
```

### robots.txt

Idem, remplacez l'URL du sitemap :
```txt
Sitemap: https://planb-crm.fr/sitemap.xml
```

---

## 🧪 Étape 6 : Tester le système

### Test 1 : Banner s'affiche au premier chargement
1. Ouvrez votre site en navigation privée
2. Le banner doit apparaître en bas de page avec overlay

### Test 2 : Accepter les cookies
1. Cliquez sur "Tout accepter"
2. Le banner disparaît
3. Un petit badge apparaît en bas à gauche
4. Rechargez → le banner ne s'affiche plus
5. Vérifiez `localStorage` → `planb_cookie_consent` existe

### Test 3 : Refuser les cookies
1. Effacez le localStorage
2. Rechargez la page
3. Cliquez sur "Tout refuser"
4. Ouvrez la console → "Analytics disabled by user"
5. Les données analytics ne doivent PAS être envoyées

### Test 4 : Personnaliser
1. Effacez le localStorage
2. Rechargez
3. Cliquez sur "Personnaliser"
4. Modal s'ouvre avec 3 catégories de cookies
5. Décochez "Analytics"
6. Cliquez "Enregistrer mes préférences"
7. Vérifiez le localStorage

### Test 5 : Rouvrir les paramètres
1. Cliquez sur le badge en bas à gauche (icône cookie)
2. Modal de préférences s'ouvre
3. Modifiez les choix
4. Enregistrez

### Test 6 : Dark mode
1. Activez le dark mode
2. Le banner doit s'adapter avec les bonnes couleurs

---

## 📝 Étape 7 : Compléter la page confidentialite.html

Remplacez les placeholders dans `confidentialite.html` :

- `[Votre adresse complète]` → Adresse de votre entreprise
- `[Votre numéro de téléphone]` → Numéro de contact
- `[Nom du DPO si applicable]` → Nom du délégué protection données
- `[Nom de l'hébergeur]` → Nom de votre hébergeur web
- `dpo@planb-crm.fr` → Votre email réel
- `contact@planb-crm.fr` → Votre email réel
- `https://votredomaine.fr` → Votre domaine

---

## 🔍 Vérification SEO

### Google Search Console

1. Soumettez votre `sitemap.xml` à Google Search Console
2. Vérifiez que `robots.txt` est accessible
3. URL : `https://votredomaine.fr/robots.txt`

### Validation sitemap

Validez votre sitemap sur : https://www.xml-sitemaps.com/validate-xml-sitemap.html

---

## ✅ Checklist finale

- [ ] `cookie-consent.css` et `cookie-consent.js` ajoutés sur toutes les pages
- [ ] Ordre de chargement correct (consent AVANT analytics)
- [ ] Liens "Politique de confidentialité" dans les footers
- [ ] Placeholders remplacés dans `confidentialite.html`
- [ ] `sitemap.xml` avec le bon domaine
- [ ] `robots.txt` avec le bon domaine
- [ ] Tests effectués (accept, refuse, customize)
- [ ] Sitemap soumis à Google Search Console
- [ ] Badge cookie fonctionne (réouverture paramètres)

---

## 🐛 Dépannage

### Le banner ne s'affiche pas

1. Ouvrez la console navigateur (F12)
2. Vérifiez les erreurs JavaScript
3. Vérifiez que `cookie-consent.js` est bien chargé
4. Effacez le localStorage et rechargez

### Le badge ne s'affiche pas après acceptation

Vérifiez dans `cookie-consent.js` ligne ~400 que la méthode `showSettingsBadge()` est bien appelée.

### Les analytics fonctionnent même après refus

Vérifiez que vous avez bien modifié `analytics-tracker.js` pour vérifier le consentement au démarrage (voir Étape 2).

### Le banner est trop grand sur mobile

Ajustez les media queries dans `cookie-consent.css` (lignes 360+).

---

## 📚 Ressources

- **RGPD :** https://www.cnil.fr/fr/reglement-europeen-protection-donnees
- **Cookies CNIL :** https://www.cnil.fr/fr/cookies-et-traceurs-que-dit-la-loi
- **Sitemap :** https://www.sitemaps.org/
- **Robots.txt :** https://developers.google.com/search/docs/crawling-indexing/robots/intro

---

## 🚀 Déploiement production

Avant de mettre en production :

1. ✅ Remplacez tous les placeholders
2. ✅ Testez sur tous les navigateurs (Chrome, Firefox, Safari, Edge)
3. ✅ Testez sur mobile (responsive)
4. ✅ Vérifiez la conformité RGPD
5. ✅ Documentez les durées de conservation
6. ✅ Informez votre équipe
7. ✅ Préparez une réponse type pour les demandes d'exercice de droits

---

**Félicitations !** Votre site est maintenant conforme RGPD avec un système de consentement cookies complet. 🎉
