/**
 * PLAN B CRM - Analytics API Server (SECURED)
 * Backend sécurisé pour stocker les données analytics
 * Node.js + Express + JWT + Rate Limiting + CORS + Validation
 * Version: 2.0.0
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, param, query, validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

// Modules de sécurité personnalisés
const auth = require('./server/auth');
const logger = require('./server/logger');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, process.env.DATA_DIR || 'analytics-data');

// ========================================
// CONFIGURATION CORS RESTREINT
// ========================================
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');

const corsOptions = {
    origin: function (origin, callback) {
        // Permettre requêtes sans origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.logUnauthorizedAccess('CORS blocked', { origin });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Important pour les cookies
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight 24h
};

// ========================================
// RATE LIMITING
// ========================================
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 900000, // 15 min
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
        error: 'TooManyRequests',
        message: 'Too many requests from this IP, please try again later.'
    },
    handler: (req, res) => {
        logger.logUnauthorizedAccess('Rate limit exceeded', req);
        res.status(429).json({
            error: 'TooManyRequests',
            message: 'Too many requests, please try again later.'
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiter plus strict pour l'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives max
    message: {
        error: 'TooManyLoginAttempts',
        message: 'Too many login attempts, please try again later.'
    },
    handler: (req, res) => {
        logger.logUnauthorizedAccess('Auth rate limit exceeded', req);
        res.status(429).json({
            error: 'TooManyLoginAttempts',
            message: 'Too many login attempts, please try again in 15 minutes.'
        });
    }
});

// ========================================
// MIDDLEWARE
// ========================================

// Compression Gzip pour toutes les réponses
app.use(compression({
    level: 6, // Niveau de compression (0-9, défaut: 6)
    threshold: 1024, // Compresser seulement si > 1KB
    filter: (req, res) => {
        // Ne pas compresser si le client désactive
        if (req.headers['x-no-compression']) {
            return false;
        }
        // Utiliser le filtre par défaut de compression
        return compression.filter(req, res);
    }
}));

// Cache HTTP - Headers optimisés
app.use((req, res, next) => {
    // Routes API - pas de cache (données dynamiques)
    if (req.path.startsWith('/api/')) {
        res.set({
            'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0'
        });
    }
    // Fichiers statiques - cache agressif
    else if (req.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        const isProduction = process.env.NODE_ENV === 'production';
        const maxAge = isProduction ? 31536000 : 3600; // 1 an en prod, 1h en dev

        res.set({
            'Cache-Control': `public, max-age=${maxAge}, immutable`,
            'Expires': new Date(Date.now() + maxAge * 1000).toUTCString()
        });
    }
    // HTML - cache court avec revalidation
    else if (req.path.match(/\.html$/)) {
        res.set({
            'Cache-Control': 'public, max-age=3600, must-revalidate',
            'Expires': new Date(Date.now() + 3600000).toUTCString()
        });
    }

    next();
});

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(logger.requestLoggerMiddleware);

// ========================================
// ROUTES AUTHENTIFICATION
// ========================================

/**
 * POST /api/auth/login
 * Authentification admin avec JWT
 */
app.post('/api/auth/login',
    authLimiter,
    [
        body('username').isString().trim().notEmpty(),
        body('password').isString().notEmpty()
    ],
    async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'ValidationError',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        try {
            // Vérifier les credentials
            const isValid = await auth.verifyCredentials(username, password);

            if (!isValid) {
                logger.logLoginFailure(username, req, 'Invalid credentials');
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid username or password'
                });
            }

            // Générer les tokens
            const accessToken = auth.generateToken(username);
            const refreshToken = auth.generateRefreshToken(username);

            // Stocker les tokens dans des cookies httpOnly
            res.cookie('auth_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // HTTPS uniquement en prod
                sameSite: 'strict',
                maxAge: auth.JWT_EXPIRATION * 1000
            });

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: auth.JWT_REFRESH_EXPIRATION * 1000
            });

            logger.logLoginSuccess(username, req);

            res.json({
                success: true,
                message: 'Authentication successful',
                expiresIn: auth.JWT_EXPIRATION
            });

        } catch (error) {
            logger.logError(error, { context: 'login', username });
            res.status(500).json({
                error: 'InternalError',
                message: 'Authentication error'
            });
        }
    }
);

