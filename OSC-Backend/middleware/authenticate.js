/**
 * Factory that returns middleware to verify Firebase ID tokens on incoming requests.
 * Usage: import authenticate from './middleware/authenticate';
 * app.use('/private', authenticate());
 * app.use('/admin', authenticate(['admin']));
 *
 * Options:
 * - Reads env var AUTH_CHECK_REVOKED=true to check for revoked tokens.
 */
// 1. IMPORTACIÓN CORREGIDA
import admin from "firebase-admin";

const CHECK_REVOKED =
  (process.env.AUTH_CHECK_REVOKED || "false").toLowerCase() === "true";

// Initialize admin only once.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (err) {
    console.error("Failed to initialize firebase-admin:", err.message || err);
  }
}

// 2. EXPORTACIÓN CORREGIDA Y RENOMBRADA
export default function authenticate(requiredRoles = []) {
  return async function (req, res, next) { // La función interna no necesita nombre
    const authHeader = req.header("authorization") || "";
    const match = authHeader.match(/^Bearer (.*)$/i);
    const idToken = match ? match[1] : null;

    if (!idToken) {
      return res.status(401).json({
        error: "missing_token",
        message: "Missing or invalid Authorization header",
      });
    }

    try {
      const decoded = await admin.auth().verifyIdToken(idToken, CHECK_REVOKED);
      req.tokenClaims = decoded;
      req.user = { uid: decoded.uid, email: decoded.email };
      
      // ... Lógica de roles (si la hubiera) ...

      return next();
    } catch (err) {
      const code = err && err.code ? err.code : "auth/invalid-token";
      const message = err && err.message ? err.message : "Unauthorized";
      console.error("Firebase token verification error:", code, message);

      if (code === "auth/id-token-expired" || /expired/i.test(message)) {
        return res.status(401).json({ error: "token_expired", code, message });
      }
      if (code === "auth/id-token-revoked" || /revoked/i.test(message)) {
        return res.status(401).json({ error: "token_revoked", code, message });
      }
      return res.status(401).json({ error: code, message });
    }
  };
}