import pool from '../config/db.js';

export const findAll = async () => {
  const result = await pool.query('SELECT * FROM categorias');
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query('SELECT * FROM categorias WHERE id_categoria = $1', [id]);
  return result.rows[0];
};

export const create = async (categoria) => {
  const { nombre_categoria } = categoria;
  const result = await pool.query(
    'INSERT INTO categorias (nombre_categoria) VALUES ($1) RETURNING *',
    [nombre_categoria]
  );
  return result.rows[0];
};

export const update = async (id, categoria) => {
  const { nombre_categoria } = categoria;
  const result = await pool.query(
    'UPDATE categorias SET nombre_categoria = $1 WHERE id_categoria = $2 RETURNING *',
    [nombre_categoria, id]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query('DELETE FROM categorias WHERE id_categoria = $1 RETURNING *', [id]);
  return result.rows[0];
};
