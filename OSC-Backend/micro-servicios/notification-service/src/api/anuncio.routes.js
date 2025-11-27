import express from 'express';
import NotificationController from '../controllers/notification.controller.js';

const router = express.Router();
const controller = new NotificationController();

// POST /api/anuncios - Crear anuncio (admin)
router.post('/', (req, res) => controller.createAnuncio(req, res));

// GET /api/anuncios/activos - Obtener anuncios activos (público)
router.get('/activos', (req, res) => controller.getAnunciosActivos(req, res));

// GET /api/anuncios/no-leidos - Obtener anuncios no leídos para usuario
router.get('/no-leidos', (req, res) => controller.getUnreadAnuncios(req, res));

// GET /api/anuncios - Obtener todos los anuncios (admin)
router.get('/', (req, res) => controller.getAllAnuncios(req, res));

// POST /api/anuncios/:id/leer - Marcar anuncio como leído
router.post('/:id/leer', (req, res) => controller.markAnuncioAsRead(req, res));

// PUT /api/anuncios/:id - Actualizar anuncio (admin)
router.put('/:id', (req, res) => controller.updateAnuncio(req, res));

// DELETE /api/anuncios/:id - Eliminar anuncio (admin)
router.delete('/:id', (req, res) => controller.deleteAnuncio(req, res));

export default router;
