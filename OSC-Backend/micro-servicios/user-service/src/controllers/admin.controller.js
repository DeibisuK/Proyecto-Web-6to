import * as adminService from '../services/admin.service.js';

/**
 * GET /admin/all-users
 * Obtiene todos los usuarios combinando datos de Firebase y BD
 */
export class AdminController {
  static async getAllUsers(req, res) {
    try {
      console.log('📊 [AdminController] Obteniendo todos los usuarios...');
      
      const result = await adminService.getAllUsersCombined();
      
      console.log(`✅ [AdminController] ${result.total} usuarios devueltos`);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ [AdminController] Error en getAllUsers:', error);
      res.status(500).json({
        error: 'internal_error',
        message: error.message || String(error)
      });
    }
  }

  /**
   * POST /admin/assign-role
   * Asigna un rol a un usuario y sincroniza con Firebase
   * Body: { uid: string, id_rol: number }
   */
  static async assignRole(req, res) {
    try {
      const { uid, id_rol } = req.body || {};

      // Validar parámetros
      if (!uid || typeof id_rol === 'undefined') {
        return res.status(400).json({
          error: 'invalid_payload',
          message: 'uid y id_rol son requeridos'
        });
      }

      if (typeof id_rol !== 'number' || id_rol < 1) {
        return res.status(400).json({
          error: 'invalid_payload',
          message: 'id_rol debe ser un número válido'
        });
      }

      console.log(`🔧 [AdminController] Asignando rol ${id_rol} a usuario ${uid}...`);

      const result = await adminService.assignRole(uid, id_rol);

      console.log(`✅ [AdminController] Rol asignado exitosamente`);

      res.status(200).json(result);
    } catch (error) {
      console.error('❌ [AdminController] Error en assignRole:', error);
      
      // Manejar errores específicos
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          error: 'user_not_found',
          message: error.message
        });
      }

      res.status(500).json({
        error: 'internal_error',
        message: error.message || String(error)
      });
    }
  }
}
