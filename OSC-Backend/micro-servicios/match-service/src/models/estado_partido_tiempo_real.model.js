import pool from '../config/db.js';

// ===== OBTENER ESTADO EN TIEMPO REAL DE UN PARTIDO =====
export const findByPartido = async (idPartido) => {
  const result = await pool.query(`
    SELECT * FROM estado_partido_tiempo_real 
    WHERE id_partido = $1
  `, [idPartido]);
  return result.rows[0];
};

// ===== CREAR/INICIALIZAR ESTADO EN TIEMPO REAL =====
export const create = async (estado) => {
  const { id_partido, tiempo_actual, periodo_actual, estado: estadoTiempo, puntuacion_detallada } = estado;

  const result = await pool.query(`
    INSERT INTO estado_partido_tiempo_real 
    (id_partido, tiempo_actual, periodo_actual, estado, puntuacion_detallada)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id_partido) 
    DO UPDATE SET 
      tiempo_actual = $2,
      periodo_actual = $3,
      estado = $4,
      puntuacion_detallada = $5,
      ultima_actualizacion = CURRENT_TIMESTAMP
    RETURNING *
  `, [
    id_partido, 
    tiempo_actual || 0, 
    periodo_actual, 
    estadoTiempo || 'detenido',
    puntuacion_detallada ? JSON.stringify(puntuacion_detallada) : null
  ]);

  return result.rows[0];
};

// ===== ACTUALIZAR TIEMPO (INICIAR/PAUSAR/DETENER) =====
export const actualizarTiempo = async (idPartido, datos) => {
  const { tiempo_actual, periodo_actual, estado } = datos;

  const result = await pool.query(`
    UPDATE estado_partido_tiempo_real 
    SET tiempo_actual = COALESCE($1, tiempo_actual),
        periodo_actual = COALESCE($2, periodo_actual),
        estado = COALESCE($3, estado),
        ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_partido = $4
    RETURNING *
  `, [tiempo_actual, periodo_actual, estado, idPartido]);

  return result.rows[0];
};

// ===== INICIAR CRONÓMETRO =====
export const iniciarCronometro = async (idPartido, periodo) => {
  const result = await pool.query(`
    UPDATE estado_partido_tiempo_real 
    SET estado = 'corriendo',
        periodo_actual = COALESCE($2, periodo_actual),
        ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_partido = $1
    RETURNING *
  `, [idPartido, periodo]);

  // También actualizar el partido principal
  await pool.query(`
    UPDATE partidos_torneo 
    SET estado_partido = 'en_curso',
        tiempo_detenido = false,
        ultimo_inicio_tiempo = CURRENT_TIMESTAMP
    WHERE id_partido = $1
  `, [idPartido]);

  return result.rows[0];
};

// ===== PAUSAR CRONÓMETRO =====
export const pausarCronometro = async (idPartido) => {
  const result = await pool.query(`
    UPDATE estado_partido_tiempo_real 
    SET estado = 'pausado',
        ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_partido = $1
    RETURNING *
  `, [idPartido]);

  // Actualizar partido
  await pool.query(`
    UPDATE partidos_torneo 
    SET tiempo_detenido = true
    WHERE id_partido = $1
  `, [idPartido]);

  return result.rows[0];
};

// ===== DETENER CRONÓMETRO =====
export const detenerCronometro = async (idPartido) => {
  const result = await pool.query(`
    UPDATE estado_partido_tiempo_real 
    SET estado = 'detenido',
        ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_partido = $1
    RETURNING *
  `, [idPartido]);

  return result.rows[0];
};

// ===== ACTUALIZAR PUNTUACIÓN DETALLADA =====
export const actualizarPuntuacion = async (idPartido, puntuacionDetallada) => {
  const result = await pool.query(`
    UPDATE estado_partido_tiempo_real 
    SET puntuacion_detallada = $1,
        ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_partido = $2
    RETURNING *
  `, [JSON.stringify(puntuacionDetallada), idPartido]);

  return result.rows[0];
};

// ===== REINICIAR TIEMPO =====
export const reiniciarTiempo = async (idPartido) => {
  const result = await pool.query(`
    UPDATE estado_partido_tiempo_real 
    SET tiempo_actual = 0,
        estado = 'detenido',
        ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_partido = $1
    RETURNING *
  `, [idPartido]);

  return result.rows[0];
};

// ===== ELIMINAR ESTADO =====
export const remove = async (idPartido) => {
  const result = await pool.query(
    'DELETE FROM estado_partido_tiempo_real WHERE id_partido = $1 RETURNING *',
    [idPartido]
  );
  return result.rows[0];
};
