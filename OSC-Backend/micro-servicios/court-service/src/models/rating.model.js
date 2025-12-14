import db from '../config/db.js';

// Obtener todos los ratings de una cancha con información del usuario
export const findByCancha = async (id_cancha) => {
  const query = `
    SELECT 
      r.id_rating,
      r.id_cancha,
      r.firebase_uid,
      r.estrellas,
      r.comentario,
      r.fecha_registro,
      r.fecha_actualizacion,
      r.estado,
      u.name_user as nombre_usuario,
      u.email_user as email_usuario
    FROM ratings_canchas r
    LEFT JOIN usuarios u ON r.firebase_uid = u.uid
    WHERE r.id_cancha = $1 
      AND r.estado = 'activo'
    ORDER BY r.fecha_registro DESC
  `;
  
  const result = await db.query(query, [id_cancha]);
  return result.rows;
};

// Obtener estadísticas de una cancha
export const getEstadisticas = async (id_cancha) => {
  const query = `
    SELECT 
      c.id_cancha,
      c.nombre_cancha,
      COUNT(r.id_rating)::int AS total_ratings,
      ROUND(AVG(r.estrellas)::numeric, 2)::float AS promedio_estrellas,
      SUM(CASE WHEN r.estrellas = 5 THEN 1 ELSE 0 END)::int AS ratings_5_estrellas,
      SUM(CASE WHEN r.estrellas = 4 THEN 1 ELSE 0 END)::int AS ratings_4_estrellas,
      SUM(CASE WHEN r.estrellas = 3 THEN 1 ELSE 0 END)::int AS ratings_3_estrellas,
      SUM(CASE WHEN r.estrellas = 2 THEN 1 ELSE 0 END)::int AS ratings_2_estrellas,
      SUM(CASE WHEN r.estrellas = 1 THEN 1 ELSE 0 END)::int AS ratings_1_estrella,
      MAX(r.fecha_registro) AS ultimo_rating
    FROM canchas c
    LEFT JOIN ratings_canchas r ON c.id_cancha = r.id_cancha AND r.estado = 'activo'
    WHERE c.id_cancha = $1
    GROUP BY c.id_cancha, c.nombre_cancha
  `;
  
  const result = await db.query(query, [id_cancha]);
  return result.rows[0] || null;
};

// Verificar si un usuario ya dejó rating en una cancha
export const findByUserAndCancha = async (id_cancha, firebase_uid) => {
  const query = `
    SELECT 
      r.*,
      u.name_user as nombre_usuario,
      u.email_user as email_usuario
    FROM ratings_canchas r
    LEFT JOIN usuarios u ON r.firebase_uid = u.uid
    WHERE r.id_cancha = $1 
      AND r.firebase_uid = $2
      AND r.estado = 'activo'
  `;
  
  const result = await db.query(query, [id_cancha, firebase_uid]);
  return result.rows[0] || null;
};

// Obtener top canchas mejor valoradas
export const getTopRated = async (limit) => {
  const query = `
    SELECT 
      c.id_cancha,
      c.nombre_cancha,
      COUNT(r.id_rating)::int AS total_ratings,
      ROUND(AVG(r.estrellas)::numeric, 2)::float AS promedio_estrellas,
      SUM(CASE WHEN r.estrellas = 5 THEN 1 ELSE 0 END)::int AS ratings_5_estrellas,
      SUM(CASE WHEN r.estrellas = 4 THEN 1 ELSE 0 END)::int AS ratings_4_estrellas,
      SUM(CASE WHEN r.estrellas = 3 THEN 1 ELSE 0 END)::int AS ratings_3_estrellas,
      SUM(CASE WHEN r.estrellas = 2 THEN 1 ELSE 0 END)::int AS ratings_2_estrellas,
      SUM(CASE WHEN r.estrellas = 1 THEN 1 ELSE 0 END)::int AS ratings_1_estrella
    FROM canchas c
    LEFT JOIN ratings_canchas r ON c.id_cancha = r.id_cancha AND r.estado = 'activo'
    GROUP BY c.id_cancha, c.nombre_cancha
    HAVING COUNT(r.id_rating) >= 5
    ORDER BY promedio_estrellas DESC, total_ratings DESC
    LIMIT $1
  `;
  
  const result = await db.query(query, [limit]);
  return result.rows;
};

// Crear un nuevo rating
export const create = async (ratingData) => {
  const { id_cancha, firebase_uid, estrellas, comentario } = ratingData;
  
  const query = `
    INSERT INTO ratings_canchas (id_cancha, firebase_uid, estrellas, comentario)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  
  const result = await db.query(query, [id_cancha, firebase_uid, estrellas, comentario || null]);
  return result.rows[0];
};

// Actualizar un rating
export const update = async (id_rating, ratingData) => {
  const { estrellas, comentario, estado } = ratingData;
  
  const updates = [];
  const values = [];
  let paramCount = 1;
  
  if (estrellas !== undefined) {
    updates.push(`estrellas = $${paramCount++}`);
    values.push(estrellas);
  }
  
  if (comentario !== undefined) {
    updates.push(`comentario = $${paramCount++}`);
    values.push(comentario);
  }
  
  if (estado !== undefined) {
    updates.push(`estado = $${paramCount++}`);
    values.push(estado);
  }
  
  if (updates.length === 0) {
    return null;
  }
  
  values.push(id_rating);
  
  const query = `
    UPDATE ratings_canchas 
    SET ${updates.join(', ')}
    WHERE id_rating = $${paramCount}
    RETURNING *
  `;
  
  const result = await db.query(query, values);
  return result.rows[0] || null;
};

// Eliminar un rating
export const remove = async (id_rating) => {
  const query = 'DELETE FROM ratings_canchas WHERE id_rating = $1';
  const result = await db.query(query, [id_rating]);
  return result.rowCount > 0;
};
