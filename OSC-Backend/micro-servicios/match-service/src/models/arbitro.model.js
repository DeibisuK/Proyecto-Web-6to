import pool from '../config/db.js';

export const findAll = async () => {
    const result = await pool.query('SELECT * FROM arbitros');
    return result.rows;
};

export const findById = async (id) => {
    const result = await pool.query('SELECT * FROM arbitros WHERE id_arbitro = $1', [id]);
    return result.rows[0];
};

export const create = async (arbitro) => {
    const { id_usuario, id_deporte, licencia, tarifa_por_partido, estado } = arbitro;
    const result = await pool.query(
        'INSERT INTO arbitros (id_usuario, id_deporte, licencia, tarifa_por_partido, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id_usuario, id_deporte, licencia, tarifa_por_partido, estado]
    );
    return result.rows[0];
};

export const update = async (id, arbitro) => {
    const { licencia, tarifa_por_partido, estado } = arbitro;
    const result = await pool.query(
        'UPDATE arbitros SET licencia = $1, tarifa_por_partido = $2, estado = $3 WHERE id_arbitro = $4 RETURNING *',
        [licencia, tarifa_por_partido, estado, id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    const result = await pool.query('DELETE FROM arbitros WHERE id_arbitro = $1 RETURNING *', [id]);
    return result.rows[0];
};
