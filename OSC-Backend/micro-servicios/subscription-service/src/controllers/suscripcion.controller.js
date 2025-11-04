import SuscripcionService from '../services/suscripcion.service.js';

/**
 * Controlador para gestión de suscripciones
 */
class SuscripcionController {
  
  /**
   * Simular pago y activar suscripción
   * POST /suscripciones/simular-pago
   */
  static async simularPago(req, res) {
    try {
      const { idPlan, metodoPago } = req.body;
      const uidUsuario = req.user?.uid; // Del middleware authenticate

      if (!uidUsuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Usuario no autenticado'
        });
      }

      if (!idPlan) {
        return res.status(400).json({
          success: false,
          mensaje: 'El ID del plan es requerido'
        });
      }

      const resultado = await SuscripcionService.simularPago(
        uidUsuario,
        idPlan,
        metodoPago || 'tarjeta'
      );

      return res.status(201).json(resultado);

    } catch (error) {
      console.error('Error en simularPago:', error);
      return res.status(500).json({
        success: false,
        mensaje: error.message || 'Error al procesar la suscripción'
      });
    }
  }

  /**
   * Verificar estado de suscripción del usuario
   * GET /suscripciones/estado
   */
  static async verificarEstado(req, res) {
    try {
      const uidUsuario = req.user?.uid; // Del middleware authenticate

      if (!uidUsuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Usuario no autenticado'
        });
      }

      const resultado = await SuscripcionService.verificarEstado(uidUsuario);

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en verificarEstado:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error al verificar el estado de la suscripción'
      });
    }
  }

  /**
   * Cancelar suscripción activa
   * POST /suscripciones/cancelar
   */
  static async cancelarSuscripcion(req, res) {
    try {
      const { idSuscripcion } = req.body;
      const uidUsuario = req.user?.uid; // Del middleware authenticate

      if (!uidUsuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Usuario no autenticado'
        });
      }

      if (!idSuscripcion) {
        return res.status(400).json({
          success: false,
          mensaje: 'El ID de la suscripción es requerido'
        });
      }

      const resultado = await SuscripcionService.cancelarSuscripcion(
        uidUsuario,
        idSuscripcion
      );

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en cancelarSuscripcion:', error);
      return res.status(500).json({
        success: false,
        mensaje: error.message || 'Error al cancelar la suscripción'
      });
    }
  }

  /**
   * Sincronizar estado con Firebase
   * POST /suscripciones/sincronizar
   */
  static async sincronizarConFirebase(req, res) {
    try {
      const uidUsuario = req.user?.uid; // Del middleware authenticate

      if (!uidUsuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Usuario no autenticado'
        });
      }

      const resultado = await SuscripcionService.sincronizarConFirebase(uidUsuario);

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en sincronizarConFirebase:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error al sincronizar con Firebase'
      });
    }
  }

  /**
   * Obtener historial de suscripciones
   * GET /suscripciones/historial
   */
  static async obtenerHistorial(req, res) {
    try {
      const uidUsuario = req.user?.uid; // Del middleware authenticate

      if (!uidUsuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Usuario no autenticado'
        });
      }

      const resultado = await SuscripcionService.obtenerHistorial(uidUsuario);

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en obtenerHistorial:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error al obtener el historial de suscripciones'
      });
    }
  }

  /**
   * Obtener todos los planes disponibles
   * GET /suscripciones/planes
   */
  static async obtenerPlanes(req, res) {
    try {
      const resultado = await SuscripcionService.obtenerPlanes();

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en obtenerPlanes:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error al obtener los planes disponibles'
      });
    }
  }
}

export default SuscripcionController;
