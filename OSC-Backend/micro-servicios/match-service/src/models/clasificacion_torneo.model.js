import pool from '../config/db.js';

// ===== OBTENER CLASIFICACIÓN DE UN TORNEO =====
export const findByTorneo = async (idTorneo, idFase = null, idGrupo = null) => {
  let query = `
    SELECT 
      c.*,
      e.nombre_equipo,
      e.logo_url,
      ROW_NUMBER() OVER (
        PARTITION BY c.id_torneo, c.id_fase, c.id_grupo 
        ORDER BY c.puntos_clasificacion DESC, c.diferencia_puntos DESC, c.puntos_favor DESC
      ) as posicion_calculada
    FROM clasificacion_torneo c
    INNER JOIN equipos e ON c.id_equipo = e.id_equipo
    WHERE c.id_torneo = $1
  `;

  const params = [idTorneo];

  if (idFase) {
    query += ` AND c.id_fase = $${params.length + 1}`;
    params.push(idFase);
  }

  if (idGrupo) {
    query += ` AND c.id_grupo = $${params.length + 1}`;
    params.push(idGrupo);
  }

  query += ` ORDER BY c.id_grupo, posicion_calculada`;

  const result = await pool.query(query, params);
  return result.rows;
};

// ===== OBTENER CLASIFICACIÓN POR GRUPO =====
export const findByGrupo = async (idGrupo) => {
  const result = await pool.query(`
    SELECT 
      c.*,
      e.nombre_equipo,
      e.logo_url,
      ROW_NUMBER() OVER (
        ORDER BY c.puntos_clasificacion DESC, c.diferencia_puntos DESC, c.puntos_favor DESC
      ) as posicion_calculada
    FROM clasificacion_torneo c
    INNER JOIN equipos e ON c.id_equipo = e.id_equipo
    WHERE c.id_grupo = $1
    ORDER BY posicion_calculada
  `, [idGrupo]);
  return result.rows;
};

// ===== OBTENER POSICIÓN DE UN EQUIPO =====
export const findByEquipo = async (idTorneo, idEquipo) => {
  const result = await pool.query(`
    SELECT 
      c.*,
      e.nombre_equipo,
      e.logo_url,
      (
        SELECT COUNT(*) + 1
        FROM clasificacion_torneo c2
        WHERE c2.id_torneo = c.id_torneo
          AND c2.id_fase = c.id_fase
          AND c2.id_grupo = c.id_grupo
          AND (
            c2.puntos_clasificacion > c.puntos_clasificacion OR
            (c2.puntos_clasificacion = c.puntos_clasificacion AND c2.diferencia_puntos > c.diferencia_puntos) OR
            (c2.puntos_clasificacion = c.puntos_clasificacion AND c2.diferencia_puntos = c.diferencia_puntos AND c2.puntos_favor > c.puntos_favor)
          )
      ) as posicion_calculada
    FROM clasificacion_torneo c
    INNER JOIN equipos e ON c.id_equipo = e.id_equipo
    WHERE c.id_torneo = $1 AND c.id_equipo = $2
  `, [idTorneo, idEquipo]);
  return result.rows[0];
};

// ===== CREAR/ACTUALIZAR CLASIFICACIÓN (MANUAL) =====
export const upsert = async (clasificacion) => {
  const {
    id_torneo, id_fase, id_grupo, id_equipo,
    partidos_jugados, partidos_ganados, partidos_empatados, partidos_perdidos,
    puntos_favor, puntos_contra, diferencia_puntos, puntos_clasificacion
  } = clasificacion;

  const result = await pool.query(`
    INSERT INTO clasificacion_torneo (
      id_torneo, id_fase, id_grupo, id_equipo,
      partidos_jugados, partidos_ganados, partidos_empatados, partidos_perdidos,
      puntos_favor, puntos_contra, diferencia_puntos, puntos_clasificacion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    ON CONFLICT (id_torneo, id_fase, id_grupo, id_equipo)
    DO UPDATE SET
      partidos_jugados = $5,
      partidos_ganados = $6,
      partidos_empatados = $7,
      partidos_perdidos = $8,
      puntos_favor = $9,
      puntos_contra = $10,
      diferencia_puntos = $11,
      puntos_clasificacion = $12,
      ultima_actualizacion = CURRENT_TIMESTAMP
    RETURNING *
  `, [
    id_torneo, id_fase, id_grupo, id_equipo,
    partidos_jugados, partidos_ganados, partidos_empatados, partidos_perdidos,
    puntos_favor, puntos_contra, diferencia_puntos, puntos_clasificacion
  ]);

  return result.rows[0];
};

