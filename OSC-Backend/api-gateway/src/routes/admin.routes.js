const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// POST /admin/assign-role
// Body: { uid: string, id_rol: number }
router.post('/assign-role', async (req, res) => {
  const { uid, id_rol } = req.body || {};
  if (!uid || typeof id_rol === 'undefined') return res.status(400).json({ error: 'invalid_payload', message: 'uid and id_rol are required' });

  try {
    const userServiceUrl = process.env.USER_SERVICE_URL;
    if (!userServiceUrl) return res.status(500).json({ error: 'config_error', message: 'USER_SERVICE_URL not configured' });

    // Call PUT /users/:uid to update the role
    const endpoint = `${userServiceUrl.replace(/\/$/, '')}/users/${encodeURIComponent(uid)}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_rol }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('User service responded with error:', response.status, text);
      return res.status(502).json({ error: 'user_service_error', status: response.status, message: text });
    }

    const updated = await response.json();
    return res.json({ success: true, uid, updated });
  } catch (err) {
    console.error('Error assigning role via user-service:', err);
    return res.status(500).json({ error: 'internal_error', message: err.message || String(err) });
  }
});

module.exports = router;
