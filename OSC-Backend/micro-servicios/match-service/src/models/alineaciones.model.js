import pool from '../config/db.js';

// ===== OBTENER ALINEACIÓN DE UN PARTIDO =====
export const findByPartido = async (idPartido) => {
  const result = await pool.query(`
    SELECT 
      a.*,
      j.nombre_completo,
      j.numero_dorsal,
      j.posicion,
      j.es_capitan,
      e.nombre_equipo,
      e.logo_url
    FROM alineaciones a
    INNER JOIN jugadores j ON a.id_jugador = j.id_jugador
    INNER JOIN equipos e ON a.id_equipo = e.id_equipo
    WHERE a.id_partido = $1
    ORDER BY a.id_equipo, a.es_titular DESC, j.numero_dorsal
  `, [idPartido]);
  return result.rows;
};

// ===== OBTENER ALINEACIÓN POR EQUIPO EN UN PARTIDO =====
export const findByPartidoYEquipo = async (idPartido, idEquipo) => {
  const result = await pool.query(`
    SELECT 
      a.*,
      j.nombre_completo,
      j.numero_dorsal,
      j.posicion,
      j.es_capitan
    FROM alineaciones a
    INNER JOIN jugadores j ON a.id_jugador = j.id_jugador
    WHERE a.id_partido = $1 AND a.id_equipo = $2
    ORDER BY a.es_titular DESC, j.numero_dorsal
  `, [idPartido, idEquipo]);
  return result.rows;
};

// ===== AGREGAR JUGADOR A ALINEACIÓN =====
export const create = async (alineacion) => {
  const { id_partido, id_equipo, id_jugador, es_titular, minuto_entrada, minuto_salida } = alineacion;

  const result = await pool.query(`
    INSERT INTO alineaciones (id_partido, id_equipo, id_jugador, es_titular, minuto_entrada, minuto_salida)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [id_partido, id_equipo, id_jugador, es_titular, minuto_entrada, minuto_salida]);

  return result.rows[0];
};

// ===== REGISTRAR SUSTITUCIÓN (CAMBIO) =====
export const registrarSustitucion = async (idPartido, idJugadorSale, idJugadorEntra, minuto) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Marcar jugador que sale
    await client.query(`
      UPDATE alineaciones 
      SET minuto_salida = $1 
      WHERE id_partido = $2 AND id_jugador = $3 AND minuto_salida IS NULL
    `, [minuto, idPartido, idJugadorSale]);

    // Obtener equipo del jugador que sale
    const equipoResult = await client.query(`
      SELECT id_equipo FROM alineaciones 
      WHERE id_partido = $1 AND id_jugador = $2
      LIMIT 1
    `, [idPartido, idJugadorSale]);

    const idEquipo = equipoResult.rows[0]?.id_equipo;

    // Registrar jugador que entra
    await client.query(`
      INSERT INTO alineaciones (id_partido, id_equipo, id_jugador, es_titular, minuto_entrada)
      VALUES ($1, $2, $3, false, $4)
      ON CONFLICT (id_partido, id_jugador) 
      DO UPDATE SET minuto_entrada = $4
    `, [idPartido, idEquipo, idJugadorEntra, minuto]);

    await client.query('COMMIT');
    return { success: true, message: 'Sustitución registrada' };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// ===== ACTUALIZAR ALINEACIÓN =====
export const update = async (idAlineacion, datos) => {
  const { es_titular, minuto_entrada, minuto_salida } = datos;
  
  const result = await pool.query(`
    UPDATE alineaciones 
    SET es_titular = COALESCE($1, es_titular),
        minuto_entrada = COALESCE($2, minuto_entrada),
        minuto_salida = COALESCE($3, minuto_salida)
    WHERE id_alineacion = $4
    RETURNING *
  `, [es_titular, minuto_entrada, minuto_salida, idAlineacion]);

  return result.rows[0];
};

// ===== ELIMINAR DE ALINEACIÓN =====
export const remove = async (idAlineacion) => {
  const result = await pool.query(
    'DELETE FROM alineaciones WHERE id_alineacion = $1 RETURNING *',
    [idAlineacion]
  );
  return result.rows[0];
};

// ===== CREAR ALINEACIÓN COMPLETA DE UN EQUIPO =====
export const crearAlineacionCompleta = async (idPartido, idEquipo, jugadores) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const alineaciones = [];
    for (const jugador of jugadores) {
      const result = await client.query(`
        INSERT INTO alineaciones (id_partido, id_equipo, id_jugador, es_titular)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [idPartido, idEquipo, jugador.id_jugador, jugador.es_titular]);
      
      alineaciones.push(result.rows[0]);
    }

    await client.query('COMMIT');
    return alineaciones;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
