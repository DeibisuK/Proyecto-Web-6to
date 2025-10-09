import db from '../config/db.js';

export const findAll = async () => {
  const res = await db.query('SELECT * FROM usuarios');
  return res.rows;
}

export const findById = async (id) => {
  const res = await db.query('SELECT * FROM usuarios WHERE id_user = $1', [id]);
  return res.rows[0];
}

export const create = async (user) => {
  const { nombre, apellido, email, password, id_rol } = user;
  const res = await db.query(
    'INSERT INTO usuarios (nombre, apellido, email, password, id_rol) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [nombre, apellido, email, password, id_rol]
  );
  return res.rows[0];
}

export const update = async (id, user) => {
  const { nombre, apellido, email, password, id_rol } = user;
  const res = await db.query(
    'UPDATE usuarios SET nombre = $1, apellido = $2, email = $3, password = $4, id_rol = $5 WHERE id_user = $6 RETURNING *',
    [nombre, apellido, email, password, id_rol, id]
  );
  return res.rows[0];
}

export const remove = async (id) => {
  const res = await db.query('DELETE FROM usuarios WHERE id_user = $1', [id]);
  return res.rowCount > 0;
}
  