/**
 * POST /api/auth/refresh
 * Renouveler le token d'accès avec le refresh token
 */
app.post('/api/auth/refresh',
    auth.verifyRefreshToken,
    (req, res) => {
        try {
            const username = req.user.username;
            const newAccessToken = auth.generateToken(username);

            res.cookie('auth_token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: auth.JWT_EXPIRATION * 1000
            });

            logger.logTokenRefresh(username, req);

            res.json({
                success: true,
                message: 'Token refreshed',
                expiresIn: auth.JWT_EXPIRATION
            });

        } catch (error) {
            logger.logError(error, { context: 'token_refresh' });
            res.status(500).json({
                error: 'InternalError',
                message: 'Token refresh error'
            });
        }
    }
);

/**
 * POST /api/auth/logout
 * Déconnexion (supprime les cookies)
 */
app.post('/api/auth/logout',
    auth.verifyToken,
    (req, res) => {
        const username = req.user.username;

        res.clearCookie('auth_token');
        res.clearCookie('refresh_token');

        logger.logLogout(username, req);

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
);

/**
 * GET /api/auth/verify
 * Vérifier si le token est valide (pour le frontend)
 */
app.get('/api/auth/verify',
    auth.verifyToken,
    (req, res) => {
        res.json({
            authenticated: true,
            username: req.user.username,
            expiresIn: auth.getTokenTimeRemaining(req.user.exp)
        });
    }
);

// ========================================
// ROUTES ANALYTICS (PUBLIQUES)
// ========================================

/**
 * POST /api/analytics
 * Recevoir les données analytics (PUBLIC - pas de auth requise)
 */
app.post('/api/analytics',
    apiLimiter,
    [
        body('events').isArray().notEmpty(),
        body('sessionId').isString().notEmpty(),
        body('userId').isString().notEmpty(),
        body('timestamp').isInt()
    ],
    async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'ValidationError',
                errors: errors.array()
            });
        }

        try {
            const { events, sessionId, userId, timestamp } = req.body;

            // Sauvegarder par type d'événement
            for (const event of events) {
                await saveEvent(event);
            }

            // Sauvegarder le batch complet
            const batchFilename = `batch_${timestamp}_${sessionId}.json`;
            const batchPath = path.join(DATA_DIR, 'batches', batchFilename);

            await fs.mkdir(path.join(DATA_DIR, 'batches'), { recursive: true });
            await fs.writeFile(batchPath, JSON.stringify(req.body, null, 2));

            logger.logAnalyticsRequest(events[0]?.type || 'unknown', events.length, req);

            res.json({
                success: true,
                eventsReceived: events.length,
                message: 'Analytics data saved successfully'
            });

        } catch (error) {
            logger.logError(error, { context: 'save_analytics' });
            res.status(500).json({
                error: 'InternalError',
                message: 'Error saving analytics data'
            });
        }
    }
);

// ========================================
// ROUTES ANALYTICS ADMIN (PROTÉGÉES)
// ========================================

// Toutes les routes ci-dessous nécessitent une authentification

/**
 * GET /api/analytics/stats
 * Récupérer les statistiques (PROTÉGÉ)
 */
app.get('/api/analytics/stats',
    auth.verifyToken,
    async (req, res) => {
        try {
            logger.logProtectedAccess(req.user.username, req);
            const stats = await getStats();
            res.json(stats);
        } catch (error) {
            logger.logError(error, { context: 'get_stats' });
            res.status(500).json({
                error: 'InternalError',
                message: 'Error getting statistics'
            });
        }
    }
);

