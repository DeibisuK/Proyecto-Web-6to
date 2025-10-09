import pool from '../config/db.js';

export const findAll = async () => {
  const { rows } = await pool.query('SELECT * FROM roles ORDER BY id_rol ASC;');
  return rows;
};

export const findById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM roles WHERE id_rol = $1;', [id]);
  return rows[0];
};

export const create = async ({ nombre_rol }) => {
  const { rows } = await pool.query(
    'INSERT INTO roles (nombre_rol) VALUES ($1) RETURNING *;',
    [nombre_rol]
  );
  return rows[0];
};

export const update = async (id, { nombre_rol }) => {
  const { rows } = await pool.query(
    'UPDATE roles SET nombre_rol = $1 WHERE id_rol = $2 RETURNING *;',
    [nombre_rol, id]
  );
  return rows[0];
};

export const remove = async (id) => {
  const res = await pool.query('DELETE FROM roles WHERE id_rol = $1;', [id]);
  return res.rowCount > 0;
};