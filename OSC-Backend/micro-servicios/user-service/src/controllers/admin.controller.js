import * as adminService from '../services/admin.service.js';

/**
 * GET /admin/all-users
 * Obtiene todos los usuarios combinando datos de Firebase y BD
 */
export class AdminController {
  static async getAllUsers(req, res) {
    try {
      const result = await adminService.getAllUsersCombined();
      res.status(200).json(result);
    } catch (error) {
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

      const result = await adminService.assignRole(uid, id_rol);

      res.status(200).json(result);
    } catch (error) {
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

  /**
   * GET /admin/users/arbitros
   * Obtiene todos los usuarios con rol de árbitro (id_rol = 3)
   */
  static async getArbitros(req, res) {
    try {
      const result = await adminService.getUsersByRole(3);
      
      res.status(200).json({
        success: true,
        data: result,
        total: result.length
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'internal_error',
        message: error.message || String(error)
      });
    }
  }
}
