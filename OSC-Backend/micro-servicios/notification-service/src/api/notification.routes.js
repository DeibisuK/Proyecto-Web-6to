import express from 'express';
import NotificationController from '../controllers/notification.controller.js';
import emailService from '../services/email.service.js';

const router = express.Router();
const controller = new NotificationController();

// POST /api/notificaciones/send-email - Enviar email
router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html } = req.body;
    
    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: to, subject, html'
      });
    }

    const result = await emailService.sendEmail({ to, subject, html });
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/notificaciones - Obtener notificaciones con filtros
router.get('/', (req, res) => controller.getNotifications(req, res));

// GET /api/notificaciones/contador - Obtener contador de no leídas
router.get('/contador', (req, res) => controller.getUnreadCount(req, res));

// POST /api/notificaciones - Crear notificación
router.post('/', (req, res) => controller.createNotification(req, res));

// PUT /api/notificaciones/:id/leer - Marcar como leída
router.put('/:id/leer', (req, res) => controller.markAsRead(req, res));

// PUT /api/notificaciones/leer-todas - Marcar todas como leídas
router.put('/leer-todas', (req, res) => controller.markAllAsRead(req, res));

// DELETE /api/notificaciones/:id - Eliminar notificación
router.delete('/:id', (req, res) => controller.deleteNotification(req, res));

// DELETE /api/notificaciones/leidas - Eliminar todas las leídas
router.delete('/leidas', (req, res) => controller.deleteAllRead(req, res));

export default router;
