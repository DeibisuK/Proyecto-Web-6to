import pool from '../config/db.js';

export const findAll = async () => {
  const result = await pool.query('SELECT * FROM marcas');
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query('SELECT * FROM marcas WHERE id_marca = $1', [id]);
  return result.rows[0];
};

export const create = async (marca) => {
  const { nombre_marca } = marca;
  const result = await pool.query(
    'INSERT INTO marcas (nombre_marca) VALUES ($1) RETURNING *',
    [nombre_marca]
  );
  return result.rows[0];
};

export const update = async (id, marca) => {
  const { nombre_marca } = marca;
  const result = await pool.query(
    'UPDATE marcas SET nombre_marca = $1 WHERE id_marca = $2 RETURNING *',
    [nombre_marca, id]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query('DELETE FROM marcas WHERE id_marca = $1 RETURNING *', [id]);
  return result.rows[0];
};
