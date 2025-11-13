/**
 * Script d'intégration automatique du banner cookies
 * Ajoute les liens CSS/JS dans toutes les pages HTML
 *
 * Usage: node integrate-cookies.js
 */

const fs = require('fs').promises;
const path = require('path');

// Configuration
const PAGES = [
    'pages/index.html',
    'pages/decouvrir.html',
    'pages/pricing-monolithe.html',
    'pages/contact.html',
    'pages/demo.html',
    'pages/admin.html'
];

const CSS_LINK = '<link rel="stylesheet" href="cookie-consent.css">';
const JS_SCRIPT = '<script src="cookie-consent.js"></script>';

async function integrateCookiesInPage(filename) {
    const filePath = path.join(__dirname, filename);

    try {
        // Lire le fichier
        let content = await fs.readFile(filePath, 'utf-8');

        // Vérifier si déjà intégré
        if (content.includes('cookie-consent.css')) {
            console.log(`   ⏭️  ${filename} - Déjà intégré, ignoré`);
            return { filename, status: 'skipped', reason: 'already_integrated' };
        }

        let modified = false;

        // 1. Ajouter le CSS dans le <head> (avant la fermeture </head>)
        if (!content.includes('cookie-consent.css')) {
            const headCloseIndex = content.indexOf('</head>');
            if (headCloseIndex !== -1) {
                const before = content.substring(0, headCloseIndex);
                const after = content.substring(headCloseIndex);

                // Ajouter avec indentation
                content = before +
                    '\n    <!-- Cookie Consent -->\n' +
                    '    ' + CSS_LINK + '\n' +
                    after;

                modified = true;
            }
        }

        // 2. Ajouter le JS AVANT analytics-tracker.js (ou avant </body>)
        if (!content.includes('cookie-consent.js')) {
            // Essayer de trouver analytics-tracker.js
            const analyticsIndex = content.indexOf('analytics-tracker.js');

            if (analyticsIndex !== -1) {
                // Insérer AVANT analytics-tracker.js
                const lineStart = content.lastIndexOf('\n', analyticsIndex);
                const before = content.substring(0, lineStart + 1);
                const after = content.substring(lineStart + 1);

                content = before +
                    '    <!-- Cookie Consent Script (AVANT analytics pour le bloquer si refus) -->\n' +
                    '    ' + JS_SCRIPT + '\n' +
                    after;

                modified = true;
            } else {
                // Sinon, ajouter avant </body>
                const bodyCloseIndex = content.lastIndexOf('</body>');
                if (bodyCloseIndex !== -1) {
                    const before = content.substring(0, bodyCloseIndex);
                    const after = content.substring(bodyCloseIndex);

                    content = before +
                        '\n    <!-- Cookie Consent Script -->\n' +
                        '    ' + JS_SCRIPT + '\n' +
                        after;

                    modified = true;
                }
            }
        }

        if (modified) {
            // Sauvegarder le fichier modifié
            await fs.writeFile(filePath, content, 'utf-8');
            console.log(`   ✅ ${filename} - Intégration réussie`);
            return { filename, status: 'success' };
        } else {
            console.log(`   ⚠️  ${filename} - Aucune modification nécessaire`);
            return { filename, status: 'no_changes' };
        }

    } catch (error) {
        console.error(`   ❌ ${filename} - Erreur: ${error.message}`);
        return { filename, status: 'error', error: error.message };
    }
}

async function addFooterLinks(filename) {
    const filePath = path.join(__dirname, filename);

    try {
        let content = await fs.readFile(filePath, 'utf-8');

        // Vérifier si les liens sont déjà présents
        if (content.includes('confidentialite.html') && content.includes('reopenSettings')) {
            console.log(`   ⏭️  ${filename} - Liens footer déjà présents`);
            return { filename, status: 'skipped' };
        }

        // Chercher le footer existant
        const footerMatch = content.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);

        if (footerMatch) {
            const footerContent = footerMatch[1];

            // Ajouter les liens à la fin du footer (avant </footer>)
            const footerLinks = `
        <div class="footer-links">
            <a href="confidentialite.html">Politique de confidentialité</a>
            <a href="javascript:void(0)" onclick="window.CookieConsent.reopenSettings()">
                Gérer les cookies
            </a>
        </div>`;

            const newFooterContent = footerContent + footerLinks;
            content = content.replace(footerMatch[0], `<footer${footerMatch[0].substring(7, footerMatch[0].indexOf('>'))}>${newFooterContent}\n    </footer>`);

            await fs.writeFile(filePath, content, 'utf-8');
            console.log(`   ✅ ${filename} - Liens footer ajoutés`);
            return { filename, status: 'success' };
        } else {
            console.log(`   ⚠️  ${filename} - Pas de <footer> trouvé, ajout manuel nécessaire`);
            return { filename, status: 'manual_required' };
        }

    } catch (error) {
        console.error(`   ❌ ${filename} - Erreur: ${error.message}`);
        return { filename, status: 'error', error: error.message };
    }
}

async function main() {
    console.log('🍪 INTÉGRATION AUTOMATIQUE DU BANNER COOKIES\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Vérifier que les fichiers nécessaires existent
    try {
        await fs.access(path.join(__dirname, 'cookie-consent.css'));
        await fs.access(path.join(__dirname, 'cookie-consent.js'));
    } catch (error) {
        console.error('❌ Erreur: Les fichiers cookie-consent.css et cookie-consent.js doivent exister.');
        process.exit(1);
    }

    console.log('📝 Étape 1/2 : Intégration CSS/JS dans les pages HTML\n');

    const results = [];
    for (const page of PAGES) {
        const result = await integrateCookiesInPage(page);
        results.push(result);
    }

    console.log('\n📝 Étape 2/2 : Ajout des liens footer (optionnel)\n');
    console.log('⚠️  Cette étape peut nécessiter des ajustements manuels.\n');

    const footerResults = [];
    for (const page of PAGES) {
        const result = await addFooterLinks(page);
        footerResults.push(result);
    }

    // Résumé
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RÉSUMÉ DE L\'INTÉGRATION\n');

    const successCount = results.filter(r => r.status === 'success').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`✅ Succès : ${successCount}/${PAGES.length} pages`);
    console.log(`⏭️  Ignorées : ${skippedCount}/${PAGES.length} pages (déjà intégrées)`);
    console.log(`❌ Erreurs : ${errorCount}/${PAGES.length} pages`);

    if (errorCount > 0) {
        console.log('\n⚠️  Des erreurs sont survenues. Vérifiez les messages ci-dessus.\n');
    } else if (successCount > 0) {
        console.log('\n🎉 Intégration terminée avec succès !\n');
        console.log('📋 PROCHAINES ÉTAPES :\n');
        console.log('1. Testez le banner : ouvrez une page en navigation privée');
        console.log('2. Personnalisez confidentialite.html (remplacer les placeholders)');
        console.log('3. Mettez à jour sitemap.xml et robots.txt (votre domaine)');
        console.log('4. ⚠️  URGENT : Lisez SECURITE-URGENTE.md (problème .env)\n');
    } else {
        console.log('\nℹ️  Aucune modification nécessaire. Les fichiers sont déjà intégrés.\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Exécution
main().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
});