// ===== RECALCULAR CLASIFICACIÓN DE UN TORNEO =====
export const recalcularClasificacion = async (idTorneo) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Limpiar clasificación existente
    await client.query('DELETE FROM clasificacion_torneo WHERE id_torneo = $1', [idTorneo]);

    // Recalcular desde partidos finalizados
    await client.query(`
      INSERT INTO clasificacion_torneo (
        id_torneo, id_fase, id_grupo, id_equipo,
        partidos_jugados, partidos_ganados, partidos_empatados, partidos_perdidos,
        puntos_favor, puntos_contra, diferencia_puntos, puntos_clasificacion
      )
      SELECT 
        p.id_torneo,
        p.id_fase,
        p.id_grupo,
        equipos.id_equipo,
        COUNT(*) as partidos_jugados,
        SUM(CASE 
          WHEN (equipos.id_equipo = p.id_equipo_local AND p.resultado_local > p.resultado_visitante) OR
               (equipos.id_equipo = p.id_equipo_visitante AND p.resultado_visitante > p.resultado_local)
          THEN 1 ELSE 0 
        END) as partidos_ganados,
        SUM(CASE WHEN p.resultado_local = p.resultado_visitante THEN 1 ELSE 0 END) as partidos_empatados,
        SUM(CASE 
          WHEN (equipos.id_equipo = p.id_equipo_local AND p.resultado_local < p.resultado_visitante) OR
               (equipos.id_equipo = p.id_equipo_visitante AND p.resultado_visitante < p.resultado_local)
          THEN 1 ELSE 0 
        END) as partidos_perdidos,
        SUM(CASE 
          WHEN equipos.id_equipo = p.id_equipo_local THEN p.resultado_local
          ELSE p.resultado_visitante
        END) as puntos_favor,
        SUM(CASE 
          WHEN equipos.id_equipo = p.id_equipo_local THEN p.resultado_visitante
          ELSE p.resultado_local
        END) as puntos_contra,
        SUM(CASE 
          WHEN equipos.id_equipo = p.id_equipo_local THEN p.resultado_local - p.resultado_visitante
          ELSE p.resultado_visitante - p.resultado_local
        END) as diferencia_puntos,
        SUM(CASE 
          WHEN (equipos.id_equipo = p.id_equipo_local AND p.resultado_local > p.resultado_visitante) OR
               (equipos.id_equipo = p.id_equipo_visitante AND p.resultado_visitante > p.resultado_local)
          THEN 3
          WHEN p.resultado_local = p.resultado_visitante THEN 1
          ELSE 0 
        END) as puntos_clasificacion
      FROM partidos_torneo p
      CROSS JOIN LATERAL (
        VALUES (p.id_equipo_local), (p.id_equipo_visitante)
      ) AS equipos(id_equipo)
      WHERE p.id_torneo = $1 AND p.estado_partido = 'finalizado'
      GROUP BY p.id_torneo, p.id_fase, p.id_grupo, equipos.id_equipo
    `, [idTorneo]);

    await client.query('COMMIT');
    return { success: true, message: 'Clasificación recalculada' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ===== ELIMINAR CLASIFICACIÓN =====
export const remove = async (idClasificacion) => {
  const result = await pool.query(
    'DELETE FROM clasificacion_torneo WHERE id_clasificacion = $1 RETURNING *',
    [idClasificacion]
  );
  return result.rows[0];
};
