// ============================================
// MODELO 2FA - Operaciones de base de datos
// ============================================

import db from '../config/db.js';
import crypto from 'crypto';

export const TwoFactorModel = {
  /**
   * Genera un código 2FA de 6 dígitos
   */
  generarCodigo() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  /**
   * Genera un token único para dispositivo confiable
   */
  generarTokenDispositivo() {
    return crypto.randomBytes(32).toString('hex');
  },

  /**
   * Crea un nuevo código 2FA para un usuario
   * @param {string} uid - UID del usuario
   * @returns {Object} - Objeto con el código generado
   */
  async crearCodigoVerificacion(uid) {
    try {
      // Invalidar códigos anteriores no usados
      await db.query(
        'UPDATE codigos_2fa SET usado = true WHERE uid = $1 AND usado = false',
        [uid]
      );

      const codigo = this.generarCodigo();
      const fechaExpiracion = new Date(Date.now() + 180 * 1000); // 180 segundos

      const result = await db.query(
        `INSERT INTO codigos_2fa (uid, codigo, fecha_expiracion)
         VALUES ($1, $2, $3)
         RETURNING id_codigo, codigo, fecha_creacion, fecha_expiracion`,
        [uid, codigo, fechaExpiracion]
      );

      return result.rows[0];
    } catch (error) {
      console.error('❌ Error al crear código 2FA:', error);
      throw error;
    }
  },

  /**
   * Verifica un código 2FA
   * @param {string} uid - UID del usuario
   * @param {string} codigo - Código a verificar
   * @returns {Object} - Resultado de la verificación
   */
  async verificarCodigo(uid, codigo) {
    try {
      const result = await db.query(
        `SELECT * FROM codigos_2fa 
         WHERE uid = $1 
         AND codigo = $2 
         AND usado = false 
         AND fecha_expiracion > NOW()
         ORDER BY fecha_creacion DESC
         LIMIT 1`,
        [uid, codigo]
      );

      if (result.rows.length === 0) {
        // Verificar si el código existe pero expiró
        const expiredResult = await db.query(
          `SELECT * FROM codigos_2fa 
           WHERE uid = $1 
           AND codigo = $2 
           AND usado = false
           ORDER BY fecha_creacion DESC
           LIMIT 1`,
          [uid, codigo]
        );

        if (expiredResult.rows.length > 0) {
          return { 
            valido: false, 
            razon: 'expirado',
            mensaje: 'El código ha expirado. Solicita uno nuevo.' 
          };
        }

        // Incrementar intentos fallidos
        await db.query(
          `UPDATE codigos_2fa 
           SET intentos_fallidos = intentos_fallidos + 1
           WHERE uid = $1 AND usado = false`,
          [uid]
        );

        return { 
          valido: false, 
          razon: 'invalido',
          mensaje: 'Código incorrecto.' 
        };
      }

      // Marcar el código como usado
      await db.query(
        'UPDATE codigos_2fa SET usado = true WHERE id_codigo = $1',
        [result.rows[0].id_codigo]
      );

      return { 
        valido: true, 
        mensaje: 'Código verificado correctamente.',
        codigo_data: result.rows[0]
      };
    } catch (error) {
      console.error('❌ Error al verificar código 2FA:', error);
      throw error;
    }
  },

  /**
   * Obtiene el código 2FA activo de un usuario
   * @param {string} uid - UID del usuario
   * @returns {Object|null} - Código activo o null
   */
  async obtenerCodigoActivo(uid) {
    try {
      const result = await db.query(
        `SELECT * FROM codigos_2fa 
         WHERE uid = $1 
         AND usado = false 
         AND fecha_expiracion > NOW()
         ORDER BY fecha_creacion DESC
         LIMIT 1`,
        [uid]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('❌ Error al obtener código activo:', error);
      throw error;
    }
  },



  /**
   * Limpia códigos 2FA expirados
   */
  async limpiarCodigosExpirados() {
    try {
      const result = await db.query(
        "DELETE FROM codigos_2fa WHERE fecha_expiracion < NOW() - INTERVAL '1 hour'"
      );
      
      if (result.rowCount > 0) {
        console.log(`🧹 Limpiados ${result.rowCount} códigos 2FA expirados`);
      }
      
      return result.rowCount;
    } catch (error) {
      console.error('❌ Error al limpiar códigos expirados:', error);
      throw error;
    }
  }
};

export default TwoFactorModel;
