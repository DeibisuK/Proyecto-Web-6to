// ============================================
// NOTIFICATION SERVICE - Lógica de negocio
// ============================================

import { NotificationRepository } from './notification.repository.js';

const repository = new NotificationRepository();

export class NotificationService {
  
  // Obtener notificaciones con filtros
  async getNotifications(filters) {
    try {
      const notifications = await repository.getNotifications(filters);
      return { success: true, data: notifications };
    } catch (error) {
      console.error('❌ Error al obtener notificaciones:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Obtener contador de no leídas
  async getUnreadCount(uid) {
    try {
      const count = await repository.getUnreadCount(uid);
      return { success: true, unread: count };
    } catch (error) {
      console.error('❌ Error al contar notificaciones:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Crear notificación
  async createNotification(notification) {
    try {
      // Validaciones básicas
      if (!notification.uid_usuario || !notification.asunto) {
        return { 
          success: false, 
          error: 'uid_usuario y asunto son requeridos' 
        };
      }
      
      const newNotification = await repository.createNotification(notification);
      return { success: true, data: newNotification };
    } catch (error) {
      console.error('❌ Error al crear notificación:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Marcar como leída
  async markAsRead(id_notificacion, uid) {
    try {
      const notification = await repository.markAsRead(id_notificacion, uid);
      
      if (!notification) {
        return { success: false, error: 'Notificación no encontrada' };
      }
      
      return { success: true, data: notification };
    } catch (error) {
      console.error('❌ Error al marcar notificación:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Marcar todas como leídas
  async markAllAsRead(uid) {
    try {
      const count = await repository.markAllAsRead(uid);
      return { success: true, updated: count };
    } catch (error) {
      console.error('❌ Error al marcar todas:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Eliminar notificación
  async deleteNotification(id_notificacion, uid) {
    try {
      const deleted = await repository.deleteNotification(id_notificacion, uid);
      
      if (!deleted) {
        return { success: false, error: 'Notificación no encontrada' };
      }
      
      return { success: true, message: 'Notificación eliminada' };
    } catch (error) {
      console.error('❌ Error al eliminar notificación:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Eliminar todas las leídas
  async deleteAllRead(uid) {
    try {
      const count = await repository.deleteAllRead(uid);
      return { success: true, deleted: count };
    } catch (error) {
      console.error('❌ Error al eliminar leídas:', error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // ANUNCIOS GLOBALES
  // ============================================

  // Crear anuncio global
  async createAnuncio(anuncio) {
    try {
      if (!anuncio.titulo || !anuncio.descripcion) {
        return { 
          success: false, 
          error: 'titulo y descripcion son requeridos' 
        };
      }
      
      const newAnuncio = await repository.createAnuncio(anuncio);
      console.log('✅ Anuncio creado:', newAnuncio.id_anuncio);
      return { success: true, data: newAnuncio };
    } catch (error) {
      console.error('❌ Error al crear anuncio:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener anuncios activos
  async getAnunciosActivos() {
    try {
      const anuncios = await repository.getAnunciosActivos();
      return { success: true, data: anuncios };
    } catch (error) {
      console.error('❌ Error al obtener anuncios activos:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener todos los anuncios (para admin)
  async getAllAnuncios() {
    try {
      const anuncios = await repository.getAllAnuncios();
      return { success: true, data: anuncios };
    } catch (error) {
      console.error('❌ Error al obtener todos los anuncios:', error);
      return { success: false, error: error.message };
    }
  }

  // Marcar anuncio como leído
  async markAnuncioAsRead(id_anuncio, uid) {
    try {
      await repository.markAnuncioAsRead(id_anuncio, uid);
      return { success: true, message: 'Anuncio marcado como leído' };
    } catch (error) {
      console.error('❌ Error al marcar anuncio:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtener anuncios no leídos
  async getUnreadAnuncios(uid) {
    try {
      const anuncios = await repository.getUnreadAnuncios(uid);
      return { success: true, data: anuncios };
    } catch (error) {
      console.error('❌ Error al obtener anuncios no leídos:', error);
      return { success: false, error: error.message };
    }
  }

  // Actualizar anuncio
  async updateAnuncio(id_anuncio, updates) {
    try {
      const updatedAnuncio = await repository.updateAnuncio(id_anuncio, updates);
      
      if (!updatedAnuncio) {
        return { success: false, error: 'Anuncio no encontrado o sin cambios' };
      }
      
      return { success: true, data: updatedAnuncio };
    } catch (error) {
      console.error('❌ Error al actualizar anuncio:', error);
      return { success: false, error: error.message };
    }
  }

  // Eliminar anuncio
  async deleteAnuncio(id_anuncio) {
    try {
      const deleted = await repository.deleteAnuncio(id_anuncio);
      
      if (!deleted) {
        return { success: false, error: 'Anuncio no encontrado' };
      }
      
      return { success: true, message: 'Anuncio eliminado' };
    } catch (error) {
      console.error('❌ Error al eliminar anuncio:', error);
      return { success: false, error: error.message };
    }
  }
}
