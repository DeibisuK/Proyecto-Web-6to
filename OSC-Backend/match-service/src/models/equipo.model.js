import pool from '../config/db.js';

// Obtener todos los equipos (ADMIN)
export const findAll = async () => {
    const result = await pool.query(`
        SELECT 
            e.*,
            d.nombre_deporte,
            u.name_user as nombre_creador,
            u.email_user as email_creador
        FROM equipos e
        LEFT JOIN deportes d ON e.id_deporte = d.id_deporte
        LEFT JOIN usuarios u ON e.id_usuario_creador = u.id_user
        ORDER BY e.creado_en DESC
    `);
    return result.rows;
};

// Obtener equipos de un usuario específico (por ID de BD)
export const findByUsuario = async (idUsuario) => {
    const result = await pool.query(`
        SELECT 
            e.*,
            d.nombre_deporte
        FROM equipos e
        LEFT JOIN deportes d ON e.id_deporte = d.id_deporte
        WHERE e.id_usuario_creador = $1
        ORDER BY e.creado_en DESC
    `, [idUsuario]);
    return result.rows;
};

// Obtener equipos de un usuario de Firebase (por UID)
export const findByFirebaseUid = async (firebaseUid) => {
    const result = await pool.query(`
        SELECT 
            e.*,
            d.nombre_deporte
        FROM equipos e
        LEFT JOIN deportes d ON e.id_deporte = d.id_deporte
        WHERE e.firebase_uid = $1
        ORDER BY e.creado_en DESC
    `, [firebaseUid]);
    return result.rows;
};

export const findById = async (id) => {
    const result = await pool.query(`
        SELECT 
            e.*,
            d.nombre_deporte
        FROM equipos e
        LEFT JOIN deportes d ON e.id_deporte = d.id_deporte
        WHERE e.id_equipo = $1
    `, [id]);
    return result.rows[0];
};

export const create = async (equipo) => {
    const { nombre_equipo, descripcion, logo_url, id_deporte, id_usuario_creador, firebase_uid } = equipo;
    const result = await pool.query(
        `INSERT INTO equipos (nombre_equipo, descripcion, logo_url, id_deporte, id_usuario_creador, firebase_uid) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`,
        [nombre_equipo, descripcion, logo_url || null, id_deporte || null, id_usuario_creador || null, firebase_uid || null]
    );
    return result.rows[0];
};

export const update = async (id, equipo) => {
    const { nombre_equipo, descripcion, logo_url, id_deporte } = equipo;
    const result = await pool.query(
        'UPDATE equipos SET nombre_equipo = $1, descripcion = $2, logo_url = $3, id_deporte = $4 WHERE id_equipo = $5 RETURNING *',
        [nombre_equipo, descripcion, logo_url || null, id_deporte || null, id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    const result = await pool.query('DELETE FROM equipos WHERE id_equipo = $1 RETURNING *', [id]);
    return result.rows[0];
};

// Verificar si un equipo pertenece a un usuario (por ID de BD)
export const belongsToUser = async (idEquipo, idUsuario) => {
    const result = await pool.query(
        'SELECT id_equipo FROM equipos WHERE id_equipo = $1 AND id_usuario_creador = $2',
        [idEquipo, idUsuario]
    );
    return result.rows.length > 0;
};

// Verificar si un equipo pertenece a un usuario de Firebase
export const belongsToFirebaseUser = async (idEquipo, firebaseUid) => {
    const result = await pool.query(
        'SELECT id_equipo FROM equipos WHERE id_equipo = $1 AND firebase_uid = $2',
        [idEquipo, firebaseUid]
    );
    return result.rows.length > 0;
};
