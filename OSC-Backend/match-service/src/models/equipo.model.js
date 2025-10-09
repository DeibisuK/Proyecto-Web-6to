import pool from '../config/db.js';

export const findAll = async () => {
    const result = await pool.query('SELECT * FROM equipos');
    return result.rows;
};

export const findById = async (id) => {
    const result = await pool.query('SELECT * FROM equipos WHERE id_equipo = $1', [id]);
    return result.rows[0];
};

export const create = async (equipo) => {
    const { nombre_equipo, descripcion, url_foto } = equipo;
    const result = await pool.query(
        'INSERT INTO equipos (nombre_equipo, descripcion, url_foto) VALUES ($1, $2, $3) RETURNING *',
        [nombre_equipo, descripcion, url_foto]
    );
    return result.rows[0];
};

export const update = async (id, equipo) => {
    const { nombre_equipo, descripcion, url_foto } = equipo;
    const result = await pool.query(
        'UPDATE equipos SET nombre_equipo = $1, descripcion = $2, url_foto = $3 WHERE id_equipo = $4 RETURNING *',
        [nombre_equipo, descripcion, url_foto, id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    const result = await pool.query('DELETE FROM equipos WHERE id_equipo = $1 RETURNING *', [id]);
    return result.rows[0];
};
