// ============================================
// SERVICIO 2FA - Lógica de negocio
// ============================================

import TwoFactorModel from '../models/two-factor.model.js';
import nodemailer from 'nodemailer';

export class TwoFactorService {
  /**
   * Genera y envía un código 2FA al email del usuario
   * @param {Object} usuario - Datos del usuario
   * @returns {Object} - Resultado de la operación
   */
  async generarYEnviarCodigo(usuario) {
    try {
      const { uid, email, nombre } = usuario;

      if (!uid || !email) {
        return {
          success: false,
          error: 'UID y email son requeridos'
        };
      }

      // Generar código
      const codigoData = await TwoFactorModel.crearCodigoVerificacion(uid);

      // Enviar email con el código
      const emailEnviado = await this.enviarCodigoPorEmail(
        email,
        nombre || 'Usuario',
        codigoData.codigo
      );

      if (!emailEnviado.success) {
        return {
          success: false,
          error: 'Error al enviar el código de verificación'
        };
      }

      return {
        success: true,
        mensaje: 'Código enviado correctamente',
        expiracion: codigoData.fecha_expiracion,
        // En desarrollo puedes descomentar esto para ver el código
        // codigo: codigoData.codigo
      };
    } catch (error) {
      console.error('❌ Error al generar y enviar código:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verifica el código 2FA ingresado por el usuario
   * @param {string} uid - UID del usuario
   * @param {string} codigo - Código a verificar
   * @returns {Object} - Resultado de la verificación
   */
  async verificarCodigo(uid, codigo) {
    try {
      if (!uid || !codigo) {
        return {
          success: false,
          error: 'UID y código son requeridos'
        };
      }

      // Limpiar el código (remover espacios)
      const codigoLimpio = codigo.toString().trim();

      if (codigoLimpio.length !== 6) {
        return {
          success: false,
          error: 'El código debe tener 6 dígitos'
        };
      }

      const resultado = await TwoFactorModel.verificarCodigo(uid, codigoLimpio);
      
      return {
        success: resultado.valido,
        mensaje: resultado.mensaje,
        razon: resultado.razon
      };
    } catch (error) {
      console.error('❌ Error al verificar código:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Reenvía un código 2FA (invalida el anterior y crea uno nuevo)
   * @param {Object} usuario - Datos del usuario
   * @returns {Object} - Resultado de la operación
   */
  async reenviarCodigo(usuario) {
    // Validar que no haya un código activo muy reciente (prevenir spam)
    const codigoActivo = await TwoFactorModel.obtenerCodigoActivo(usuario.uid);
    
    if (codigoActivo) {
      const tiempoCreacion = new Date(codigoActivo.fecha_creacion).getTime();
      const tiempoActual = Date.now();
      const segundosTranscurridos = (tiempoActual - tiempoCreacion) / 1000;

      // Si el código tiene menos de 30 segundos, no permitir reenvío
      if (segundosTranscurridos < 30) {
        return {
          success: false,
          error: `Debes esperar ${Math.ceil(30 - segundosTranscurridos)} segundos antes de solicitar un nuevo código`
        };
      }
    }

    // Generar y enviar nuevo código
    return this.generarYEnviarCodigo(usuario);
  }



  /**
   * Envía el código 2FA por email usando el notification service
   * @param {string} email - Email del destinatario
   * @param {string} nombre - Nombre del usuario
   * @param {string} codigo - Código 2FA
   * @returns {Object} - Resultado del envío
   */
  async enviarCodigoPorEmail(email, nombre, codigo) {
    try {
      // Plantilla HTML para el email
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <i class="fas fa-shield-alt" style="margin-right: 10px;"></i>Oro Sports Club
              </h1>
              <p style="margin: 12px 0 0 0; font-size: 18px; color: #ffffff; font-weight: 500; opacity: 0.95;">
                Verificación de Seguridad
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <h2 style="color: #2c3e50; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">
                Hola <span style="color: #2ECC71;">${nombre}</span>
              </h2>
              
              <p style="color: #34495e; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
                Has solicitado iniciar sesión en tu cuenta de <strong style="color: #2ECC71;">Oro Sports Club</strong>.
              </p>

              <p style="color: #34495e; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
                Por tu seguridad, usa el siguiente código de verificación:
              </p>

              <!-- Code Box -->
              <div style="background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%); color: #ffffff; font-size: 42px; font-weight: bold; text-align: center; padding: 30px; border-radius: 12px; letter-spacing: 12px; margin: 30px 0; font-family: 'Courier New', monospace; box-shadow: 0 4px 8px rgba(46, 204, 113, 0.3);">
                ${codigo}
              </div>

              <!-- Warning Box -->
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0 0 12px 0; color: #856404; font-size: 14px; line-height: 1.6; font-weight: 600;">
                  <i class="fas fa-exclamation-triangle" style="margin-right: 5px;"></i>Importante:
                </p>
                <p style="margin: 0 0 10px 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>Este código expirará en 3 minutos (180 segundos)</strong>
                </p>
                <p style="margin: 0 0 10px 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  Si no solicitaste este código, ignora este correo y tu cuenta permanecerá segura.
                </p>
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                  <strong>Nunca compartas este código con nadie</strong>. OSC nunca te lo solicitará por teléfono o redes sociales.
                </p>
              </div>

              <!-- Info Box -->
              <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%); border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 0; color: #7f8c8d; font-size: 13px; line-height: 1.6; text-align: center;">
                  <i class="fas fa-lock" style="color: #2ECC71; margin-right: 5px;"></i>
                  Tu seguridad es nuestra prioridad
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #2c3e50; padding: 30px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #ecf0f1; font-weight: 600;">
                Oro Sports Club
              </p>
              <p style="margin: 0 0 15px 0; font-size: 13px; color: #95a5a6;">
                Tu plataforma multideportiva integral
              </p>
              <div style="margin: 15px 0;">
                <p style="margin: 0; font-size: 12px; color: #7f8c8d; line-height: 1.5;">
                  <i class="fas fa-envelope" style="margin-right: 5px;"></i><a href="mailto:noreplycinebyte@gmail.com" style="color: #2ECC71; text-decoration: none;">noreplycinebyte@gmail.com</a>
                </p>
              </div>
              <p style="margin: 15px 0 0 0; font-size: 11px; color: #7f8c8d; line-height: 1.5;">
                Este es un correo automático, por favor no responder directamente.<br>
                © ${new Date().getFullYear()} OSC - Todos los derechos reservados
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Configurar transporter de nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "noreplycinebyte@gmail.com",
          pass: "yzkx vkye nyuk zdxg",
        },
      });

      // Enviar email directamente
      await transporter.sendMail({
        from: '"OSC App" <noreplycinebyte@gmail.com>',
        to: email,
        subject: 'Código de Verificación 2FA - OSC',
        html: htmlContent
      });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Error al enviar el código por email' 
      };
    }
  }

  /**
   * Tarea programada para limpiar códigos expirados
   */
  async limpiarCodigosExpirados() {
    try {
      const cantidad = await TwoFactorModel.limpiarCodigosExpirados();
      return {
        success: true,
        cantidad
      };
    } catch (error) {
      console.error('❌ Error al limpiar códigos:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new TwoFactorService();
