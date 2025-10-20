import pool from '../config/db.js';

export const findByEquipoId = async (id_equipo) => {
    const result = await pool.query('SELECT * FROM historial_partidos WHERE id_equipo = $1', [id_equipo]);
    return result.rows[0];
};

export const create = async (id_equipo) => {
    const result = await pool.query(
        'INSERT INTO historial_partidos (id_equipo) VALUES ($1) RETURNING *',
        [id_equipo]
    );
    return result.rows[0];
};

export const update = async (id_equipo, historial) => {
    const { partidos_jugados, partidos_ganados, partidos_perdidos, puntos_ranking } = historial;
    const result = await pool.query(
        'UPDATE historial_partidos SET partidos_jugados = $1, partidos_ganados = $2, partidos_perdidos = $3, puntos_ranking = $4 WHERE id_equipo = $5 RETURNING *',
        [partidos_jugados, partidos_ganados, partidos_perdidos, puntos_ranking, id_equipo]
    );
    return result.rows[0];
};
