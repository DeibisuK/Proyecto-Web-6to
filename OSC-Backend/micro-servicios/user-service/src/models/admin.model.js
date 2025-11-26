import db from '../config/db.js';

/**
 * Obtiene todos los usuarios de la base de datos con información de su rol
 * @returns {Promise<Array>} Lista de usuarios de la BD
 */
export const getAllUsersFromDB = async () => {
  try {
    const res = await db.query(`
      SELECT 
        u.uid,
        u.name_user as nombre,
        u.email_user as email,
        u.id_rol,
        r.nombre_rol
      FROM usuarios u
      LEFT JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.name_user ASC
    `);
    
    return res.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza el rol de un usuario en la base de datos
 * @param {string} uid - Firebase UID del usuario
 * @param {number} id_rol - Nuevo ID de rol
 * @returns {Promise<Object>} Usuario actualizado
 */
export const updateUserRole = async (uid, id_rol) => {
  try {
    const res = await db.query(
      `UPDATE usuarios 
       SET id_rol = $1 
       WHERE uid = $2 
       RETURNING uid, name_user as nombre, email_user as email, id_rol`,
      [id_rol, uid]
    );
    
    if (res.rows.length === 0) {
      return null;
    }
    
    return res.rows[0];
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene información de un rol por su ID
 * @param {number} id_rol - ID del rol
 * @returns {Promise<Object|null>} Información del rol
 */
export const getRoleById = async (id_rol) => {
  try {
    const res = await db.query(
      'SELECT id_rol, nombre_rol FROM roles WHERE id_rol = $1',
      [id_rol]
    );
    
    return res.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene usuarios por rol específico
 * @param {number} id_rol - ID del rol
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getUsersByRole = async (id_rol) => {
  try {
    const res = await db.query(
      'SELECT uid, name_user, email_user, id_rol FROM usuarios WHERE id_rol = $1 ORDER BY name_user ASC',
      [id_rol]
    );
    
    return res.rows;
  } catch (error) {
    throw error;
  }
};
