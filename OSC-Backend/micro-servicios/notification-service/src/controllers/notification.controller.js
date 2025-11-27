// ============================================
// NOTIFICATION CONTROLLER - Endpoints REST
// ============================================

import { NotificationService } from '../services/notification.service.js';

const service = new NotificationService();

export default class NotificationController {
  
  // GET /api/notificaciones?uid=xxx&leida=false&origen=torneo&limit=50
  async getNotifications(req, res) {
    try {
      const { uid, leida, origen, limit, offset } = req.query;
      
      if (!uid) {
        return res.status(400).json({ 
          success: false, 
          error: 'uid es requerido' 
        });
      }
      
      const filters = {
        uid,
        leida: leida === 'true' ? true : leida === 'false' ? false : undefined,
        origen,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0
      };
      
      const result = await service.getNotifications(filters);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result.data);
      
    } catch (error) {
      console.error('❌ Error en getNotifications:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // GET /api/notificaciones/contador?uid=xxx
  async getUnreadCount(req, res) {
    try {
      const { uid } = req.query;
      
      if (!uid) {
        return res.status(400).json({ 
          success: false, 
          error: 'uid es requerido' 
        });
      }
      
      const result = await service.getUnreadCount(uid);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({ unread: result.unread });
      
    } catch (error) {
      console.error('❌ Error en getUnreadCount:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // POST /api/notificaciones
  async createNotification(req, res) {
    try {
      const notification = req.body;
      
      const result = await service.createNotification(notification);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result.data);
      
    } catch (error) {
      console.error('❌ Error en createNotification:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // PUT /api/notificaciones/:id/leer
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const { uid } = req.body;
      
      if (!uid) {
        return res.status(400).json({ 
          success: false, 
          error: 'uid es requerido' 
        });
      }
      
      const result = await service.markAsRead(parseInt(id), uid);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result.data);
      
    } catch (error) {
      console.error('❌ Error en markAsRead:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // PUT /api/notificaciones/leer-todas
  async markAllAsRead(req, res) {
    try {
      const { uid } = req.body;
      
      if (!uid) {
        return res.status(400).json({ 
          success: false, 
          error: 'uid es requerido' 
        });
      }
      
      const result = await service.markAllAsRead(uid);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({ success: true, updated: result.updated });
      
    } catch (error) {
      console.error('❌ Error en markAllAsRead:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // DELETE /api/notificaciones/:id
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const { uid } = req.body;
      
      if (!uid) {
        return res.status(400).json({ 
          success: false, 
          error: 'uid es requerido' 
        });
      }
      
      const result = await service.deleteNotification(parseInt(id), uid);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
      
    } catch (error) {
      console.error('❌ Error en deleteNotification:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  // DELETE /api/notificaciones/leidas
  async deleteAllRead(req, res) {
    try {
      const { uid } = req.body;
      
      if (!uid) {
        return res.status(400).json({ 
          success: false, 
          error: 'uid es requerido' 
        });
      }
      
      const result = await service.deleteAllRead(uid);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json({ success: true, deleted: result.deleted });
      
    } catch (error) {
      console.error('❌ Error en deleteAllRead:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ============================================
  // ANUNCIOS GLOBALES
  // ============================================

  // POST /api/anuncios - Crear anuncio (solo admin)
  async createAnuncio(req, res) {
    try {
      const anuncio = req.body;
      
      const result = await service.createAnuncio(anuncio);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result.data);
      
    } catch (error) {
      console.error('❌ Error en createAnuncio:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/anuncios/activos - Obtener anuncios activos (público)
  async getAnunciosActivos(req, res) {
    try {
      const result = await service.getAnunciosActivos();
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result.data);
      
    } catch (error) {
      console.error('❌ Error en getAnunciosActivos:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/anuncios - Obtener todos los anuncios (admin)
  async getAllAnuncios(req, res) {
    try {
      const result = await service.getAllAnuncios();
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result.data);
      
    } catch (error) {
      console.error('❌ Error en getAllAnuncios:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // GET /api/anuncios/no-leidos?uid=xxx
  async getUnreadAnuncios(req, res) {
    try {
      const { uid } = req.query;
      
      if (!uid) {
        return res.status(400).json({ 
          success: false, 
          error: 'uid es requerido' 
        });
      }
      
      const result = await service.getUnreadAnuncios(uid);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result.data);
      
    } catch (error) {
      console.error('❌ Error en getUnreadAnuncios:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // POST /api/anuncios/:id/leer
  async markAnuncioAsRead(req, res) {
    try {
      const { id } = req.params;
      const { uid } = req.body;
      
      if (!uid) {
        return res.status(400).json({ 
          success: false, 
          error: 'uid es requerido' 
        });
      }
      
      const result = await service.markAnuncioAsRead(parseInt(id), uid);
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result);
      
    } catch (error) {
      console.error('❌ Error en markAnuncioAsRead:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // PUT /api/anuncios/:id - Actualizar anuncio (admin)
  async updateAnuncio(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const result = await service.updateAnuncio(parseInt(id), updates);
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result.data);
      
    } catch (error) {
      console.error('❌ Error en updateAnuncio:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // DELETE /api/anuncios/:id - Eliminar anuncio (admin)
  async deleteAnuncio(req, res) {
    try {
      const { id } = req.params;
      
      const result = await service.deleteAnuncio(parseInt(id));
      
      if (!result.success) {
        return res.status(404).json(result);
      }
      
      res.json(result);
      
    } catch (error) {
      console.error('❌ Error en deleteAnuncio:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
