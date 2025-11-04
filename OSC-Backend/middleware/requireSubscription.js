import pool from '../micro-servicios/subscription-service/src/config/db.js';

/**
 * Middleware para verificar que el usuario tenga una suscripción activa
 * Debe usarse después del middleware authenticate
 */
const requireSubscription = async (req, res, next) => {
  try {
    const uidUsuario = req.user?.uid; // Proviene del middleware authenticate

    if (!uidUsuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'No autenticado. El middleware authenticate debe ejecutarse primero.'
      });
    }

    // Verificar si el usuario tiene una suscripción activa
    const query = `
      SELECT 
        us.id_suscripcion,
        us.uid_usuario,
        us.estado,
        us.fecha_fin,
        ps.nombre as nombre_plan,
        ps.tipo as tipo_plan
      FROM usuarios_suscripciones us
      INNER JOIN planes_suscripcion ps ON us.id_plan = ps.id_plan
      WHERE us.uid_usuario = $1 
        AND us.estado = 'activa'
        AND us.fecha_fin > NOW()
      ORDER BY us.fecha_fin DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [uidUsuario]);

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        mensaje: 'Acceso denegado. Se requiere una suscripción premium activa para acceder a esta funcionalidad.',
        requiresSubscription: true,
        code: 'NO_ACTIVE_SUBSCRIPTION'
      });
    }

    // Adjuntar información de la suscripción al request
    req.suscripcion = result.rows[0];
    
    // Continuar con la siguiente función
    next();

  } catch (error) {
    console.error('Error en middleware requireSubscription:', error);
    return res.status(500).json({
      success: false,
      mensaje: 'Error al verificar la suscripción'
    });
  }
};

export default requireSubscription;
