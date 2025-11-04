import firebaseAdmin from '../config/firebase.js';
import Suscripcion from '../models/suscripcion.model.js';

/**
 * Servicio para sincronizar estado de suscripción con Firebase Custom Claims
 */
class FirebaseClaimsService {
  
  /**
   * Actualizar los claims de Firebase para un usuario
   * @param {string} uid - UID de Firebase del usuario
   * @param {boolean} hasSuscripcion - Si tiene suscripción activa
   * @param {object} suscripcionData - Datos adicionales de la suscripción (opcional)
   */
  static async actualizarClaims(uid, hasSuscripcion, suscripcionData = null) {
    try {
      // Primero obtener los claims existentes para preservarlos
      const user = await firebaseAdmin.auth().getUser(uid);
      const existingClaims = user.customClaims || {};

      // Crear nuevos claims de suscripción
      const subscriptionClaims = {
        premium: hasSuscripcion,
        subscriptionUpdatedAt: new Date().toISOString()
      };

      // Si hay suscripción activa, agregar datos adicionales
      if (hasSuscripcion && suscripcionData) {
        subscriptionClaims.subscriptionType = suscripcionData.tipo_plan;
        subscriptionClaims.subscriptionExpires = suscripcionData.fecha_fin;
        subscriptionClaims.subscriptionPlan = suscripcionData.nombre_plan;
      } else {
        // Si no hay suscripción, eliminar los claims relacionados
        subscriptionClaims.subscriptionType = null;
        subscriptionClaims.subscriptionExpires = null;
        subscriptionClaims.subscriptionPlan = null;
      }

      // Combinar claims existentes con los nuevos (preservando role, id_rol, etc.)
      const updatedClaims = {
        ...existingClaims,
        ...subscriptionClaims
      };

      // Establecer los custom claims combinados en Firebase
      await firebaseAdmin.auth().setCustomUserClaims(uid, updatedClaims);
      
      console.log(`✅ Claims actualizados para ${uid}:`, updatedClaims);
      
      return {
        success: true,
        claims: updatedClaims
      };
    } catch (error) {
      console.error('Error al actualizar claims de Firebase:', error);
      throw new Error('No se pudieron actualizar los claims de Firebase');
    }
  }

  /**
   * Sincronizar el estado de suscripción de la BD con Firebase
   * @param {string} uid - UID de Firebase del usuario
   */
  static async sincronizarEstado(uid) {
    try {
      // Verificar si tiene suscripción activa en la BD
      const suscripcionActiva = await Suscripcion.obtenerSuscripcionActiva(uid);
      
      const hasSuscripcion = !!suscripcionActiva;
      
      // Actualizar los claims
      const result = await this.actualizarClaims(uid, hasSuscripcion, suscripcionActiva);
      
      return {
        success: true,
        hasSuscripcion,
        suscripcion: suscripcionActiva,
        claims: result.claims
      };
    } catch (error) {
      console.error('Error al sincronizar estado:', error);
      throw error;
    }
  }

  /**
   * Remover claims de suscripción (cuando se cancela o caduca)
   * @param {string} uid - UID de Firebase del usuario
   */
  static async removerClaimsPremium(uid) {
    try {
      // Obtener los claims existentes para preservar role, id_rol, etc.
      const user = await firebaseAdmin.auth().getUser(uid);
      const existingClaims = user.customClaims || {};

      // Actualizar solo los claims de suscripción
      const updatedClaims = {
        ...existingClaims,
        premium: false,
        subscriptionType: null,
        subscriptionExpires: null,
        subscriptionPlan: null,
        subscriptionUpdatedAt: new Date().toISOString()
      };

      await firebaseAdmin.auth().setCustomUserClaims(uid, updatedClaims);
      
      console.log(`✅ Claims premium removidos para ${uid}:`, updatedClaims);
      
      return {
        success: true,
        claims: updatedClaims
      };
    } catch (error) {
      console.error('Error al remover claims premium:', error);
      throw new Error('No se pudieron remover los claims premium');
    }
  }

  /**
   * Obtener los claims actuales de un usuario
   * @param {string} uid - UID de Firebase del usuario
   */
  static async obtenerClaims(uid) {
    try {
      const user = await firebaseAdmin.auth().getUser(uid);
      return user.customClaims || {};
    } catch (error) {
      console.error('Error al obtener claims:', error);
      throw new Error('No se pudieron obtener los claims del usuario');
    }
  }

  /**
   * Verificar si un usuario tiene claim premium
   * @param {string} uid - UID de Firebase del usuario
   */
  static async verificarClaimPremium(uid) {
    try {
      const claims = await this.obtenerClaims(uid);
      return claims.premium === true;
    } catch (error) {
      console.error('Error al verificar claim premium:', error);
      return false;
    }
  }
}

export default FirebaseClaimsService;
