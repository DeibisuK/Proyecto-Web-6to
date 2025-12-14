// ============================================
// CONTROLADOR 2FA - Maneja las peticiones HTTP
// ============================================

import TwoFactorService from '../services/two-factor.service.js';
import { findById } from '../models/users.model.js';

export class TwoFactorController {
  /**
   * POST /two-factor/generate
   * Genera y envía un código 2FA
   */
  async generateCode(req, res) {
    try {
      const { uid, email, nombre } = req.body;

      if (!uid || !email) {
        return res.status(400).json({
          success: false,
          error: 'UID y email son requeridos'
        });
      }

      // Verificar si es un dispositivo confiable
      const tokenDispositivo = req.headers['x-device-token'];
      if (tokenDispositivo) {
        const esConfiable = await TwoFactorService.esDispositivoConfiable(uid, tokenDispositivo);
        if (esConfiable) {
          return res.json({
            success: true,
            requiere2FA: false,
            mensaje: 'Dispositivo confiable. No se requiere verificación.'
          });
        }
      }

      const resultado = await TwoFactorService.generarYEnviarCodigo({
        uid,
        email,
        nombre
      });

      if (!resultado.success) {
        return res.status(500).json(resultado);
      }

      res.json({
        success: true,
        requiere2FA: true,
        mensaje: resultado.mensaje,
        expiracion: resultado.expiracion
      });
    } catch (error) {
      console.error('❌ Error en generateCode:', error);
      res.status(500).json({
        success: false,
        error: 'Error al generar código de verificación'
      });
    }
  }

  /**
   * POST /two-factor/verify
   * Verifica el código 2FA ingresado
   */
  async verifyCode(req, res) {
    try {
      const { uid, codigo } = req.body;

      if (!uid || !codigo) {
        return res.status(400).json({
          success: false,
          error: 'UID y código son requeridos'
        });
      }

      const resultado = await TwoFactorService.verificarCodigo(uid, codigo);

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      res.json({
        success: true,
        mensaje: 'Código verificado correctamente'
      });
    } catch (error) {
      console.error('Error en verifyCode:', error);
      res.status(500).json({
        success: false,
        error: 'Error al verificar código'
      });
    }
  }

  /**
   * POST /two-factor/resend
   * Reenvía un código 2FA
   */
  async resendCode(req, res) {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({
          success: false,
          error: 'UID es requerido'
        });
      }

      // Obtener datos del usuario
      const usuario = await findById(uid);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      const resultado = await TwoFactorService.reenviarCodigo({
        uid: usuario.uid,
        email: usuario.email,
        nombre: usuario.nombre
      });

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      res.json(resultado);
    } catch (error) {
      console.error('Error en resendCode:', error);
      res.status(500).json({
        success: false,
        error: 'Error al reenviar código'
      });
    }
  }
}

export default new TwoFactorController();
