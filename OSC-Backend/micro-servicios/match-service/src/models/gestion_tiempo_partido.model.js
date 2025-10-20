import pool from '../config/db.js';

export const findByPartidoId = async (id_partido) => {
    const result = await pool.query('SELECT * FROM gestion_tiempo_partido WHERE id_partido = $1', [id_partido]);
    return result.rows[0];
};

export const create = async (id_partido) => {
    const result = await pool.query(
        'INSERT INTO gestion_tiempo_partido (id_partido) VALUES ($1) RETURNING *',
        [id_partido]
    );
    return result.rows[0];
};

export const update = async (id_partido, gestion) => {
    const { tiempo_extra_minutos, pausas_registradas } = gestion;
    const result = await pool.query(
        'UPDATE gestion_tiempo_partido SET tiempo_extra_minutos = $1, pausas_registradas = $2 WHERE id_partido = $3 RETURNING *',
        [tiempo_extra_minutos, pausas_registradas, id_partido]
    );
    return result.rows[0];
};
