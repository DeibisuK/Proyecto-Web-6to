require("dotenv").config();
const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const authenticate = require("./middleware/authenticate");
const fetch = require("node-fetch");
const admin = require("firebase-admin");

const app = express();

// Configure CORS: use CORS_ALLOWED_ORIGINS (comma-separated) or default to '*'.
const rawOrigins =
  process.env.CORS_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS || "";
// Split, trim, strip surrounding quotes and trailing slashes, normalize to lowercase
const allowedOrigins = rawOrigins
  .split(",")
  .map((s) => s.trim())
  .map((s) => s.replace(/^['"]|['"]$/g, "")) // remove surrounding single/double quotes
  .map((s) => s.replace(/\/+$/, "")) // remove trailing slashes
  .map((s) => s.toLowerCase())
  .filter(Boolean);
const corsOptions = {};
// DEBUG_CORS=true will log origin checks to stdout
const debugCors = (process.env.DEBUG_CORS || "false").toLowerCase() === "true";

if (allowedOrigins.length > 0) {
  corsOptions.origin = function (origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin) {
      if (debugCors)
        console.log(
          "[api-gateway] CORS allow: no origin (server-to-server or curl)"
        );
      return callback(null, true);
    }
    // Normalize incoming origin (strip trailing slash and lowercase) before comparing
    const normOrigin = origin.replace(/\/+$/, "").toLowerCase();
    if (allowedOrigins.indexOf(normOrigin) !== -1) {
      if (debugCors) console.log(`[api-gateway] CORS allow: ${origin}`);
      return callback(null, true);
    }
    if (debugCors)
      console.warn(`[api-gateway] CORS deny: ${origin} not in allowed list`);
    // Use plain string message instead of an Error object to avoid noisy stack traces
    return callback("Not allowed by CORS", false);
  };
} else {
  // If no allowed origins configured, default to allow all
  corsOptions.origin = "*";
  if (debugCors)
    console.log(
      "[api-gateway] CORS allow: wildcard * (no CORS_ALLOWED_ORIGINS set)"
    );
}
// Optionally allow credentials if frontends need cookies
corsOptions.credentials =
  (process.env.CORS_ALLOW_CREDENTIALS || "false").toLowerCase() === "true";

app.use(cors(corsOptions));
app.use(express.json());

const userServiceUrl = process.env.USER_SERVICE_URL;
const productServiceUrl = process.env.PRODUCT_SERVICE_URL;

// Protect proxied routes with Firebase ID token verification
const proxyOptions = {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    proxyReqOpts.headers = proxyReqOpts.headers || {};
    // Forward original Authorization header so downstream services can verify if needed
    if (srcReq.headers && srcReq.headers.authorization) {
      proxyReqOpts.headers.authorization = srcReq.headers.authorization;
    }
    // Attach user info decoded by the gateway (if available)
    if (srcReq.user) {
      proxyReqOpts.headers["x-user-uid"] = srcReq.user.uid || "";
      if (srcReq.user.email)
        proxyReqOpts.headers["x-user-email"] = srcReq.user.email;
    }
    // Attach role from tokenClaims if available
    if (srcReq.tokenClaims && srcReq.tokenClaims.role) {
      proxyReqOpts.headers["x-user-role"] = srcReq.tokenClaims.role;
    }
    return proxyReqOpts;
  },
};
// Public court routes (no authentication required)
const courtPublicProxyOptions = Object.assign({}, proxyOptions, {
  proxyReqPathResolver: function (req) {
    console.log('[api-gateway] Public route /c/sedes accessed, forwarding to /sedes');
    return '/sedes';
  },
});

// Public user routes (no authentication required)
const userPublicProxyOptions = Object.assign({}, proxyOptions, {
  proxyReqPathResolver: function (req) {
    console.log('[api-gateway] Public route /u/contacto accessed, forwarding to /contacto');
    return '/contacto';
  },
});

// Mount admin routes (these are handled by gateway directly and not proxied)
const adminRoutes = require("./routes/admin.routes");
const authorizeRole = require("./middleware/authorizeRole");
// Use authenticate to verify token, then authorizeRole to check id_rol in the user-service.
// By convention admin role id = 1. Change if your DB uses a different id.
app.use("/admin", authenticate(), authorizeRole(1), adminRoutes);

// Intercept user creation so we can synchronize Firebase custom claims immediately
// POST /u/users -> create user in user-service, then set custom claims { role, id_rol }
app.post("/u/users", async (req, res) => {
  try {
    if (!userServiceUrl)
      return res.status(500).json({
        error: "config_error",
        message: "USER_SERVICE_URL not configured",
      });

    const endpoint = `${userServiceUrl.replace(/\/$/, "")}/users/`;
    // forward request body to user-service
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await response.text();
    if (!response.ok) {
      console.error(
        "User service create responded with error:",
        response.status,
        text
      );
      return res.status(502).json({
        error: "user_service_error",
        status: response.status,
        message: text,
      });
    }

    // parse created user
    let created;
    try {
      created = JSON.parse(text);
    } catch (e) {
      created = { raw: text };
    }

    // attempt to fetch role name and set custom claims (best-effort)
    let claimsSynced = false;
    let claimWarning = null;
    try {
      const id_rol = req.body && req.body.id_rol;
      if (typeof id_rol !== "undefined" && id_rol !== null) {
        const rolesEndpoint = `${userServiceUrl.replace(
          /\/$/,
          ""
        )}/roles/${encodeURIComponent(id_rol)}`;
        const roleResp = await fetch(rolesEndpoint, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        let roleName = String(id_rol);
        if (roleResp.ok) {
          const roleObj = await roleResp.json();
          roleName = roleObj.nombre_rol || roleObj.name || roleName;
        }
        // set claims (admin SDK is initialized in authenticate middleware)
        try {
          await admin.auth().setCustomUserClaims(req.body.uid, {
            role: roleName,
            id_rol: Number(id_rol),
          });
          claimsSynced = true;
        } catch (err) {
          claimWarning = `failed_to_set_claims: ${
            err && err.message ? err.message : String(err)
          }`;
          console.error(
            "Failed to set custom claims for user on registration",
            req.body.uid,
            err
          );
        }
      }
    } catch (err) {
      claimWarning = `failed_to_sync_claims: ${
        err && err.message ? err.message : String(err)
      }`;
      console.error("Error during claims sync on user create", err);
    }

    return res.json({ success: true, created, claimsSynced, claimWarning });
  } catch (err) {
    console.error("Error creating user via user-service:", err);
    return res
      .status(500)
      .json({ error: "internal_error", message: err.message || String(err) });
  }
});

// =============================================
// PUBLIC ROUTES (NO AUTHENTICATION REQUIRED)
// Only /admin routes require authentication
// =============================================

app.use("/u", proxy(userServiceUrl, proxyOptions));
app.use("/p", proxy(productServiceUrl, proxyOptions));
app.use("/b", proxy(process.env.BUY_SERVICE_URL, proxyOptions));
app.use("/c", proxy(process.env.COURT_SERVICE_URL, proxyOptions));
// Match service requires authentication for user-specific endpoints
app.use("/m", authenticate(), proxy(process.env.MATCH_SERVICE_URL, proxyOptions));
app.use("/i", proxy(process.env.CLOUDINARY_SERVICE_URL, proxyOptions));

// Routes configured successfully
module.exports = app;
