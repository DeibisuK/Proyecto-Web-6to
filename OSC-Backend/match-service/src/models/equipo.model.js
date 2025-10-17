import pool from '../config/db.js';

export const findAll = async () => {
    const result = await pool.query(`
        SELECT 
            e.*,
            d.nombre_deporte
        FROM equipos e
        LEFT JOIN deportes d ON e.id_deporte = d.id_deporte
        ORDER BY e.id_equipo DESC
    `);
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
    const { nombre_equipo, descripcion, logo_url, id_deporte } = equipo;
    const result = await pool.query(
        'INSERT INTO equipos (nombre_equipo, descripcion, logo_url, id_deporte) VALUES ($1, $2, $3, $4) RETURNING *',
        [nombre_equipo, descripcion, logo_url || null, id_deporte || null]
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
