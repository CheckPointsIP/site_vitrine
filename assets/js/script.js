/**
 * ========================================
 * CONFIGURATION DEBUG
 * Désactive les console.log en production
 * ========================================
 */
const IS_LOCAL = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const DEBUG = IS_LOCAL; // Active les logs uniquement en local

// Fonction de log qui respecte le mode DEBUG
const debugLog = (...args) => {
    if (DEBUG) {
        console.log(...args);
    }
};

/**
 * ========================================
 * DARK MODE SYSTEM
 * Détecte les préférences système + toggle manuel
 * Persistance dans localStorage
 * ========================================
 */
(function() {
    'use strict';

    // Vérifier la préférence système
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Récupérer la préférence stockée
    function getStoredTheme() {
        return localStorage.getItem('theme');
    }

    // Stocker la préférence
    function setStoredTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    // Obtenir le thème actif
    function getActiveTheme() {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        return prefersDarkScheme.matches ? 'dark' : 'light';
    }

    // Appliquer le thème
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        // Mettre à jour la couleur du meta theme-color
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.setAttribute('content', theme === 'dark' ? '#2a2a2a' : '#172B4D');
        }
    }

    // Basculer le thème
    function toggleTheme() {
        const currentTheme = getActiveTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setStoredTheme(newTheme);
        applyTheme(newTheme);
    }

    // Initialiser le thème au chargement
    applyTheme(getActiveTheme());

    // Écouter les changements de préférence système
    prefersDarkScheme.addEventListener('change', (e) => {
        // Appliquer le changement système seulement si l'utilisateur n'a pas de préférence manuelle
        if (!getStoredTheme()) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Ajouter le listener au bouton toggle (après DOMContentLoaded)
    document.addEventListener('DOMContentLoaded', function() {
        const toggleButton = document.getElementById('dark-mode-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleTheme);
        }
    });

    // Exposer la fonction toggleTheme globalement pour utilisation possible ailleurs
    window.toggleDarkMode = toggleTheme;
})();

// Fonction de changement d'onglet
function switchTab(tabName) {
    // Masquer tous les contenus d'onglets
    const allContents = document.querySelectorAll('.tab-content');
    allContents.forEach(content => {
        content.classList.remove('active');
    });

    // Désactiver tous les boutons
    const allButtons = document.querySelectorAll('.tab-button');
    allButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Activer le contenu et le bouton de l'onglet sélectionné
    const selectedContent = document.getElementById(`tab-${tabName}`);
    const selectedButton = event.target.closest('.tab-button');

    if (selectedContent) {
        selectedContent.classList.add('active');
    }

    if (selectedButton) {
        selectedButton.classList.add('active');
    }

    // Scroll to tabs position (where tabs become sticky)
    const heroSection = document.querySelector('.hero');
    const scrollContainer = document.getElementById('scroll-container');

    if (heroSection) {
        const scrollToPosition = heroSection.offsetHeight;

        // Use custom scroll container if it exists, otherwise use window
        if (scrollContainer) {
            scrollContainer.scrollTo({
                top: scrollToPosition,
                behavior: 'smooth'
            });
        } else {
            window.scrollTo({
                top: scrollToPosition,
                behavior: 'smooth'
            });
        }
    }
}

