import FirebaseClaimsService from '../services/firebase-claims.service.js';

/**
 * Controlador para gestión de claims de Firebase
 */
class ClaimsController {
  
  /**
   * Obtener los claims actuales del usuario
   * GET /claims/mis-claims
   */
  static async obtenerMisClaims(req, res) {
    try {
      const uidUsuario = req.user?.uid;

      if (!uidUsuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Usuario no autenticado'
        });
      }

      const claims = await FirebaseClaimsService.obtenerClaims(uidUsuario);

      return res.status(200).json({
        success: true,
        claims: claims
      });

    } catch (error) {
      console.error('Error en obtenerMisClaims:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error al obtener los claims'
      });
    }
  }

  /**
   * Re-sincronizar claims preservando los existentes
   * POST /claims/re-sincronizar
   */
  static async reSincronizar(req, res) {
    try {
      const uidUsuario = req.user?.uid;

      if (!uidUsuario) {
        return res.status(401).json({
          success: false,
          mensaje: 'Usuario no autenticado'
        });
      }

      const resultado = await FirebaseClaimsService.sincronizarEstado(uidUsuario);

      return res.status(200).json({
        success: true,
        mensaje: 'Claims re-sincronizados correctamente',
        ...resultado
      });

    } catch (error) {
      console.error('Error en reSincronizar:', error);
      return res.status(500).json({
        success: false,
        mensaje: 'Error al re-sincronizar claims'
      });
    }
  }
}

export default ClaimsController;
