/**
 * authorizeRole: factory that returns middleware to allow access only if user has matching id_rol in user-service.
 * Usage: import authorizeRole from './middleware/authorizeRole';
 * app.use('/admin', authenticate(), authorizeRole(1), adminRoutes);
 */

// 'import fetch from 'node-fetch'' ya no es necesario; 'fetch' es nativo en Node.js v18+.

// Mejora: Se usa 'export default function' directamente.
export default function authorizeRole(requiredRoleId) {
  if (typeof requiredRoleId === "undefined") {
    throw new Error("requiredRoleId is required");
  }

  return async function (req, res, next) {
    try {
      const uid = req.user && req.user.uid;
      if (!uid) {
        return res
          .status(401)
          .json({
            error: "missing_user",
            message: "Authenticated user not found",
          });
      }

      // First: try to use token claims (fast path)
      const claims = req.tokenClaims || {};
      // Claims may store role name or id; support both `role` (name) and `id_rol` (number)
      const claimRoleName = claims.role || claims.roles || null;
      const claimIdRol = claims.id_rol || null;

      if (claimIdRol !== null && typeof claimIdRol !== "undefined") {
        if (Number(claimIdRol) !== Number(requiredRoleId)) {
          return res
            .status(403)
            .json({
              error: "forbidden",
              message: "Insufficient role (claims)",
            });
        }
        return next();
      }

      // If claims contain role name and we can map name -> id (optional), we could compare.
      // For simplicity, fallback to user-service lookup by uid.
      const userServiceUrl = process.env.USER_SERVICE_URL;
      if (!userServiceUrl) {
        return res
          .status(500)
          .json({
            error: "config_error",
            message: "USER_SERVICE_URL not configured",
          });
      }

      const endpoint = `${userServiceUrl.replace(
        /\/$/,
        ""
      )}/users/${encodeURIComponent(uid)}`;

      // Mejora: El header 'Content-Type' es innecesario en una petición GET
      const response = await fetch(endpoint, { method: "GET" });

      if (!response.ok) {
        const txt = await response.text();
        console.error(
          "authorizeRole: user-service error",
          response.status,
          txt
        );
        return res
          .status(502)
          .json({ error: "user_service_error", status: response.status });
      }

      const user = await response.json();
      const id_rol = user && user.id_rol;

      if (Number(id_rol) !== Number(requiredRoleId)) {
        return res
          .status(403)
          .json({ error: "forbidden", message: "Insufficient role" });
      }

      // attach user from db as well
      req.user_db = user;
      return next();
    } catch (err) {
      console.error("authorizeRole error", err);
      return res
        .status(500)
        .json({ error: "internal_error", message: err.message || String(err) });
    }
  };
}

// 'export default authorizeRole;' ya no es necesario, se hizo arriba.
