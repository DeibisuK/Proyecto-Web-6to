import pool from '../config/db.js';

export const findAll = async () => {
  const result = await pool.query('SELECT * FROM productos');
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query('SELECT * FROM productos WHERE id_producto = $1', [id]);
  return result.rows[0];
};

export const create = async (producto) => {
  const { nombre, descripcion, precio, stock, id_categoria, id_deporte } = producto;
  const result = await pool.query(
    'INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria, id_deporte) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [nombre, descripcion, precio, stock, id_categoria, id_deporte]
  );
  return result.rows[0];
};

export const update = async (id, producto) => {
  const { nombre, descripcion, precio, stock, id_categoria, id_deporte } = producto;
  const result = await pool.query(
    'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4, id_categoria = $5, id_deporte = $6 WHERE id_producto = $7 RETURNING *',
    [nombre, descripcion, precio, stock, id_categoria, id_deporte, id]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query('DELETE FROM productos WHERE id_producto = $1 RETURNING *', [id]);
  return result.rows[0];
};
