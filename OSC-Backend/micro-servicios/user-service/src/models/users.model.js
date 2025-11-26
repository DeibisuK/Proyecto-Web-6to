import db from "../config/db.js";

export const findAll = async () => {
  const res = await db.query(`
    SELECT 
      u.id_user as id_usuario,
      u.uid,
      u.name_user as nombre,
      u.email_user as email,
      u.id_rol,
      r.nombre_rol as rol,
      u.fecha_registro,
      u.estado
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    ORDER BY u.name_user ASC
  `);
  
  console.log('📋 [USER-MODEL] Total usuarios encontrados:', res.rows.length);
  console.log('📋 [USER-MODEL] Primer usuario:', res.rows[0]);
  
  // Intentar enriquecer con datos de Firebase (foto de perfil)
  try {
    const firebaseModule = await import('../config/firebase.js');
    const admin = firebaseModule.default;
    
    if (!admin || !admin.auth) {
      return res.rows.map(user => ({ ...user, foto_perfil: null }));
    }
    
    const usersWithPhotos = await Promise.all(res.rows.map(async (user) => {
      try {
        const userRecord = await admin.auth().getUser(user.uid);
        return {
          ...user,
          foto_perfil: userRecord.photoURL || null,
          displayName: userRecord.displayName || user.nombre
        };
      } catch (error) {
        return {
          ...user,
          foto_perfil: null
        };
      }
    }));
    
    return usersWithPhotos;
  } catch (error) {
    return res.rows.map(user => ({ ...user, foto_perfil: null }));
  }
};

export const findById = async (uid) => {
  // Buscar por uid (Firebase UID)
  const res = await db.query(`
    SELECT 
      u.id_user as id_usuario,
      u.uid,
      u.name_user as nombre,
      u.email_user as email,
      u.id_rol,
      r.nombre_rol as rol,
      u.fecha_registro,
      u.estado
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.uid = $1
  `, [uid]);
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
    throw err;
  }
};

export const update = async (uid, user) => {
  const { id_rol } = user;
  try {
    const res = await db.query(
      "UPDATE usuarios SET id_rol = $1 WHERE uid = $2 RETURNING *",
      [id_rol, uid]
    );
    return res.rows[0];
  } catch (err) {
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
    throw err;
  }
};
