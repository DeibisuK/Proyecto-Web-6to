const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const admin = require('firebase-admin');

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
    // Try to fetch role name from user-service roles endpoint so we can set a readable claim
    let claimsSynced = false;
    let claimWarning = null;
    try {
      const rolesEndpoint = `${userServiceUrl.replace(/\/$/, '')}/roles/${encodeURIComponent(id_rol)}`;
      const roleResp = await fetch(rolesEndpoint, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      let roleName = String(id_rol);
      if (roleResp.ok) {
        const roleObj = await roleResp.json();
        roleName = roleObj.nombre_rol || roleObj.name || roleName;
      }

      // Set Firebase custom claim (best-effort). The admin SDK should be initialized by middleware/authenticate.
      try {
        // store both readable role name and numeric id_rol to make authorization checks efficient
        await admin.auth().setCustomUserClaims(uid, { role: roleName, id_rol: Number(id_rol) });
        claimsSynced = true;
      } catch (err) {
        claimWarning = `failed_to_set_claims: ${err && err.message ? err.message : String(err)}`;
        console.error('Failed to set custom claims for user', uid, err);
      }
    } catch (err) {
      claimWarning = `failed_to_fetch_role: ${err && err.message ? err.message : String(err)}`;
      console.error('Error fetching role to set claims for user', uid, err);
    }

    return res.json({ success: true, uid, updated, claimsSynced, claimWarning });
  } catch (err) {
    console.error('Error assigning role via user-service:', err);
    return res.status(500).json({ error: 'internal_error', message: err.message || String(err) });
  }
});

module.exports = router;