// Toggle Support Items avec animation douce
function toggleSupport(button) {
    const item = button.closest('.support-item');
    const isActive = item.classList.contains('active');

    // Close all support items avec animation
    document.querySelectorAll('.support-item').forEach(el => {
        el.classList.remove('active');
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
        item.classList.add('active');
        // Scroll doux vers l'élément ouvert
        setTimeout(() => {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Toggle FAQ Items avec animation douce
function toggleFaq(button) {
    const item = button.closest('.faq-item');
    const isActive = item.classList.contains('active');

    // Close all FAQ items in the same category
    const category = item.closest('.faq-category');
    category.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('active');
    });

    // Open clicked item if it wasn't active
    if (!isActive) {
        item.classList.add('active');
        // Scroll doux vers l'élément ouvert
        setTimeout(() => {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Animation système et interactions
document.addEventListener('DOMContentLoaded', function() {

    // Gestion des flèches de scroll pour tabs-nav (mobile)
    const tabsNav = document.querySelector('.tabs-nav');
    const tabsFill = document.querySelector('.tabs-fill');

    if (tabsNav && tabsFill) {
        let currentState = 'scroll-right';

        function updateScrollArrow() {
            const scrollLeft = tabsNav.scrollLeft;
            const maxScroll = tabsNav.scrollWidth - tabsNav.clientWidth;
            const scrollPercentage = (scrollLeft / maxScroll) * 100;

            const newState = scrollPercentage >= 90 ? 'scroll-left' : 'scroll-right';

            // Seulement si l'état change
            if (newState !== currentState) {
                // Ajouter classe de transition
                tabsFill.classList.add('transitioning');

                // Après la transition, changer l'état
                setTimeout(() => {
                    tabsFill.classList.remove(currentState);
                    tabsFill.classList.add(newState);
                    currentState = newState;

                    // Retirer la classe de transition pour permettre l'animation d'entrée
                    setTimeout(() => {
                        tabsFill.classList.remove('transitioning');
                    }, 25);
                }, 150);
            }
        }

        // Écouter le scroll horizontal
        tabsNav.addEventListener('scroll', updateScrollArrow);

        // Scroll horizontal avec la molette de souris (PC)
        tabsNav.addEventListener('wheel', function(e) {
            // Vérifier si le contenu déborde horizontalement
            if (tabsNav.scrollWidth > tabsNav.clientWidth) {
                e.preventDefault();
                // Convertir le scroll vertical en horizontal
                tabsNav.scrollLeft += e.deltaY;
            }
        }, { passive: false });

        // Initialiser au chargement
        tabsFill.classList.add('scroll-right');
        currentState = 'scroll-right';
        updateScrollArrow();
    }

    // Smooth scroll for all anchor links
    const scrollContainer = document.getElementById('scroll-container');

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    // Calculer la position avec offset pour les tabs sticky
                    const tabsContainer = document.querySelector('.tabs-container');
                    const tabsHeight = tabsContainer ? tabsContainer.offsetHeight : 0;
                    const offsetTop = target.offsetTop - tabsHeight - 20;

                    // Utiliser le scroll-container si disponible, sinon window
                    if (scrollContainer) {
                        scrollContainer.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    } else {
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });

    // Indicateur de progression du scroll
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    document.body.appendChild(scrollIndicator);

    // Bouton de retour en haut
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.className = 'scroll-to-top';
    scrollToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollToTopBtn.setAttribute('aria-label', 'Retour en haut');
    document.body.appendChild(scrollToTopBtn);

    function updateScrollIndicator() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercentage = (scrollTop / scrollHeight) * 100;
        scrollIndicator.style.width = scrollPercentage + '%';

        // Afficher/cacher le bouton de retour en haut
        if (scrollTop > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    }

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', updateScrollIndicator, { passive: true });
    updateScrollIndicator();

    // Animation au scroll avec Intersection Observer
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Délai progressif pour créer un effet en cascade
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Ajouter les classes d'animation aux éléments
    const animateElements = [
        { selector: '.feature-card', animation: 'fade-in-up' },
        { selector: '.story-block', animation: 'fade-in-left' },
        { selector: '.pricing-card', animation: 'scale-in' },
        { selector: '.faq-category', animation: 'fade-in-up' },
        { selector: '.benefit-box', animation: 'fade-in-up' },
        { selector: '.why-item', animation: 'fade-in-right' }
    ];

    animateElements.forEach(({ selector, animation }) => {
        document.querySelectorAll(selector).forEach((el, index) => {
            el.classList.add('animate-on-scroll', animation);
            observer.observe(el);
        });
    });

    // Effet de focus visible sur les éléments interactifs
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select');
    interactiveElements.forEach(element => {
        element.addEventListener('focus', function() {
            this.style.outline = '3px solid var(--accent-color)';
            this.style.outlineOffset = '3px';
            this.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });

        element.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // Effet de validation visuel pour les inputs
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.length > 0) {
                this.style.borderColor = 'var(--primary-color)';
            } else {
                this.style.borderColor = 'var(--border-color)';
            }
        });

        // Animation de label flottant
        if (input.value.length > 0) {
            input.style.borderColor = 'var(--primary-color)';
        }
    });

    // Animation du Hero au chargement
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroBtn = document.querySelector('.hero .btn');
        const heroLabel = document.querySelector('.hero-label');

        if (heroLabel) {
            heroLabel.style.animation = 'fadeInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
        }
        if (heroTitle) {
            heroTitle.style.animation = 'fadeInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s forwards';
        }
        if (heroSubtitle) {
            heroSubtitle.style.animation = 'fadeInLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s forwards';
        }
        if (heroBtn) {
            heroBtn.style.animation = 'fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.6s forwards';
        }
    }, 100);

    // Parallaxe doux sur les éléments décoratifs
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero::before, .hero::after');

        parallaxElements.forEach((element, index) => {
            const speed = 0.3 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }, { passive: true });

    // Indication visuelle du chargement terminé
    document.body.classList.add('loading');
    window.addEventListener('load', function() {
        setTimeout(() => {
            document.body.classList.remove('loading');
        }, 100);
    });

    // Scroll Spy - Activer l'onglet correspondant à la section visible
    const navButtons = document.querySelectorAll('.tabs-nav .tab-button[href^="#"]');
    debugLog('Scroll Spy: Boutons trouvés:', navButtons.length);

    const sections = Array.from(navButtons).map(btn => {
        const id = btn.getAttribute('href').substring(1);
        return document.getElementById(id);
    }).filter(section => section !== null);

    debugLog('Scroll Spy: Sections trouvées:', sections.length, sections.map(s => s.id));

    if (sections.length > 0) {
        const observerOptions = {
            threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            rootMargin: '0px 0px -50% 0px' // Section active quand elle dépasse la moitié de l'écran
        };

        const scrollSpyObserver = new IntersectionObserver((entries) => {
            // Trouver toutes les sections visibles
            const visibleSections = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            debugLog('Scroll Spy: Callback déclenché, sections visibles:', visibleSections.length);

            if (visibleSections.length > 0) {
                const mostVisible = visibleSections[0];
                const newActiveId = mostVisible.target.id;

                debugLog('Scroll Spy: Section la plus visible ->', newActiveId, 'Ratio:', mostVisible.intersectionRatio);

                // Retirer active de tous les boutons
                navButtons.forEach(btn => btn.classList.remove('active'));

                // Ajouter active au bouton correspondant
                const activeButton = document.querySelector(
                    `.tab-button[href="#${newActiveId}"]`
                );

                if (activeButton) {
                    activeButton.classList.add('active');
                    debugLog('Scroll Spy: ✓ Bouton activé ->', newActiveId);
                } else {
                    if (DEBUG) console.warn('Scroll Spy: ✗ Bouton non trouvé pour', newActiveId);
                }
            }
        }, observerOptions);

        // Observer toutes les sections
        sections.forEach(section => {
            scrollSpyObserver.observe(section);
            debugLog('Scroll Spy: Observer ajouté pour', section.id);
        });
    } else {
        if (DEBUG) console.warn('Scroll Spy: Aucune section trouvée !');
    }
});

/**
 * Animation Hero Bauhaus au chargement
 * Anime séquentiellement : label → titre → paragraphe
 * @param {string} heroSelector - Sélecteur CSS du hero (ex: '.demo-hero')
 */
function animateHeroBauhaus(heroSelector) {
    setTimeout(() => {
        const heroLabel = document.querySelector(`${heroSelector} .hero-label-bauhaus, ${heroSelector} .hero-label`);
        const heroTitle = document.querySelector(`${heroSelector} h1`);
        const heroSubtitle = document.querySelector(`${heroSelector} p, ${heroSelector} .lead`);

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