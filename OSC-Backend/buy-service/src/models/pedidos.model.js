import pool from '../config/db.js';

export const findAll = async () => {
    const result = await pool.query('SELECT * FROM pedidos');
    return result.rows;
};

export const findById = async (id) => {
    const result = await pool.query('SELECT * FROM pedidos WHERE id_pedido = $1', [id]);
    return result.rows[0];
};

export const findByUserId = async (id_usuario) => {
    const result = await pool.query('SELECT * FROM pedidos WHERE id_usuario = $1', [id_usuario]);
    return result.rows;
};

export const create = async (pedido) => {
    const { id_usuario, total, estado_pedido, uuid_factura } = pedido;
    const result = await pool.query(
        'INSERT INTO pedidos (id_usuario, total, estado_pedido, uuid_factura) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_usuario, total, estado_pedido, uuid_factura]
    );
    return result.rows[0];
};

export const updateStatus = async (id, estado_pedido) => {
    const result = await pool.query(
        'UPDATE pedidos SET estado_pedido = $1 WHERE id_pedido = $2 RETURNING *',
        [estado_pedido, id]
    );
    return result.rows[0];
};
