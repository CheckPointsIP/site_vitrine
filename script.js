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

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offsetTop = target.offsetTop - 20;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
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