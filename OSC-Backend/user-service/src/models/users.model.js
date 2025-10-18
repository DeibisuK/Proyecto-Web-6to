import db from "../config/db.js";

export const findAll = async () => {
  const res = await db.query(`
    SELECT 
      u.uid,
      u.name_user as nombre,
      u.email_user as email,
      u.id_rol,
      r.nombre_rol as rol
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    ORDER BY u.name_user ASC
  `);
  
  // Intentar enriquecer con datos de Firebase (foto de perfil)
  try {
    const firebaseModule = await import('../config/firebase.js');
    const admin = firebaseModule.default;
    
    if (!admin || !admin.auth) {
      console.warn('Firebase Admin no está disponible, retornando usuarios sin fotos');
      return res.rows.map(user => ({ ...user, foto_perfil: null }));
    }
    
    const usersWithPhotos = await Promise.all(res.rows.map(async (user) => {
      try {
        const userRecord = await admin.auth().getUser(user.uid);
        console.log(`Usuario ${user.uid}: foto =`, userRecord.photoURL || 'sin foto');
        return {
          ...user,
          foto_perfil: userRecord.photoURL || null,
          displayName: userRecord.displayName || user.nombre
        };
      } catch (error) {
        console.warn(`No se pudo obtener datos de Firebase para UID ${user.uid}:`, error.message);
        return {
          ...user,
          foto_perfil: null
        };
      }
    }));
    
    return usersWithPhotos;
  } catch (error) {
    console.error('Error al enriquecer con Firebase:', error.message);
    return res.rows.map(user => ({ ...user, foto_perfil: null }));
  }
};

export const findById = async (id) => {
  // Buscar por uid (Firebase UID)
  const res = await db.query(`
    SELECT 
      u.uid,
      u.name_user as nombre,
      u.email_user as email,
      u.id_rol,
      r.nombre_rol as rol
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.uid = $1
  `, [id]);
  return res.rows[0];
};

export const create = async (user) => {
  const { uid, nombre, email, id_rol } = user;
  try {
    const res = await db.query(
      "INSERT INTO usuarios (uid, name_user, email_user, id_rol) VALUES ($1, $2, $3, $4) RETURNING *",
      [uid, nombre, email, id_rol]
    );
    return res.rows[0];
  } catch (err) {
    // Log query context to help identify constraint/connection errors
    console.error('[users.model] create query failed:', {
      sql: 'INSERT INTO usuarios (uid, name_user, email_user, id_rol) VALUES ($1, $2, $3, $4) RETURNING *',
      params: [uid, nombre, email, id_rol],
      error: err && err.stack ? err.stack : err,
    });
    throw err;
  }
};

export const update = async (id, user) => {
  const { uid, nombre, email, id_rol } = user;
  try {
    const res = await db.query(
      "UPDATE usuarios SET name_user = $1, email_user = $2, id_rol = $3 WHERE uid = $4 RETURNING *",
      [nombre, email, id_rol, uid]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[users.model] update query failed:', {
      sql: 'UPDATE usuarios SET name_user = $1, email_user = $2, id_rol = $3 WHERE uid = $4 RETURNING *',
      params: [nombre, email, id_rol, uid],
      error: err && err.stack ? err.stack : err,
    });
    throw err;
  }
};

export const remove = async (id) => {
  const res = await db.query("DELETE FROM usuarios WHERE uid = $1", [id]);
  return res.rowCount > 0;
};

export const updateRole = async (uid, id_rol) => {
  try {
    const res = await db.query(
      "UPDATE usuarios SET id_rol = $1 WHERE uid = $2 RETURNING *",
      [id_rol, uid]
    );
    return res.rows[0];
  } catch (err) {
    console.error('[users.model] updateRole query failed:', {
      sql: 'UPDATE usuarios SET id_rol = $1 WHERE uid = $2 RETURNING *',
      params: [id_rol, uid],
      error: err && err.stack ? err.stack : err,
    });
    throw err;
  }
};
