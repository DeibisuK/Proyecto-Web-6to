import pool from '../config/db.js';

export const findByPartidoId = async (id_partido) => {
    const result = await pool.query('SELECT * FROM equipos_partido WHERE id_partido = $1', [id_partido]);
    return result.rows;
};

export const create = async (equipoPartido) => {
    const { id_partido, id_equipo, es_local, goles } = equipoPartido;
    const result = await pool.query(
        'INSERT INTO equipos_partido (id_partido, id_equipo, es_local, goles) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_partido, id_equipo, es_local, goles]
    );
    return result.rows[0];
};

export const updateGoles = async (id_equipo_partido, goles) => {
    const result = await pool.query(
        'UPDATE equipos_partido SET goles = $1 WHERE id_equipo_partido = $2 RETURNING *',
        [goles, id_equipo_partido]
    );
    return result.rows[0];
};