/**
 * GET /api/analytics/:type
 * Récupérer des données par type (PROTÉGÉ)
 */
app.get('/api/analytics/:type',
    auth.verifyToken,
    [
        param('type').isString().matches(/^[a-z_]+$/),
        query('limit').optional().isInt({ min: 1, max: 100000 }),
        query('offset').optional().isInt({ min: 0 }),
        query('startDate').optional().isISO8601(),
        query('endDate').optional().isISO8601()
    ],
    async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'ValidationError',
                errors: errors.array()
            });
        }

        try {
            const { type } = req.params;
            const { limit, offset, startDate, endDate } = req.query;

            logger.logProtectedAccess(req.user.username, req);

            const data = await getEventsByType(type, {
                limit: parseInt(limit) || 1000,
                offset: parseInt(offset) || 0,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null
            });

            res.json(data);
        } catch (error) {
            logger.logError(error, { context: 'get_events_by_type', type: req.params.type });
            res.status(500).json({
                error: 'InternalError',
                message: 'Error getting events'
            });
        }
    }
);

/**
 * GET /api/analytics/export/json
 * Exporter toutes les données en JSON (PROTÉGÉ)
 */
app.get('/api/analytics/export/json',
    auth.verifyToken,
    async (req, res) => {
        try {
            logger.logDataExport('json', req.user.username, req);

            const allData = await getAllData();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename="analytics-export-${Date.now()}.json"`);
            res.json(allData);
        } catch (error) {
            logger.logError(error, { context: 'export_json' });
            res.status(500).json({
                error: 'InternalError',
                message: 'Error exporting data'
            });
        }
    }
);

/**
 * DELETE /api/analytics/clear
 * Supprimer toutes les données (PROTÉGÉ + TOKEN CONFIRMATION)
 */
app.delete('/api/analytics/clear',
    auth.verifyToken,
    [
        body('confirmToken').equals('DELETE_ALL_ANALYTICS_DATA')
    ],
    async (req, res) => {
        // Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            logger.logUnauthorizedAccess('Invalid deletion token', req);
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Invalid confirmation token'
            });
        }

        try {
            logger.logDataDeletion(req.user.username, req);
            await clearAllData();

            res.json({
                success: true,
                message: 'All analytics data deleted'
            });

        } catch (error) {
            logger.logError(error, { context: 'clear_data' });
            res.status(500).json({
                error: 'InternalError',
                message: 'Error clearing data'
            });
        }
    }
);

// ========================================
// FONCTIONS UTILITAIRES (inchangées)
// ========================================

async function saveEvent(event) {
    const type = event.type;
    const typeDir = path.join(DATA_DIR, type);

    await fs.mkdir(typeDir, { recursive: true });

    // Créer un fichier par jour
    const date = new Date(event.timestamp);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `${type}_${dateStr}.jsonl`;
    const filePath = path.join(typeDir, filename);

    // Ajouter en JSONL (JSON Lines - une ligne par événement)
    const line = JSON.stringify(event) + '\n';
    await fs.appendFile(filePath, line);
}

async function getEventsByType(type, options = {}) {
    const { limit, offset, startDate, endDate } = options;
    const typeDir = path.join(DATA_DIR, type);

    try {
        await fs.access(typeDir);
    } catch {
        return { data: [], total: 0 };
    }

    const files = await fs.readdir(typeDir);
    let allEvents = [];

    // Lire tous les fichiers du type
    for (const file of files) {
        if (!file.endsWith('.jsonl')) continue;

        const filePath = path.join(typeDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.trim().split('\n').filter(Boolean);

        const events = lines.map(line => {
            try {
                return JSON.parse(line);
            } catch {
                return null;
            }
        }).filter(Boolean);

        allEvents = allEvents.concat(events);
    }

    // Filtrer par date si nécessaire
    if (startDate || endDate) {
        allEvents = allEvents.filter(event => {
            const eventDate = new Date(event.timestamp);
            if (startDate && eventDate < startDate) return false;
            if (endDate && eventDate > endDate) return false;
            return true;
        });
    }

    // Trier par timestamp décroissant
    allEvents.sort((a, b) => b.timestamp - a.timestamp);

    const total = allEvents.length;
    const data = allEvents.slice(offset, offset + limit);

    return { data, total, limit, offset };
}

async function getAllData() {
    const types = [
        'pageview', 'click', 'button_click', 'link_click',
        'form_submit', 'scroll_depth', 'time_on_page',
        'tab_switch', 'device_info'
    ];

    const allData = {};

    for (const type of types) {
        const result = await getEventsByType(type, { limit: 100000 });
        allData[type] = result.data;
    }

    return allData;
}

async function getStats() {
    const allData = await getAllData();

    const pageviews = allData.pageview || [];
    const clicks = allData.click || [];
    const buttonClicks = allData.button_click || [];
    const formSubmissions = allData.form_submit || [];

    const uniqueUsers = new Set(pageviews.map(p => p.userId)).size;
    const uniqueSessions = new Set(pageviews.map(p => p.sessionId)).size;

    return {
        totalPageviews: pageviews.length,
        totalClicks: clicks.length,
        totalButtonClicks: buttonClicks.length,
        totalFormSubmissions: formSubmissions.length,
        uniqueUsers,
        uniqueSessions,
        lastUpdated: Date.now()
    };
}

async function clearAllData() {
    try {
        // Supprimer le dossier et le recréer
        await fs.rm(DATA_DIR, { recursive: true, force: true });
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        logger.logError(error, { context: 'clear_all_data' });
        throw error;
    }
}

// ========================================
// INITIALISATION
// ========================================
async function initDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        await fs.mkdir(path.join(__dirname, 'logs'), { recursive: true });
        logger.systemLogger.info('Data directories created/verified');
    } catch (error) {
        logger.logError(error, { context: 'init_data_dir' });
    }
}

// ========================================
// SERVIR LES FICHIERS STATIQUES
// ========================================

// Priorité 1: Servir les fichiers minifiés depuis dist/ (production)
const distPath = path.join(__dirname, 'dist');
app.use('/dist', express.static(distPath, {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : '1h',
    immutable: true
}));

// Priorité 2: Servir les fichiers source (développement)
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        // Cache control pour les assets
        if (filePath.match(/\.(css|js|jpg|png|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 an
        } else if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 heure
        }
    }
}));

// ========================================
// GESTION DES ERREURS GLOBALES
// ========================================
app.use((err, req, res, next) => {
    logger.logError(err, {
        context: 'global_error_handler',
        path: req.path,
        method: req.method
    });

    res.status(err.status || 500).json({
        error: err.name || 'InternalError',
        message: process.env.DEBUG_MODE === 'true' ? err.message : 'An error occurred'
    });
});

// ========================================
// DÉMARRAGE SERVEUR
// ========================================
async function start() {
    await initDataDir();

    app.listen(PORT, () => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔒 Plan B CRM Analytics Server (SECURED)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`📁 Data directory: ${DATA_DIR}`);
        console.log(`🔗 Admin panel: http://localhost:${PORT}/admin.html`);
        console.log(`🛡️  JWT authentication: ENABLED`);
        console.log(`🚦 Rate limiting: ${process.env.RATE_LIMIT_MAX || 100} req/15min`);
        console.log(`🌐 CORS: ${allowedOrigins.length} origins allowed`);
        console.log(`📝 Logs directory: ${path.join(__dirname, 'logs')}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        logger.systemLogger.info('Server started successfully', {
            port: PORT,
            nodeEnv: process.env.NODE_ENV || 'development',
            corsOrigins: allowedOrigins
        });
    });
}

start();
