import pool from '../config/db.js';

export const findAll = async () => {
  const result = await pool.query('SELECT * FROM deportes');
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query('SELECT * FROM deportes WHERE id_deporte = $1', [id]);
  return result.rows[0];
};

export const create = async (deporte) => {
  const { nombre_deporte } = deporte;
  const result = await pool.query(
    'INSERT INTO deportes (nombre_deporte) VALUES ($1) RETURNING *',
    [nombre_deporte]
  );
  return result.rows[0];
};

export const update = async (id, deporte) => {
  const { nombre_deporte } = deporte;
  const result = await pool.query(
    'UPDATE deportes SET nombre_deporte = $1 WHERE id_deporte = $2 RETURNING *',
    [nombre_deporte, id]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query('DELETE FROM deportes WHERE id_deporte = $1 RETURNING *', [id]);
  return result.rows[0];
};
