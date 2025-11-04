import Suscripcion from '../models/suscripcion.model.js';
import PlanSuscripcion from '../models/plan.model.js';
import FirebaseClaimsService from './firebase-claims.service.js';

/**
 * Servicio principal de gestión de suscripciones
 */
class SuscripcionService {
  
  /**
   * Simular el pago y activar suscripción
   * @param {string} uidUsuario - UID de Firebase del usuario
   * @param {number} idPlan - ID del plan seleccionado
   * @param {string} metodoPago - Método de pago simulado
   */
  static async simularPago(uidUsuario, idPlan, metodoPago = 'tarjeta') {
    try {
      // 1. Verificar que el plan exista y esté activo
      const plan = await PlanSuscripcion.obtenerPlanPorId(idPlan);
      
      if (!plan) {
        throw new Error('El plan seleccionado no existe o no está disponible');
      }

      // 2. Cancelar suscripciones activas anteriores del usuario
      await Suscripcion.cancelarSuscripcionesAnteriores(uidUsuario);

      // 3. Crear la nueva suscripción
      const nuevaSuscripcion = await Suscripcion.crear(
        uidUsuario,
        idPlan,
        plan.duracion_dias,
        metodoPago
      );

      // 4. Actualizar Firebase Claims
      await FirebaseClaimsService.actualizarClaims(uidUsuario, true, {
        tipo_plan: plan.tipo,
        fecha_fin: nuevaSuscripcion.fecha_fin,
        nombre_plan: plan.nombre
      });

      // 5. Obtener la suscripción completa con datos del plan
      const suscripcionCompleta = await Suscripcion.obtenerSuscripcionActiva(uidUsuario);

      return {
        success: true,
        mensaje: '¡Suscripción activada exitosamente!',
        suscripcion: suscripcionCompleta,
        plan: plan
      };

    } catch (error) {
      console.error('Error al simular pago:', error);
      throw error;
    }
  }

  /**
   * Verificar el estado de suscripción de un usuario
   * @param {string} uidUsuario - UID de Firebase del usuario
   */
  static async verificarEstado(uidUsuario) {
    try {
      const suscripcionActiva = await Suscripcion.obtenerSuscripcionActiva(uidUsuario);
      
      return {
        tieneSuscripcion: !!suscripcionActiva,
        suscripcion: suscripcionActiva,
        esPremium: !!suscripcionActiva
      };

    } catch (error) {
      console.error('Error al verificar estado:', error);
      throw error;
    }
  }

  /**
   * Cancelar suscripción activa
   * @param {string} uidUsuario - UID de Firebase del usuario
   * @param {number} idSuscripcion - ID de la suscripción a cancelar
   */
  static async cancelarSuscripcion(uidUsuario, idSuscripcion) {
    try {
      // 1. Cancelar la suscripción en la BD
      const suscripcionCancelada = await Suscripcion.cancelar(idSuscripcion, uidUsuario);

      if (!suscripcionCancelada) {
        throw new Error('No se encontró la suscripción o ya está cancelada');
      }

      // 2. Remover claims premium de Firebase
      await FirebaseClaimsService.removerClaimsPremium(uidUsuario);

      return {
        success: true,
        mensaje: 'Suscripción cancelada exitosamente',
        suscripcion: suscripcionCancelada
      };

    } catch (error) {
      console.error('Error al cancelar suscripción:', error);
      throw error;
    }
  }

  /**
   * Sincronizar estado con Firebase (útil para mantenimiento)
   * @param {string} uidUsuario - UID de Firebase del usuario
   */
  static async sincronizarConFirebase(uidUsuario) {
    try {
      const resultado = await FirebaseClaimsService.sincronizarEstado(uidUsuario);
      
      return {
        success: true,
        mensaje: 'Estado sincronizado con Firebase',
        ...resultado
      };

    } catch (error) {
      console.error('Error al sincronizar con Firebase:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de suscripciones de un usuario
   * @param {string} uidUsuario - UID de Firebase del usuario
   */
  static async obtenerHistorial(uidUsuario) {
    try {
      const historial = await Suscripcion.obtenerHistorialUsuario(uidUsuario);
      
      return {
        success: true,
        historial: historial,
        total: historial.length
      };

    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los planes disponibles
   */
  static async obtenerPlanes() {
    try {
      const planes = await PlanSuscripcion.obtenerPlanesActivos();
      
      return {
        success: true,
        planes: planes,
        total: planes.length
      };

    } catch (error) {
      console.error('Error al obtener planes:', error);
      throw error;
    }
  }
}

export default SuscripcionService;
