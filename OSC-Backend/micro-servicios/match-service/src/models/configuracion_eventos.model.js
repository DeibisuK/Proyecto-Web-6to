import pool from '../config/db.js';

// ===== OBTENER EVENTOS CONFIGURADOS POR DEPORTE =====
export const findByDeporte = async (idDeporte) => {
  const result = await pool.query(`
    SELECT * FROM configuracion_eventos_deporte 
    WHERE id_deporte = $1 AND activo = true
    ORDER BY orden, id_config
  `, [idDeporte]);
  return result.rows;
};

// ===== OBTENER TODOS LOS EVENTOS =====
export const findAll = async () => {
  const result = await pool.query(`
    SELECT 
      ced.*,
      d.nombre as nombre_deporte
    FROM configuracion_eventos_deporte ced
    INNER JOIN deportes d ON ced.id_deporte = d.id_deporte
    WHERE ced.activo = true
    ORDER BY d.nombre, ced.orden
  `);
  return result.rows;
};

// ===== OBTENER EVENTO POR ID =====
export const findById = async (idConfig) => {
  const result = await pool.query(`
    SELECT 
      ced.*,
      d.nombre as nombre_deporte
    FROM configuracion_eventos_deporte ced
    INNER JOIN deportes d ON ced.id_deporte = d.id_deporte
    WHERE ced.id_config = $1
  `, [idConfig]);
  return result.rows[0];
};

// ===== CREAR EVENTO =====
export const create = async (evento) => {
  const { 
    id_deporte, 
    tipo_evento, 
    nombre_evento, 
    valor_puntos, 
    icono, 
    color, 
    orden,
    activo 
  } = evento;

  const result = await pool.query(`
    INSERT INTO configuracion_eventos_deporte (
      id_deporte, tipo_evento, nombre_evento, valor_puntos, 
      icono, color, orden, activo
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [
    id_deporte,
    tipo_evento,
    nombre_evento,
    valor_puntos || 0,
    icono,
    color,
    orden || 0,
    activo !== undefined ? activo : true
  ]);

  return result.rows[0];
};

// ===== ACTUALIZAR EVENTO =====
export const update = async (idConfig, evento) => {
  const { nombre_evento, valor_puntos, icono, color, orden, activo } = evento;

  const result = await pool.query(`
    UPDATE configuracion_eventos_deporte 
    SET nombre_evento = COALESCE($1, nombre_evento),
        valor_puntos = COALESCE($2, valor_puntos),
        icono = COALESCE($3, icono),
        color = COALESCE($4, color),
        orden = COALESCE($5, orden),
        activo = COALESCE($6, activo)
    WHERE id_config = $7
    RETURNING *
  `, [nombre_evento, valor_puntos, icono, color, orden, activo, idConfig]);

  return result.rows[0];
};

// ===== ELIMINAR/DESACTIVAR EVENTO =====
export const remove = async (idConfig) => {
  // No eliminar físicamente, solo desactivar
  const result = await pool.query(`
    UPDATE configuracion_eventos_deporte 
    SET activo = false 
    WHERE id_config = $1
    RETURNING *
  `, [idConfig]);

  return result.rows[0];
};

// ===== ACTIVAR EVENTO =====
export const activar = async (idConfig) => {
  const result = await pool.query(`
    UPDATE configuracion_eventos_deporte 
    SET activo = true 
    WHERE id_config = $1
    RETURNING *
  `, [idConfig]);

  return result.rows[0];
};
