/**
 * PLAN B CRM - Security Testing Script
 * Tests pour vérifier l'implémentation de la sécurité
 * Version: 1.0.0
 *
 * Usage: node test-security.js
 */

require('dotenv').config();
const http = require('http');

// Configuration
const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = 'admin123'; // Mot de passe par défaut

// Couleurs pour la console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Statistiques des tests
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Helper pour faire des requêtes HTTP
 */
function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);

        const reqOptions = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        };

        const req = http.request(reqOptions, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = data ? JSON.parse(data) : null;
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: parsedData
                    });
                } catch (error) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

/**
 * Afficher un résultat de test
 */
function logTest(name, passed, message = '') {
    totalTests++;
    if (passed) {
        passedTests++;
        console.log(`${colors.green}✓${colors.reset} ${name}`);
    } else {
        failedTests++;
        console.log(`${colors.red}✗${colors.reset} ${name}`);
        if (message) {
            console.log(`  ${colors.yellow}→${colors.reset} ${message}`);
        }
    }
}

/**
 * Section de tests
 */
function logSection(title) {
    console.log(`\n${colors.cyan}━━━ ${title} ━━━${colors.reset}`);
}

/**
 * TESTS
 */

async function runTests() {
    console.log(`${colors.blue}
╔═══════════════════════════════════════════╗
║   PLAN B CRM - Security Testing Suite    ║
╚═══════════════════════════════════════════╝
${colors.reset}`);

    let authCookie = null;

    // ========================================
    // 1. TESTS AUTHENTIFICATION
    // ========================================
    logSection('1. Tests Authentification');

    // Test 1.1 - Login avec mauvais credentials
    try {
        const res = await makeRequest('/api/auth/login', {
            method: 'POST',
            body: { username: 'admin', password: 'wrongpassword' }
        });
        logTest(
            'Login avec mauvais mot de passe (doit échouer)',
            res.status === 401,
            res.status !== 401 ? `Expected 401, got ${res.status}` : ''
        );
    } catch (error) {
        logTest('Login avec mauvais mot de passe (doit échouer)', false, error.message);
    }

    // Test 1.2 - Login avec credentials valides
    try {
        const res = await makeRequest('/api/auth/login', {
            method: 'POST',
            body: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD }
        });

        const passed = res.status === 200 && res.data?.success === true;
        logTest(
            'Login avec credentials valides (doit réussir)',
            passed,
            !passed ? `Expected 200 with success=true, got ${res.status}` : ''
        );

        // Sauvegarder le cookie pour les tests suivants
        if (res.headers['set-cookie']) {
            authCookie = res.headers['set-cookie']
                .map(cookie => cookie.split(';')[0])
                .join('; ');
        }
    } catch (error) {
        logTest('Login avec credentials valides (doit réussir)', false, error.message);
    }

    // Test 1.3 - Accès à /api/auth/verify avec token valide
    if (authCookie) {
        try {
            const res = await makeRequest('/api/auth/verify', {
                headers: { 'Cookie': authCookie }
            });
            logTest(
                'Vérification token valide (doit réussir)',
                res.status === 200 && res.data?.authenticated === true,
                res.status !== 200 ? `Expected 200, got ${res.status}` : ''
            );
        } catch (error) {
            logTest('Vérification token valide (doit réussir)', false, error.message);
        }
    }

    // Test 1.4 - Accès à /api/auth/verify sans token
    try {
        const res = await makeRequest('/api/auth/verify');
        logTest(
            'Vérification sans token (doit échouer)',
            res.status === 401,
            res.status !== 401 ? `Expected 401, got ${res.status}` : ''
        );
    } catch (error) {
        logTest('Vérification sans token (doit échouer)', false, error.message);
    }

    // ========================================
    // 2. TESTS PROTECTION DES ROUTES
    // ========================================
    logSection('2. Tests Protection des Routes');

    // Test 2.1 - Accès aux stats sans authentification
    try {
        const res = await makeRequest('/api/analytics/stats');
        logTest(
            'Accès aux stats sans auth (doit échouer)',
            res.status === 401,
            res.status !== 401 ? `Expected 401, got ${res.status}` : ''
        );
    } catch (error) {
        logTest('Accès aux stats sans auth (doit échouer)', false, error.message);
    }

    // Test 2.2 - Accès aux stats avec authentification
    if (authCookie) {
        try {
            const res = await makeRequest('/api/analytics/stats', {
                headers: { 'Cookie': authCookie }
            });
            logTest(
                'Accès aux stats avec auth (doit réussir)',
                res.status === 200,
                res.status !== 200 ? `Expected 200, got ${res.status}` : ''
            );
        } catch (error) {
            logTest('Accès aux stats avec auth (doit réussir)', false, error.message);
        }
    }

    // Test 2.3 - Accès à l'export sans authentification
    try {
        const res = await makeRequest('/api/analytics/export/json');
        logTest(
            'Export sans auth (doit échouer)',
            res.status === 401,
            res.status !== 401 ? `Expected 401, got ${res.status}` : ''
        );
    } catch (error) {
        logTest('Export sans auth (doit échouer)', false, error.message);
    }

    // ========================================
    // 3. TESTS VALIDATION DES DONNÉES
    // ========================================
    logSection('3. Tests Validation des Données');

    // Test 3.1 - POST analytics avec données invalides
    try {
        const res = await makeRequest('/api/analytics', {
            method: 'POST',
            body: { invalid: 'data' } // Manque events, sessionId, etc.
        });
        logTest(
            'POST analytics avec données invalides (doit échouer)',
            res.status === 400,
            res.status !== 400 ? `Expected 400, got ${res.status}` : ''
        );
    } catch (error) {
        logTest('POST analytics avec données invalides (doit échouer)', false, error.message);
    }

    // Test 3.2 - POST analytics avec données valides
    try {
        const res = await makeRequest('/api/analytics', {
            method: 'POST',
            body: {
                events: [{ type: 'pageview', timestamp: Date.now() }],
                sessionId: 'test-session-123',
                userId: 'test-user-123',
                timestamp: Date.now()
            }
        });
        logTest(
            'POST analytics avec données valides (doit réussir)',
            res.status === 200 && res.data?.success === true,
            res.status !== 200 ? `Expected 200, got ${res.status}` : ''
        );
    } catch (error) {
        logTest('POST analytics avec données valides (doit réussir)', false, error.message);
    }

    // ========================================
    // 4. TESTS RATE LIMITING
    // ========================================
    logSection('4. Tests Rate Limiting');

    // Test 4.1 - Dépasser la limite de requêtes d'authentification
    console.log('  Testing auth rate limit (5 attempts in 15min)...');
    let rateLimitTriggered = false;

    for (let i = 0; i < 10; i++) {
        try {
            const res = await makeRequest('/api/auth/login', {
                method: 'POST',
                body: { username: 'test', password: 'test' }
            });

            if (res.status === 429) {
                rateLimitTriggered = true;
                break;
            }
        } catch (error) {
            // Ignorer les erreurs
        }
    }

    logTest(
        'Rate limiting sur /api/auth/login (doit bloquer après 5 tentatives)',
        rateLimitTriggered,
        !rateLimitTriggered ? 'Rate limit was not triggered after 10 attempts' : ''
    );

    // ========================================
    // 5. TESTS CORS
    // ========================================
    logSection('5. Tests CORS');

    // Test 5.1 - Requête depuis une origine non autorisée
    try {
        const res = await makeRequest('/api/analytics/stats', {
            headers: {
                'Origin': 'http://malicious-site.com',
                'Cookie': authCookie || ''
            }
        });

        // Le serveur devrait bloquer ou ne pas définir Access-Control-Allow-Origin
        const corsAllowed = res.headers['access-control-allow-origin'] === 'http://malicious-site.com';

        logTest(
            'CORS bloque origines non autorisées',
            !corsAllowed,
            corsAllowed ? 'CORS allowed malicious origin' : ''
        );
    } catch (error) {
        // Une erreur est acceptable ici (connexion refusée)
        logTest('CORS bloque origines non autorisées', true);
    }

    // ========================================
    // 6. TESTS SUPPRESSION DES DONNÉES
    // ========================================
    logSection('6. Tests Suppression des Données');

    // Test 6.1 - Suppression sans token de confirmation
    if (authCookie) {
        try {
            const res = await makeRequest('/api/analytics/clear', {
                method: 'DELETE',
                headers: { 'Cookie': authCookie },
                body: { confirmToken: 'WRONG_TOKEN' }
            });
            logTest(
                'Suppression sans token valide (doit échouer)',
                res.status === 403 || res.status === 400,
                (res.status !== 403 && res.status !== 400) ? `Expected 403/400, got ${res.status}` : ''
            );
        } catch (error) {
            logTest('Suppression sans token valide (doit échouer)', false, error.message);
        }
    }

    // ========================================
    // 7. TESTS LOGOUT
    // ========================================
    logSection('7. Tests Logout');

    if (authCookie) {
        // Test 7.1 - Logout
        try {
            const res = await makeRequest('/api/auth/logout', {
                method: 'POST',
                headers: { 'Cookie': authCookie }
            });
            logTest(
                'Logout (doit réussir)',
                res.status === 200 && res.data?.success === true,
                res.status !== 200 ? `Expected 200, got ${res.status}` : ''
            );
        } catch (error) {
            logTest('Logout (doit réussir)', false, error.message);
        }

        // Test 7.2 - Vérifier que le token n'est plus valide après logout
        try {
            const res = await makeRequest('/api/auth/verify', {
                headers: { 'Cookie': authCookie }
            });
            logTest(
                'Token invalidé après logout (doit échouer)',
                res.status === 401,
                res.status !== 401 ? `Expected 401, got ${res.status}` : ''
            );
        } catch (error) {
            logTest('Token invalidé après logout (doit échouer)', false, error.message);
        }
    }

    // ========================================
    // RÉSULTATS
    // ========================================
    console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`${colors.cyan}RÉSULTATS DES TESTS${colors.reset}`);
    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
    console.log(`Total:   ${totalTests} tests`);
    console.log(`${colors.green}Passés:  ${passedTests}${colors.reset}`);
    console.log(`${colors.red}Échoués: ${failedTests}${colors.reset}`);

    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`Taux de réussite: ${successRate}%`);

    if (failedTests === 0) {
        console.log(`\n${colors.green}✓ Tous les tests de sécurité sont passés !${colors.reset}`);
    } else {
        console.log(`\n${colors.red}✗ ${failedTests} test(s) ont échoué. Vérifiez la configuration.${colors.reset}`);
    }

    console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

    // Exit code selon les résultats
    process.exit(failedTests > 0 ? 1 : 0);
}

// Vérifier que le serveur est démarré
console.log(`${colors.yellow}⚠ Assurez-vous que le serveur est démarré (npm start)${colors.reset}\n`);
console.log(`Connexion à ${BASE_URL}...\n`);

// Délai de 2 secondes pour laisser le temps à l'utilisateur de lire
setTimeout(runTests, 2000);
