import pool from '../config/db.js';

export const findAll = async () => {
  const result = await pool.query('SELECT * FROM sedes ORDER BY ciudad, nombre');
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(
    'SELECT * FROM sedes WHERE id_sede = $1', 
    [id]
  );
  return result.rows[0];
};

export const create = async ({
  nombre,
  ciudad,
  direccion,
  estado = 'Activo',
  latitud,
  longitud,
  telefono,
  email
}) => {
  const result = await pool.query(
    `INSERT INTO sedes (nombre, ciudad, direccion, estado, latitud, longitud, telefono, email) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [nombre, ciudad, direccion, estado, latitud, longitud, telefono, email]
  );
  return result.rows[0];
};

export const update = async (id, datos) => {
  const { nombre, ciudad, direccion, estado, latitud, longitud, telefono, email } = datos;
  const result = await pool.query(
    `UPDATE sedes SET 
       nombre = $1,
       ciudad = $2,
       direccion = $3,
       estado = $4,
       latitud = $5,
       longitud = $6,
       telefono = $7,
       email = $8
     WHERE id_sede = $9 RETURNING *`,
    [nombre, ciudad, direccion, estado, latitud, longitud, telefono, email, id]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query(
    'DELETE FROM sedes WHERE id_sede = $1 RETURNING *', 
    [id]
  );
  return result.rows[0];
};
