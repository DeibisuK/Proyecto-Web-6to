import express from 'express';
import fetch from 'node-fetch';
import admin from 'firebase-admin';

const router = express.Router();

// GET /admin/all-users
// Combina usuarios de Firebase y de la BD
router.get('/all-users', async (req, res) => {
  try {
    const userServiceUrl = process.env.USER_SERVICE_URL;
    if (!userServiceUrl) {
      return res.status(500).json({ error: 'config_error', message: 'USER_SERVICE_URL not configured' });
    }

    // 1. Obtener usuarios de Firebase
    let firebaseUsers = [];
    try {
      let nextPageToken;
      do {
        const listResult = await admin.auth().listUsers(1000, nextPageToken);
        firebaseUsers.push(...listResult.users);
        nextPageToken = listResult.pageToken;
      } while (nextPageToken);
    } catch (firebaseError) {
      console.error('Error fetching Firebase users:', firebaseError);
      // Continuar aunque Firebase falle
    }

    // 2. Obtener usuarios de la BD (PostgreSQL)
    let dbUsers = [];
    try {
      const endpoint = `${userServiceUrl.replace(/\/$/, '')}/users/`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        dbUsers = await response.json();
      }
    } catch (dbError) {
      console.error('Error fetching DB users:', dbError);
      // Continuar aunque la BD falle
    }

    // 3. Crear un mapa de usuarios de BD por uid para fusionar
    const dbUsersByUid = {};
    dbUsers.forEach(dbUser => {
      if (dbUser.uid) {
        dbUsersByUid[dbUser.uid] = dbUser;
      }
    });

    // 4. Combinar usuarios de Firebase con datos de BD
    const combinedUsers = firebaseUsers.map(firebaseUser => {
      const dbUser = dbUsersByUid[firebaseUser.uid];
      
      return {
        // Datos de Firebase
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        emailVerified: firebaseUser.emailVerified,
        disabled: firebaseUser.disabled,
        customClaims: firebaseUser.customClaims || {},
        providerData: firebaseUser.providerData,
        metadata: {
          creationTime: firebaseUser.metadata.creationTime,
          lastSignInTime: firebaseUser.metadata.lastSignInTime
        },
        
        // Datos de BD (si existen)
        id_user: dbUser?.id_user,
        nombre: dbUser?.nombre,
        apellido: dbUser?.apellido,
        id_rol: dbUser?.id_rol,
        rol_nombre: dbUser?.nombre_rol, // Si el servicio lo incluye
        
        // Indicador de fuente
        source: dbUser ? 'firebase+db' : 'firebase-only'
      };
    });

    // 5. Agregar usuarios que solo están en BD (sin cuenta Firebase)
    const dbOnlyUsers = dbUsers
      .filter(dbUser => !dbUser.uid)
      .map(dbUser => ({
        // No tiene uid de Firebase
        uid: null,
        email: dbUser.email,
        displayName: `${dbUser.nombre || ''} ${dbUser.apellido || ''}`.trim(),
        photoURL: dbUser.foto_perfil || null,
        emailVerified: false,
        disabled: false,
        customClaims: {},
        providerData: [],
        metadata: {
          creationTime: dbUser.fecha_registro || null,
          lastSignInTime: null
        },
        
        // Datos de BD
        id_user: dbUser.id_user,
        nombre: dbUser.nombre,
        apellido: dbUser.apellido,
        id_rol: dbUser.id_rol,
        rol_nombre: dbUser.nombre_rol,
        
        // Indicador de fuente
        source: 'db-only'
      }));

    // 6. Combinar todo
    const allUsers = [...combinedUsers, ...dbOnlyUsers];

    res.json({
      total: allUsers.length,
      firebaseCount: firebaseUsers.length,
      dbCount: dbUsers.length,
      users: allUsers
    });

  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ 
      error: 'internal_error', 
      message: error.message || String(error) 
    });
  }
});

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

export default router;