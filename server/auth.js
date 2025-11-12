/**
 * PLAN B CRM - Authentication System
 * Système d'authentification JWT + bcrypt
 * Version: 2.0.0 (Sécurisé)
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Configuration depuis .env
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRATION = parseInt(process.env.JWT_EXPIRATION) || 28800; // 8 heures
const JWT_REFRESH_EXPIRATION = parseInt(process.env.JWT_REFRESH_EXPIRATION) || 604800; // 7 jours
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// Vérification configuration obligatoire
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET must be defined in .env file');
}

if (!ADMIN_PASSWORD_HASH) {
    throw new Error('ADMIN_PASSWORD_HASH must be defined in .env file');
}

/**
 * Vérifie si le username et password correspondent aux credentials admin
 * @param {string} username - Username saisi
 * @param {string} password - Mot de passe en clair saisi
 * @returns {Promise<boolean>} True si credentials valides
 */
async function verifyCredentials(username, password) {
    if (username !== ADMIN_USERNAME) {
        return false;
    }

    try {
        const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
        return isValid;
    } catch (error) {
        console.error('Error verifying password:', error);
        return false;
    }
}

/**
 * Génère un JWT access token
 * @param {string} username - Username de l'utilisateur
 * @returns {string} JWT token
 */
function generateToken(username) {
    const payload = {
        username,
        type: 'access',
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION
    });
}

/**
 * Génère un JWT refresh token
 * @param {string} username - Username de l'utilisateur
 * @returns {string} Refresh token
 */
function generateRefreshToken(username) {
    const payload = {
        username,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRATION
    });
}

/**
 * Middleware - Vérifie la validité du JWT dans les cookies
 * Protège les routes admin
 */
function verifyToken(req, res, next) {
    // Récupérer le token depuis le cookie ou le header Authorization
    let token = req.cookies?.auth_token;

    if (!token) {
        // Fallback : vérifier le header Authorization
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'No authentication token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Vérifier que c'est bien un access token
        if (decoded.type !== 'access') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token type'
            });
        }

        // Ajouter les infos utilisateur à la requête
        req.user = {
            username: decoded.username,
            iat: decoded.iat,
            exp: decoded.exp
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'TokenExpired',
                message: 'Authentication token expired',
                expiredAt: error.expiredAt
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'InvalidToken',
                message: 'Invalid authentication token'
            });
        } else {
            return res.status(500).json({
                error: 'InternalError',
                message: 'Error verifying token'
            });
        }
    }
}

/**
 * Middleware - Vérifie la validité du refresh token
 * Utilisé pour renouveler l'access token
 */
function verifyRefreshToken(req, res, next) {
    const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'No refresh token provided'
        });
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);

        // Vérifier que c'est bien un refresh token
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid refresh token type'
            });
        }

        req.user = {
            username: decoded.username
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'RefreshTokenExpired',
                message: 'Refresh token expired, please login again'
            });
        } else {
            return res.status(401).json({
                error: 'InvalidRefreshToken',
                message: 'Invalid refresh token'
            });
        }
    }
}

/**
 * Utilitaire - Génère un nouveau hash bcrypt pour un mot de passe
 * (Utilisation: ligne de commande pour changer le mot de passe admin)
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>} Hash bcrypt
 */
async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}

/**
 * Calcule le temps restant avant expiration du token (en secondes)
 * @param {number} exp - Timestamp d'expiration JWT
 * @returns {number} Secondes restantes
 */
function getTokenTimeRemaining(exp) {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, exp - now);
}

module.exports = {
    verifyCredentials,
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken,
    hashPassword,
    getTokenTimeRemaining,
    JWT_EXPIRATION,
    JWT_REFRESH_EXPIRATION
};
