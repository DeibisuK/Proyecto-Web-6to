import pool from '../config/db.js';

/**
 * NOTA: La tabla 'arbitros' fue eliminada.
 * Los árbitros ahora se manejan directamente desde la tabla 'usuarios' con rol='arbitro'
 */

export const findAll = async () => {
    const result = await pool.query(`
        SELECT 
            id_user as id_arbitro,
            name_user as nombre,
            email_user as email,
            phone_user as telefono,
            id_deporte,
            estado
        FROM usuarios 
        WHERE id_rol = 3
        ORDER BY name_user
    `);
    return result.rows;
};

export const findById = async (id) => {
    const result = await pool.query(`
        SELECT 
            id_user as id_arbitro,
            name_user as nombre,
            email_user as email,
            phone_user as telefono,
            id_deporte,
            estado
        FROM usuarios 
        WHERE id_user = $1 AND id_rol = 3
    `, [id]);
    return result.rows[0];
};

/**
 * Para crear un árbitro, simplemente actualiza el rol del usuario
 */
export const create = async (arbitro) => {
    const { id_usuario, id_deporte } = arbitro;
    const result = await pool.query(
        `UPDATE usuarios 
         SET id_rol = 3, id_deporte = $1 
         WHERE id_user = $2 
         RETURNING id_user as id_arbitro, name_user as nombre, email_user as email`,
        [id_deporte, id_usuario]
    );
    return result.rows[0];
};

/**
 * Actualizar información del árbitro (deporte, estado)
 */
export const update = async (id, arbitro) => {
    const { id_deporte, estado } = arbitro;
    const result = await pool.query(
        `UPDATE usuarios 
         SET id_deporte = $1, estado = $2 
         WHERE id_user = $3 AND id_rol = 3 
         RETURNING id_user as id_arbitro, name_user as nombre, email_user as email`,
        [id_deporte, estado, id]
    );
    return result.rows[0];
};

/**
 * Remover rol de árbitro (cambiar a 'cliente')
 */
export const remove = async (id) => {
    const result = await pool.query(
        `UPDATE usuarios 
         SET id_rol = 2 
         WHERE id_user = $1 AND id_rol = 3 
         RETURNING id_user as id_arbitro, name_user as nombre`,
        [id]
    );
    return result.rows[0];
};
