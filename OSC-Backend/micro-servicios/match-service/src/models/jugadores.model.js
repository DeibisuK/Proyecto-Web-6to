import pool from '../config/db.js';

// ===== OBTENER TODOS LOS JUGADORES DE UN EQUIPO =====
export const findByEquipo = async (idEquipo) => {
  const result = await pool.query(`
    SELECT 
      j.*,
      u.uid,
      u.name_user as nombre_usuario,
      u.email_user as email
    FROM jugadores j
    LEFT JOIN usuarios u ON j.id_usuario = u.id_user
    WHERE j.id_equipo = $1
    ORDER BY j.numero_dorsal, j.nombre_completo
  `, [idEquipo]);
  return result.rows;
};

// ===== OBTENER JUGADOR POR ID =====
export const findById = async (idJugador) => {
  const result = await pool.query(`
    SELECT 
      j.*,
      e.nombre_equipo,
      e.logo_url,
      u.uid,
      u.name_user as nombre_usuario,
      u.email_user as email
    FROM jugadores j
    INNER JOIN equipos e ON j.id_equipo = e.id_equipo
    LEFT JOIN usuarios u ON j.id_usuario = u.id_user
    WHERE j.id_jugador = $1
  `, [idJugador]);
  return result.rows[0];
};

// ===== CREAR JUGADOR =====
export const create = async (jugador) => {
  const { 
    id_equipo, 
    id_user,
    id_usuario, 
    nombre_completo, 
    numero_dorsal, 
    posicion, 
    es_capitan, 
    estado 
  } = jugador;

  const result = await pool.query(`
    INSERT INTO jugadores (
      id_equipo, id_usuario, nombre_completo, numero_dorsal, 
      posicion, es_capitan, estado
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [
    id_equipo, 
    id_usuario || id_user || null, 
    nombre_completo, 
    numero_dorsal, 
    posicion, 
    es_capitan || false, 
    estado || 'activo'
  ]);

  return result.rows[0];
};

// ===== ACTUALIZAR JUGADOR =====
export const update = async (idJugador, jugador) => {
  const { nombre_completo, numero_dorsal, posicion, es_capitan, estado } = jugador;

  const result = await pool.query(`
    UPDATE jugadores 
    SET nombre_completo = COALESCE($1, nombre_completo),
        numero_dorsal = COALESCE($2, numero_dorsal),
        posicion = COALESCE($3, posicion),
        es_capitan = COALESCE($4, es_capitan),
        estado = COALESCE($5, estado)
    WHERE id_jugador = $6
    RETURNING *
  `, [nombre_completo, numero_dorsal, posicion, es_capitan, estado, idJugador]);

  return result.rows[0];
};

// ===== ELIMINAR JUGADOR =====
export const remove = async (idJugador) => {
  const result = await pool.query(
    'DELETE FROM jugadores WHERE id_jugador = $1 RETURNING *',
    [idJugador]
  );
  return result.rows[0];
};

// ===== BUSCAR JUGADORES POR NOMBRE =====
export const searchByName = async (nombre) => {
  const result = await pool.query(`
    SELECT 
      j.*,
      e.nombre_equipo,
      e.logo_url
    FROM jugadores j
    INNER JOIN equipos e ON j.id_equipo = e.id_equipo
    WHERE j.nombre_completo ILIKE $1
    ORDER BY j.nombre_completo
    LIMIT 20
  `, [`%${nombre}%`]);
  return result.rows;
};

// ===== OBTENER JUGADORES DISPONIBLES (NO SUSPENDIDOS) =====
export const findDisponibles = async (idEquipo) => {
  const result = await pool.query(`
    SELECT * FROM jugadores 
    WHERE id_equipo = $1 AND estado IN ('activo', 'lesionado')
    ORDER BY numero_dorsal, nombre_completo
  `, [idEquipo]);
  return result.rows;
};

// ===== CAMBIAR ESTADO DE JUGADOR =====
export const cambiarEstado = async (idJugador, nuevoEstado) => {
  const result = await pool.query(`
    UPDATE jugadores 
    SET estado = $1 
    WHERE id_jugador = $2
    RETURNING *
  `, [nuevoEstado, idJugador]);

  return result.rows[0];
};

// ===== ASIGNAR CAPITÁN =====
export const asignarCapitan = async (idEquipo, idJugador) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Quitar capitanía a todos del equipo
    await client.query(`
      UPDATE jugadores 
      SET es_capitan = false 
      WHERE id_equipo = $1
    `, [idEquipo]);

    // Asignar nuevo capitán
    const result = await client.query(`
      UPDATE jugadores 
      SET es_capitan = true 
      WHERE id_jugador = $1
      RETURNING *
    `, [idJugador]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
