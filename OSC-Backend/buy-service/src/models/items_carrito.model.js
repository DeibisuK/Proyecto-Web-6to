import pool from '../config/db.js';

export const findAll = async () => {
    const result = await pool.query('SELECT * FROM items_carrito');
    return result.rows;
};

export const findById = async (id) => {
    const result = await pool.query('SELECT * FROM items_carrito WHERE id_item = $1', [id]);
    return result.rows[0];
};

export const findByCartId = async (id_carrito) => {
    const result = await pool.query('SELECT * FROM items_carrito WHERE id_carrito = $1', [id_carrito]);
    return result.rows;
};

export const create = async (item) => {
    const { id_carrito, id_producto, cantidad, precio_unitario } = item;
    const result = await pool.query(
        'INSERT INTO items_carrito (id_carrito, id_producto, cantidad, precio_unitario) VALUES ($1, $2, $3, $4) RETURNING *',
        [id_carrito, id_producto, cantidad, precio_unitario]
    );
    return result.rows[0];
};

export const update = async (id, item) => {
    const { cantidad } = item;
    const result = await pool.query(
        'UPDATE items_carrito SET cantidad = $1 WHERE id_item = $2 RETURNING *',
        [cantidad, id]
    );
    return result.rows[0];
};

export const remove = async (id) => {
    const result = await pool.query('DELETE FROM items_carrito WHERE id_item = $1 RETURNING *', [id]);
    return result.rows[0];
};

export const clearCart = async (id_carrito) => {
    const result = await pool.query('DELETE FROM items_carrito WHERE id_carrito = $1 RETURNING *', [id_carrito]);
    return result.rows;
}
