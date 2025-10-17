import pool from '../config/db.js';

export const findAll = async () => {
  const result = await pool.query(`
    SELECT 
      c.*,
      s.nombre AS nombre_sede,
      d.nombre_deporte AS nombre_deporte
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    ORDER BY c.id_cancha DESC
  `);
  return result.rows;
};

export const findById = async (id) => {
  const result = await pool.query(`
    SELECT 
      c.*,
      s.nombre AS nombre_sede,
      d.nombre_deporte AS nombre_deporte
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    WHERE c.id_cancha = $1
  `, [id]);
  return result.rows[0];
};

export const findBySede = async (idSede) => {
  const result = await pool.query(`
    SELECT 
      c.*,
      s.nombre AS nombre_sede,
      d.nombre_deporte AS nombre_deporte
    FROM canchas c
    LEFT JOIN sedes s ON c.id_sede = s.id_sede
    LEFT JOIN deportes d ON c.id_deporte = d.id_deporte
    WHERE c.id_sede = $1
    ORDER BY c.nombre_cancha
  `, [idSede]);
  return result.rows;
};

export const create = async (cancha) => {
  const { 
    nombre_cancha, 
    id_sede, 
    id_deporte, 
    largo, 
    ancho, 
    tarifa, 
    tipo_superficie, 
    estado, 
    imagen_url 
  } = cancha;
  
  const result = await pool.query(
    `INSERT INTO canchas 
    (nombre_cancha, id_sede, id_deporte, largo, ancho, tarifa, tipo_superficie, estado, imagen_url) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
    RETURNING *`,
    [nombre_cancha, id_sede, id_deporte, largo, ancho, tarifa, tipo_superficie, estado, imagen_url]
  );
  return result.rows[0];
};

export const update = async (id, cancha) => {
  const { 
    nombre_cancha, 
    id_sede, 
    id_deporte, 
    largo, 
    ancho, 
    tarifa, 
    tipo_superficie, 
    estado, 
    imagen_url 
  } = cancha;
  
  const result = await pool.query(
    `UPDATE canchas 
    SET nombre_cancha = $1, id_sede = $2, id_deporte = $3, largo = $4, ancho = $5, 
        tarifa = $6, tipo_superficie = $7, estado = $8, imagen_url = $9
    WHERE id_cancha = $10 
    RETURNING *`,
    [nombre_cancha, id_sede, id_deporte, largo, ancho, tarifa, tipo_superficie, estado, imagen_url, id]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await pool.query('DELETE FROM canchas WHERE id_cancha = $1 RETURNING *', [id]);
  return result.rows[0];
};

