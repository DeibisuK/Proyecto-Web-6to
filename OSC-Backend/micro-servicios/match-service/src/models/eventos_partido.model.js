import pool from '../config/db.js';

// ===== OBTENER EVENTOS DE UN PARTIDO =====
export const findByPartido = async (idPartido) => {
  const result = await pool.query(`
    SELECT 
      ep.*,
      e.nombre_equipo,
      j.nombre_completo as nombre_jugador,
      j.numero_dorsal,
      ced.nombre_evento,
      ced.valor_puntos,
      ced.icono,
      ced.color
    FROM eventos_partido ep
    LEFT JOIN equipos e ON ep.id_equipo = e.id_equipo
    LEFT JOIN jugadores j ON ep.id_jugador = j.id_jugador
    LEFT JOIN partidos_torneo pt ON ep.id_partido = pt.id_partido
    LEFT JOIN torneos t ON pt.id_torneo = t.id_torneo
    LEFT JOIN configuracion_eventos_deporte ced 
      ON ced.tipo_evento = ep.tipo_evento 
      AND ced.id_deporte = t.id_deporte
    WHERE ep.id_partido = $1
    ORDER BY ep.fecha_registro DESC, ep.minuto DESC
  `, [idPartido]);
  return result.rows;
};

// ===== REGISTRAR EVENTO (GOL, CANASTA, PUNTO, TARJETA, ETC.) =====
export const create = async (evento) => {
  const { 
    id_partido, 
    id_equipo, 
    id_jugador, 
    tipo_evento, 
    minuto, 
    segundo, 
    periodo, 
    valor_numerico, 
    detalles, 
    observacion, 
    registrado_por 
  } = evento;

  const result = await pool.query(`
    INSERT INTO eventos_partido (
      id_partido, id_equipo, id_jugador, tipo_evento, 
      minuto, segundo, periodo, valor_numerico, 
      detalles, observacion, registrado_por
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `, [
    id_partido, id_equipo, id_jugador, tipo_evento,
    minuto, segundo, periodo, valor_numerico,
    detalles ? JSON.stringify(detalles) : null,
    observacion, registrado_por
  ]);

  return result.rows[0];
};

// ===== ELIMINAR EVENTO (POR SI SE REGISTRÓ MAL) =====
export const remove = async (idEvento) => {
  const result = await pool.query(
    'DELETE FROM eventos_partido WHERE id_evento = $1 RETURNING *',
    [idEvento]
  );
  return result.rows[0];
};

// ===== OBTENER GOLEADORES/ANOTADORES DE UN TORNEO =====
export const getGoleadoresByTorneo = async (idTorneo) => {
  const result = await pool.query(`
    SELECT 
      j.id_jugador,
      j.nombre_completo,
      j.numero_dorsal,
      e.nombre_equipo,
      e.logo_url,
      COUNT(ep.id_evento) as total_anotaciones,
      SUM(ced.valor_puntos) as total_puntos
    FROM jugadores j
    INNER JOIN eventos_partido ep ON j.id_jugador = ep.id_jugador
    INNER JOIN partidos_torneo p ON ep.id_partido = p.id_partido
    INNER JOIN torneos t ON p.id_torneo = t.id_torneo
    INNER JOIN configuracion_eventos_deporte ced 
      ON ced.tipo_evento = ep.tipo_evento 
      AND ced.id_deporte = t.id_deporte
    INNER JOIN equipos e ON j.id_equipo = e.id_equipo
    WHERE t.id_torneo = $1 AND ced.valor_puntos > 0
    GROUP BY j.id_jugador, j.nombre_completo, j.numero_dorsal, e.nombre_equipo, e.logo_url
    ORDER BY total_puntos DESC, total_anotaciones DESC
    LIMIT 20
  `, [idTorneo]);
  return result.rows;
};

// ===== OBTENER ESTADÍSTICAS DE UN JUGADOR EN UN PARTIDO =====
export const getEstadisticasJugador = async (idPartido, idJugador) => {
  const result = await pool.query(`
    SELECT 
      ep.tipo_evento,
      ced.nombre_evento,
      COUNT(*) as cantidad,
      SUM(ced.valor_puntos) as puntos_totales
    FROM eventos_partido ep
    INNER JOIN partidos_torneo pt ON ep.id_partido = pt.id_partido
    INNER JOIN torneos t ON pt.id_torneo = t.id_torneo
    INNER JOIN configuracion_eventos_deporte ced 
      ON ced.tipo_evento = ep.tipo_evento 
      AND ced.id_deporte = t.id_deporte
    WHERE ep.id_partido = $1 AND ep.id_jugador = $2
    GROUP BY ep.tipo_evento, ced.nombre_evento
    ORDER BY puntos_totales DESC
  `, [idPartido, idJugador]);
  return result.rows;
};
