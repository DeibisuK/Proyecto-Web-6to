import pool from '../config/db.js';

/**
 * Modelo para gestionar planes de suscripción
 */
class PlanSuscripcion {
  
  /**
   * Obtener todos los planes activos
   */
  static async obtenerPlanesActivos() {
    const query = `
      SELECT 
        id_plan,
        nombre,
        descripcion,
        precio_simulado,
        duracion_dias,
        tipo,
        activo
      FROM planes_suscripcion
      WHERE activo = true
      ORDER BY precio_simulado ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener un plan por su ID
   */
  static async obtenerPlanPorId(idPlan) {
    const query = `
      SELECT 
        id_plan,
        nombre,
        descripcion,
        precio_simulado,
        duracion_dias,
        tipo,
        activo
      FROM planes_suscripcion
      WHERE id_plan = $1 AND activo = true
    `;
    
    const result = await pool.query(query, [idPlan]);
    return result.rows[0];
  }

  /**
   * Obtener un plan por tipo
   */
  static async obtenerPlanPorTipo(tipo) {
    const query = `
      SELECT 
        id_plan,
        nombre,
        descripcion,
        precio_simulado,
        duracion_dias,
        tipo,
        activo
      FROM planes_suscripcion
      WHERE tipo = $1 AND activo = true
      LIMIT 1
    `;
    
    const result = await pool.query(query, [tipo]);
    return result.rows[0];
  }
}

export default PlanSuscripcion;
