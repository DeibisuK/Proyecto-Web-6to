import pool from '../config/db.js';

export const findAll = async () => {
  const result = await pool.query('SELECT * FROM canchas');
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query('SELECT * FROM canchas WHERE id_cancha = $1', [id]);
  return result.rows[0];
};

export const create = async (cancha) => {
  const { nombre, id_deporte, dimensiones, tarifa_hora, estado } = cancha;
  const result = await pool.query(
    'INSERT INTO canchas (nombre, id_deporte, dimensiones, tarifa_hora, estado) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [nombre, id_deporte, dimensiones, tarifa_hora, estado]
  );
  return result.rows[0];
};

export const update = async (id, cancha) => {
  const { nombre, id_deporte, dimensiones, tarifa_hora, estado } = cancha;
  const result = await pool.query(
    'UPDATE canchas SET nombre = $1, id_deporte = $2, dimensiones = $3, tarifa_hora = $4, estado = $5 WHERE id_cancha = $6 RETURNING *',
    [nombre, id_deporte, dimensiones, tarifa_hora, estado, id]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query('DELETE FROM canchas WHERE id_cancha = $1 RETURNING *', [id]);
  return result.rows[0];
};
