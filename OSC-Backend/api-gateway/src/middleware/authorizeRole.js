const fetch = require('node-fetch');

/**
 * authorizeRole: factory that returns middleware to allow access only if user has matching id_rol in user-service.
 * Usage: const authorizeRole = require('./middleware/authorizeRole');
 * app.use('/admin', authenticate(), authorizeRole(1), adminRoutes);
 */
module.exports = function authorizeRole(requiredRoleId) {
  if (typeof requiredRoleId === 'undefined') throw new Error('requiredRoleId is required');

  return async function (req, res, next) {
    try {
      const uid = req.user && req.user.uid;
      if (!uid) return res.status(401).json({ error: 'missing_user', message: 'Authenticated user not found' });

      const userServiceUrl = process.env.USER_SERVICE_URL;
      if (!userServiceUrl) return res.status(500).json({ error: 'config_error', message: 'USER_SERVICE_URL not configured' });

      const endpoint = `${userServiceUrl.replace(/\/$/, '')}/users/${encodeURIComponent(uid)}`;
      const response = await fetch(endpoint, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) {
        const txt = await response.text();
        console.error('authorizeRole: user-service error', response.status, txt);
        return res.status(502).json({ error: 'user_service_error', status: response.status });
      }
      const user = await response.json();
      const id_rol = user && user.id_rol;
      if (Number(id_rol) !== Number(requiredRoleId)) {
        return res.status(403).json({ error: 'forbidden', message: 'Insufficient role' });
      }
      // attach user from db as well
      req.user_db = user;
      return next();
    } catch (err) {
      console.error('authorizeRole error', err);
      return res.status(500).json({ error: 'internal_error', message: err.message || String(err) });
    }
  };
};
