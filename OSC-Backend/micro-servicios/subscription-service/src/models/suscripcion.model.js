import pool from '../config/db.js';

/**
 * Modelo para gestionar suscripciones de usuarios
 */
class Suscripcion {
  
  /**
   * Crear una nueva suscripción
   */
  static async crear(uidUsuario, idPlan, duracionDias, metodoPago = 'tarjeta') {
    const query = `
      INSERT INTO usuarios_suscripciones 
        (uid_usuario, id_plan, fecha_inicio, fecha_fin, estado, metodo_pago_simulado)
      VALUES 
        ($1, $2, NOW(), NOW() + INTERVAL '1 day' * $3, 'activa', $4)
      RETURNING *
    `;
    
    const result = await pool.query(query, [uidUsuario, idPlan, duracionDias, metodoPago]);
    return result.rows[0];
  }

  /**
   * Obtener la suscripción activa de un usuario
   */
  static async obtenerSuscripcionActiva(uidUsuario) {
    const query = `
      SELECT 
        us.id_suscripcion,
        us.uid_usuario,
        us.id_plan,
        us.fecha_inicio,
        us.fecha_fin,
        us.estado,
        us.metodo_pago_simulado,
        ps.nombre as nombre_plan,
        ps.tipo as tipo_plan,
        ps.precio_simulado,
        ps.duracion_dias
      FROM usuarios_suscripciones us
      INNER JOIN planes_suscripcion ps ON us.id_plan = ps.id_plan
      WHERE us.uid_usuario = $1 
        AND us.estado = 'activa'
        AND us.fecha_fin > NOW()
      ORDER BY us.fecha_fin DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [uidUsuario]);
    return result.rows[0];
  }

  /**
   * Obtener todas las suscripciones de un usuario
   */
  static async obtenerHistorialUsuario(uidUsuario) {
    const query = `
      SELECT 
        us.id_suscripcion,
        us.uid_usuario,
        us.id_plan,
        us.fecha_inicio,
        us.fecha_fin,
        us.estado,
        us.metodo_pago_simulado,
        us.creado_en,
        ps.nombre as nombre_plan,
        ps.tipo as tipo_plan,
        ps.precio_simulado
      FROM usuarios_suscripciones us
      INNER JOIN planes_suscripcion ps ON us.id_plan = ps.id_plan
      WHERE us.uid_usuario = $1
      ORDER BY us.creado_en DESC
    `;
    
    const result = await pool.query(query, [uidUsuario]);
    return result.rows;
  }

  /**
   * Cancelar suscripciones activas anteriores del usuario
   */
  static async cancelarSuscripcionesAnteriores(uidUsuario) {
    const query = `
      UPDATE usuarios_suscripciones
      SET estado = 'cancelada'
      WHERE uid_usuario = $1 
        AND estado = 'activa'
      RETURNING *
    `;
    
    const result = await pool.query(query, [uidUsuario]);
    return result.rows;
  }

  /**
   * Marcar suscripciones caducadas (función de mantenimiento)
   */
  static async marcarSuscripcionesCaducadas() {
    const query = `
      UPDATE usuarios_suscripciones
      SET estado = 'caducada'
      WHERE estado = 'activa' 
        AND fecha_fin < NOW()
      RETURNING *
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Verificar si un usuario tiene suscripción activa
   */
  static async verificarSuscripcionActiva(uidUsuario) {
    const query = `
      SELECT EXISTS(
        SELECT 1 
        FROM usuarios_suscripciones
        WHERE uid_usuario = $1 
          AND estado = 'activa'
          AND fecha_fin > NOW()
      ) as tiene_suscripcion
    `;
    
    const result = await pool.query(query, [uidUsuario]);
    return result.rows[0].tiene_suscripcion;
  }

  /**
   * Cancelar una suscripción específica
   */
  static async cancelar(idSuscripcion, uidUsuario) {
    const query = `
      UPDATE usuarios_suscripciones
      SET estado = 'cancelada', notas = 'Cancelada por el usuario'
      WHERE id_suscripcion = $1 
        AND uid_usuario = $2
        AND estado = 'activa'
      RETURNING *
    `;
    
    const result = await pool.query(query, [idSuscripcion, uidUsuario]);
    return result.rows[0];
  }
}

export default Suscripcion;
