/**
 * PLAN B CRM - Logging System
 * Système de logs structuré avec winston
 * Version: 2.0.0
 */

const winston = require('winston');
const path = require('path');
require('dotenv').config();

// Configuration depuis .env
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const LOG_DIR = process.env.LOG_DIR || './logs';

// Format personnalisé pour les logs
const customFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Format pour la console (plus lisible)
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let metaStr = '';
        if (Object.keys(meta).length > 0) {
            metaStr = '\n' + JSON.stringify(meta, null, 2);
        }
        return `[${timestamp}] ${level}: ${message}${metaStr}`;
    })
);

/**
 * Logger pour les authentifications
 * Stocke: tentatives de login, succès, échecs, déconnexions
 */
const authLogger = winston.createLogger({
    level: LOG_LEVEL,
    format: customFormat,
    transports: [
        // Fichier pour tous les logs d'authentification
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'auth.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            tailable: true
        }),
        // Fichier séparé pour les échecs d'authentification (sécurité)
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'auth-failures.log'),
            level: 'warn',
            maxsize: 5242880, // 5MB
            maxFiles: 3
        })
    ]
});

/**
 * Logger pour les requêtes API
 * Stocke: requêtes analytics, accès aux données, exports
 */
const apiLogger = winston.createLogger({
    level: LOG_LEVEL,
    format: customFormat,
    transports: [
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'api.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5,
            tailable: true
        })
    ]
});

/**
 * Logger général (erreurs système, etc.)
 */
const systemLogger = winston.createLogger({
    level: LOG_LEVEL,
    format: customFormat,
    transports: [
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'combined.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 5
        })
    ]
});

// Ajouter sortie console en mode développement
if (process.env.DEBUG_MODE === 'true') {
    authLogger.add(new winston.transports.Console({ format: consoleFormat }));
    apiLogger.add(new winston.transports.Console({ format: consoleFormat }));
    systemLogger.add(new winston.transports.Console({ format: consoleFormat }));
}

/**
 * Extraire des informations sécurisées depuis la requête HTTP
 * @param {Object} req - Objet requête Express (optionnel)
 * @returns {Object} Métadonnées de la requête
 */
function extractRequestMetadata(req) {
    // Si req n'est pas une requête Express valide, retourner des valeurs par défaut
    if (!req || !req.headers) {
        return {
            ip: 'unknown',
            userAgent: 'unknown',
            method: 'unknown',
            path: 'unknown',
            timestamp: new Date().toISOString()
        };
    }

    return {
        ip: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        method: req.method || 'unknown',
        path: req.path || 'unknown',
        timestamp: new Date().toISOString()
    };
}

/**
 * Log une tentative de connexion réussie
 * @param {string} username - Nom d'utilisateur
 * @param {Object} req - Requête Express
 */
function logLoginSuccess(username, req) {
    const metadata = extractRequestMetadata(req);
    authLogger.info('Login successful', {
        event: 'login_success',
        username,
        ...metadata
    });
}

/**
 * Log une tentative de connexion échouée
 * @param {string} username - Nom d'utilisateur tenté
 * @param {Object} req - Requête Express
 * @param {string} reason - Raison de l'échec
 */
function logLoginFailure(username, req, reason = 'Invalid credentials') {
    const metadata = extractRequestMetadata(req);
    authLogger.warn('Login failed', {
        event: 'login_failure',
        username,
        reason,
        ...metadata
    });
}

/**
 * Log une déconnexion
 * @param {string} username - Nom d'utilisateur
 * @param {Object} req - Requête Express
 */
function logLogout(username, req) {
    const metadata = extractRequestMetadata(req);
    authLogger.info('Logout', {
        event: 'logout',
        username,
        ...metadata
    });
}

/**
 * Log un refresh de token
 * @param {string} username - Nom d'utilisateur
 * @param {Object} req - Requête Express
 */
function logTokenRefresh(username, req) {
    const metadata = extractRequestMetadata(req);
    authLogger.info('Token refreshed', {
        event: 'token_refresh',
        username,
        ...metadata
    });
}

/**
 * Log un accès à une route protégée
 * @param {string} username - Nom d'utilisateur
 * @param {Object} req - Requête Express
 */
function logProtectedAccess(username, req) {
    const metadata = extractRequestMetadata(req);
    apiLogger.info('Protected route accessed', {
        event: 'protected_access',
        username,
        ...metadata
    });
}

/**
 * Log une requête API analytics
 * @param {string} type - Type d'événement analytics
 * @param {number} count - Nombre d'événements
 * @param {Object} req - Requête Express
 */
function logAnalyticsRequest(type, count, req) {
    const metadata = extractRequestMetadata(req);
    apiLogger.info('Analytics data received', {
        event: 'analytics_received',
        eventType: type,
        eventCount: count,
        ...metadata
    });
}

/**
 * Log un export de données
 * @param {string} format - Format d'export (json, csv)
 * @param {string} username - Nom d'utilisateur
 * @param {Object} req - Requête Express
 */
function logDataExport(format, username, req) {
    const metadata = extractRequestMetadata(req);
    apiLogger.warn('Data exported', {
        event: 'data_export',
        format,
        username,
        ...metadata
    });
}

/**
 * Log une suppression de données
 * @param {string} username - Nom d'utilisateur
 * @param {Object} req - Requête Express
 */
function logDataDeletion(username, req) {
    const metadata = extractRequestMetadata(req);
    apiLogger.warn('Data deleted', {
        event: 'data_deletion',
        username,
        ...metadata,
        severity: 'high'
    });
}

/**
 * Log une erreur système
 * @param {Error} error - Objet erreur
 * @param {Object} context - Contexte additionnel
 */
function logError(error, context = {}) {
    systemLogger.error('System error', {
        event: 'system_error',
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        ...context
    });
}

/**
 * Log une tentative d'accès non autorisé (rate limit, token invalide, etc.)
 * @param {string} reason - Raison du blocage
 * @param {Object} req - Requête Express
 */
function logUnauthorizedAccess(reason, req) {
    const metadata = extractRequestMetadata(req);
    authLogger.warn('Unauthorized access attempt', {
        event: 'unauthorized_access',
        reason,
        ...metadata,
        severity: 'high'
    });
}

/**
 * Middleware Express pour logger automatiquement toutes les requêtes
 */
function requestLoggerMiddleware(req, res, next) {
    const startTime = Date.now();

    // Log après la réponse
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const metadata = extractRequestMetadata(req);

        if (res.statusCode >= 400) {
            apiLogger.warn('Request completed with error', {
                ...metadata,
                statusCode: res.statusCode,
                duration: `${duration}ms`
            });
        } else if (process.env.DEBUG_MODE === 'true') {
            apiLogger.info('Request completed', {
                ...metadata,
                statusCode: res.statusCode,
                duration: `${duration}ms`
            });
        }
    });

    next();
}

module.exports = {
    authLogger,
    apiLogger,
    systemLogger,
    logLoginSuccess,
    logLoginFailure,
    logLogout,
    logTokenRefresh,
    logProtectedAccess,
    logAnalyticsRequest,
    logDataExport,
    logDataDeletion,
    logError,
    logUnauthorizedAccess,
    requestLoggerMiddleware
};
