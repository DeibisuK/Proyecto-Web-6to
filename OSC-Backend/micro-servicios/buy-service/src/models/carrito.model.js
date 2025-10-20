import pool from '../config/db.js';

export const findAll = async () => {
  const result = await pool.query('SELECT * FROM carrito');
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query('SELECT * FROM carrito WHERE id_carrito = $1', [id]);
  return result.rows[0];
};

export const findByUserId = async (id_usuario) => {
    const result = await pool.query('SELECT * FROM carrito WHERE id_usuario = $1', [id_usuario]);
    return result.rows[0];
};

export const create = async (carrito) => {
  const { id_usuario } = carrito;
  const result = await pool.query(
    'INSERT INTO carrito (id_usuario) VALUES ($1) RETURNING *',
    [id_usuario]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query('DELETE FROM carrito WHERE id_carrito = $1 RETURNING *', [id]);
  return result.rows[0];
};
