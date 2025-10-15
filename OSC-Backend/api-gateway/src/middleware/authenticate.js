/**
 * Factory that returns middleware to verify Firebase ID tokens on incoming requests.
 * Usage: const authenticate = require('./middleware/authenticate');
 * app.use('/private', authenticate());
 * app.use('/admin', authenticate(['admin']));
 *
 * Options:
 * - Reads env var AUTH_CHECK_REVOKED=true to check for revoked tokens.
 */
const admin = require('firebase-admin');

const CHECK_REVOKED = (process.env.AUTH_CHECK_REVOKED || 'false').toLowerCase() === 'true';

// Initialize admin only once. The service account key should be provided via
// environment variable GOOGLE_APPLICATION_CREDENTIALS that points to the JSON key
// file, or via other supported env-based credentials in production.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (err) {
    console.error('Failed to initialize firebase-admin:', err.message || err);
  }
}

function makeAuthenticate(requiredRoles = []) {
  return async function authenticate(req, res, next) {
    const authHeader = req.header('authorization') || '';
    const match = authHeader.match(/^Bearer (.*)$/i);
    const idToken = match ? match[1] : null;

    if (!idToken) {
      return res.status(401).json({ error: 'missing_token', message: 'Missing or invalid Authorization header' });
    }

    try {
      const decoded = await admin.auth().verifyIdToken(idToken, CHECK_REVOKED);
      // Attach user info to request for downstream services
      req.user = decoded;

      // Previously we validated roles with Firebase custom claims.
      // Roles are now stored in the user-service (Postgres). This middleware only
      // verifies the token and attaches minimal user info to the request.
      // Role-based authorization is handled by a separate middleware.
      // Attach minimal info
      req.user = { uid: decoded.uid, email: decoded.email };

      return next();
    } catch (err) {
      // Map firebase-admin errors to clearer client responses
      const code = err && err.code ? err.code : 'auth/invalid-token';
      const message = err && err.message ? err.message : 'Unauthorized';
      console.error('Firebase token verification error:', code, message);

      // Distinguish between revoked/expired vs other errors
      if (code === 'auth/id-token-expired' || /expired/i.test(message)) {
        return res.status(401).json({ error: 'token_expired', code, message });
      }
      if (code === 'auth/id-token-revoked' || /revoked/i.test(message)) {
        return res.status(401).json({ error: 'token_revoked', code, message });
      }
      return res.status(401).json({ error: code, message });
    }
  };
}

// Default export: no-role middleware for backward compatibility
module.exports = function authenticate(requiredRoles) {
  // If requiredRoles is omitted, treat as []
  return makeAuthenticate(requiredRoles || []);
};

// Also expose factory explicitly if consumer wants to call
module.exports.factory = makeAuthenticate;
