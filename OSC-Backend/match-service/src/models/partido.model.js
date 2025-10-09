import pool from '../config/db.js';

export const findAll = async () => {
    const result = await pool.query('SELECT * FROM partidos');
    return result.rows;
};

export const findById = async (id) => {
    const result = await pool.query('SELECT * FROM partidos WHERE id_partido = $1', [id]);
    return result.rows[0];
};

export const create = async (partido) => {
    const { id_cancha, fecha, hora_inicio, tipo_partido, id_arbitro, estado_partido } = partido;
    const result = await pool.query(
        'INSERT INTO partidos (id_cancha, fecha, hora_inicio, tipo_partido, id_arbitro, estado_partido) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [id_cancha, fecha, hora_inicio, tipo_partido, id_arbitro, estado_partido]
    );
    return result.rows[0];
};

export const update = async (id, partido) => {
    const { estado_partido } = partido;
    const result = await pool.query(
        'UPDATE partidos SET estado_partido = $1 WHERE id_partido = $2 RETURNING *',
        [estado_partido, id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    const result = await pool.query('DELETE FROM partidos WHERE id_partido = $1 RETURNING *', [id]);
    return result.rows[0];
};
