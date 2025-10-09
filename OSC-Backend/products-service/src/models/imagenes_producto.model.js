import pool from '../config/db.js';

export const findAll = async () => {
    const result = await pool.query('SELECT * FROM imagenes_producto');
    return result.rows;
};

export const findById = async (id) => {
    const result = await pool.query('SELECT * FROM imagenes_producto WHERE id_imagen = $1', [id]);
    return result.rows[0];
};

export const findByProductId = async (id_producto) => {
    const result = await pool.query('SELECT * FROM imagenes_producto WHERE id_producto = $1', [id_producto]);
    return result.rows;
};

export const create = async (imagen) => {
    const { id_producto, url_imagen, es_principal } = imagen;
    const result = await pool.query(
        'INSERT INTO imagenes_producto (id_producto, url_imagen, es_principal) VALUES ($1, $2, $3) RETURNING *',
        [id_producto, url_imagen, es_principal]
    );
    return result.rows[0];
};

export const update = async (id, imagen) => {
    const { id_producto, url_imagen, es_principal } = imagen;
    const result = await pool.query(
        'UPDATE imagenes_producto SET id_producto = $1, url_imagen = $2, es_principal = $3 WHERE id_imagen = $4 RETURNING *',
        [id_producto, url_imagen, es_principal, id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    const result = await pool.query('DELETE FROM imagenes_producto WHERE id_imagen = $1 RETURNING *', [id]);
    return result.rows[0];
};
