import db from '../config/db.js';

/**
 * Obtiene todos los partidos con filtros opcionales
 * @param {Object} filtros - Filtros para la consulta (id_torneo, estado, fecha, id_arbitro)
 * @returns {Promise<Array>}
 */
export const obtenerPartidos = async (filtros = {}) => {
  try {
    let query = `
      SELECT 
        pt.id_partido,
        pt.id_torneo,
        t.nombre as torneo_nombre,
        t.id_sede,
        t.id_deporte,
        d.nombre_deporte,
        pt.id_equipo_local,
        el.nombre_equipo as nombre_equipo_local,
        el.logo_url as logo_equipo_local,
        pt.id_equipo_visitante,
        ev.nombre_equipo as nombre_equipo_visitante,
        ev.logo_url as logo_equipo_visitante,
        pt.fecha_partido,
        pt.hora_inicio,
        pt.estado_partido,
        pt.resultado_local,
        pt.resultado_visitante,
        pt.id_cancha,
        c.nombre_cancha,
        s.nombre as sede_nombre,
        pt.id_arbitro,
        u.name_user as nombre_arbitro,
        u.email_user as email_arbitro,
        pt.nota
      FROM partidos_torneo pt
      INNER JOIN torneos t ON pt.id_torneo = t.id_torneo
      INNER JOIN deportes d ON t.id_deporte = d.id_deporte
      INNER JOIN equipos el ON pt.id_equipo_local = el.id_equipo
      INNER JOIN equipos ev ON pt.id_equipo_visitante = ev.id_equipo
      LEFT JOIN canchas c ON pt.id_cancha = c.id_cancha
      LEFT JOIN sedes s ON c.id_sede = s.id_sede
      LEFT JOIN usuarios u ON pt.id_arbitro = u.id_user
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (filtros.id_torneo) {
      query += ` AND pt.id_torneo = $${paramIndex}`;
      params.push(parseInt(filtros.id_torneo)); // Convertir a integer
      paramIndex++;
    }

    if (filtros.estado) {
      query += ` AND pt.estado_partido = $${paramIndex}`;
      params.push(filtros.estado);
      paramIndex++;
    }

    if (filtros.fecha) {
      query += ` AND pt.fecha_partido = $${paramIndex}`;
      params.push(filtros.fecha);
      paramIndex++;
    }

    if (filtros.id_arbitro) {
      query += ` AND pt.id_arbitro = $${paramIndex}`;
      params.push(parseInt(filtros.id_arbitro));
      paramIndex++;
    }

    query += ` ORDER BY pt.fecha_partido ASC, pt.hora_inicio ASC`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene un partido por ID
 * @param {number} id - ID del partido
 * @returns {Promise<Object>}
 */
export const obtenerPartidoPorId = async (id) => {
  try {
    const query = `
      SELECT 
        pt.*,
        t.nombre as torneo_nombre,
        d.nombre_deporte,
        el.nombre_equipo as nombre_equipo_local,
        el.logo_url as logo_equipo_local,
        ev.nombre_equipo as nombre_equipo_visitante,
        ev.logo_url as logo_equipo_visitante,
        c.nombre_cancha,
        s.nombre as sede_nombre,
        u.name_user as nombre_arbitro,
        u.email_user as email_arbitro
      FROM partidos_torneo pt
      INNER JOIN torneos t ON pt.id_torneo = t.id_torneo
      INNER JOIN deportes d ON t.id_deporte = d.id_deporte
      INNER JOIN equipos el ON pt.id_equipo_local = el.id_equipo
      INNER JOIN equipos ev ON pt.id_equipo_visitante = ev.id_equipo
      LEFT JOIN canchas c ON pt.id_cancha = c.id_cancha
      LEFT JOIN sedes s ON c.id_sede = s.id_sede
      LEFT JOIN usuarios u ON CAST(t.id_arbitro AS TEXT) = u.uid
      WHERE pt.id_partido = $1
    `;

    const result = await db.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Asigna un árbitro a un partido
 * @param {number} idPartido - ID del partido
 * @param {string} idArbitro - UID del árbitro (Firebase)
 * @returns {Promise<Object>}
 */
export const asignarArbitro = async (idPartido, idArbitro) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar que el partido existe y obtener el id_torneo
    const partidoResult = await client.query(
      'SELECT id_torneo, estado_partido FROM partidos_torneo WHERE id_partido = $1',
      [idPartido]
    );

    if (partidoResult.rows.length === 0) {
      throw new Error('Partido no encontrado');
    }

    const { id_torneo, estado_partido } = partidoResult.rows[0];
    if (estado_partido !== 'programado' && estado_partido !== 'por_programar') {
      throw new Error(`No se puede asignar árbitro a un partido con estado "${estado_partido}"`);
    }

    // Verificar que el árbitro existe y tiene rol correcto
    const arbitroResult = await client.query(
      'SELECT id_rol FROM usuarios WHERE id_user = $1',
      [idArbitro]
    );

    if (arbitroResult.rows.length === 0) {
      throw new Error('Árbitro no encontrado');
    }

    if (arbitroResult.rows[0].id_rol !== 3) {
      throw new Error('El usuario seleccionado no tiene rol de árbitro');
    }

    // Asignar árbitro al partido
    const updateResult = await client.query(
      `UPDATE partidos_torneo 
       SET id_arbitro = $1
       WHERE id_partido = $2
       RETURNING *`,
      [idArbitro, idPartido]
    );

    // Obtener partido actualizado
    const partidoActualizado = await client.query(
      'SELECT * FROM partidos_torneo WHERE id_partido = $1',
      [idPartido]
    );

    // Registrar en historial (si existe la tabla)
    // TODO: Verificar estructura de tabla historial_cambios_partido
    /*
    try {
      await client.query(
        `INSERT INTO historial_cambios_partido 
         (id_partido, campo_modificado, valor_anterior, valor_nuevo, modificado_por)
         VALUES ($1, 'id_arbitro', NULL, $2, 'admin')`,
        [idPartido, idArbitro]
      );
    } catch (historialError) {
      // Ignorar si la tabla no existe
      console.log('Historial no disponible:', historialError.message);
    }
    */

    await client.query('COMMIT');
    return partidoActualizado.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Remueve el árbitro asignado de un partido
 * @param {number} idPartido - ID del partido
 * @returns {Promise<Object>}
 */
export const removerArbitro = async (idPartido) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    // Obtener id_torneo y árbitro actual
    const partidoActual = await client.query(
      `SELECT pt.id_torneo, pt.estado_partido, t.id_arbitro
       FROM partidos_torneo pt
       INNER JOIN torneos t ON pt.id_torneo = t.id_torneo
       WHERE pt.id_partido = $1`,
      [idPartido]
    );

    if (partidoActual.rows.length === 0) {
      throw new Error('Partido no encontrado');
    }

    const { id_torneo, id_arbitro, estado_partido } = partidoActual.rows[0];

    if (!id_arbitro) {
      throw new Error('Este torneo no tiene árbitro asignado');
    }

    if (estado_partido === 'en_curso' || estado_partido === 'finalizado') {
      throw new Error(`No se puede remover árbitro de un partido ${estado_partido}`);
    }

    // Remover árbitro del torneo
    const updateResult = await client.query(
      `UPDATE torneos 
       SET id_arbitro = NULL
       WHERE id_torneo = $1
       RETURNING *`,
      [id_torneo]
    );

    // Obtener partido actualizado
    const partidoActualizado = await client.query(
      'SELECT * FROM partidos_torneo WHERE id_partido = $1',
      [idPartido]
    );

    // Registrar en historial (si existe la tabla)
    // TODO: Verificar estructura de tabla historial_cambios_partido
    /*
    try {
      await client.query(
        `INSERT INTO historial_cambios_partido 
         (id_partido, campo_modificado, valor_anterior, valor_nuevo, modificado_por)
         VALUES ($1, 'id_arbitro', $2, NULL, 'admin')`,
        [idPartido, id_arbitro]
      );
    } catch (historialError) {
      console.log('Historial no disponible:', historialError.message);
    }
    */

    await client.query('COMMIT');
    return partidoActualizado.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Asigna una cancha a un partido
 * @param {number} idPartido - ID del partido
 * @param {number} idCancha - ID de la cancha
 * @returns {Promise<Object>}
 */
export const asignarCancha = async (idPartido, idCancha) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    // Verificar que el partido existe
    const partidoResult = await client.query(
      'SELECT estado_partido FROM partidos_torneo WHERE id_partido = $1',
      [idPartido]
    );

    if (partidoResult.rows.length === 0) {
      throw new Error('Partido no encontrado');
    }

    const { estado_partido } = partidoResult.rows[0];
    if (estado_partido !== 'programado' && estado_partido !== 'por_programar') {
      throw new Error(`No se puede asignar cancha a un partido con estado "${estado_partido}"`);
    }

    // Verificar que la cancha existe
    const canchaResult = await client.query(
      'SELECT id_cancha FROM canchas WHERE id_cancha = $1',
      [idCancha]
    );

    if (canchaResult.rows.length === 0) {
      throw new Error('Cancha no encontrada');
    }

    // Asignar cancha al partido
    await client.query(
      `UPDATE partidos_torneo 
       SET id_cancha = $1
       WHERE id_partido = $2`,
      [idCancha, idPartido]
    );

    // Obtener partido actualizado
    const partidoActualizado = await client.query(
      'SELECT * FROM partidos_torneo WHERE id_partido = $1',
      [idPartido]
    );

    await client.query('COMMIT');
    return partidoActualizado.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Actualiza datos de un partido
 * @param {number} id - ID del partido
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<Object>}
 */
export const actualizarPartido = async (id, datos) => {
  try {
    const camposPermitidos = ['fecha_partido', 'hora_inicio', 'id_cancha', 'notas'];
    const campos = [];
    const valores = [];
    let paramIndex = 1;

    Object.keys(datos).forEach((campo) => {
      if (camposPermitidos.includes(campo)) {
        campos.push(`${campo} = $${paramIndex}`);
        valores.push(datos[campo]);
        paramIndex++;
      }
    });

    if (campos.length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    campos.push(`actualizado_en = CURRENT_TIMESTAMP`);
    valores.push(id);

    const query = `
      UPDATE partidos_torneo 
      SET ${campos.join(', ')}
      WHERE id_partido = $${paramIndex}
      RETURNING *
    `;

    const result = await db.query(query, valores);
    
    if (result.rows.length === 0) {
      throw new Error('Partido no encontrado');
    }

    return result.rows[0];
  } catch (error) {
    throw error;
  }
};
