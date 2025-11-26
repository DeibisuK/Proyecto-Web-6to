import { Router } from 'express';
import * as ConfiguracionEventosController from '../../controllers/configuracion_eventos.controller.js';

const router = Router();

// ===== RUTAS PÚBLICAS PARA EVENTOS =====

// Obtener eventos por deporte (necesario para el árbitro en el frontend)
router.get('/deportes/:idDeporte/eventos', ConfiguracionEventosController.getEventosByDeporte);

// Obtener todos los eventos
router.get('/eventos', ConfiguracionEventosController.getAllEventos);

export default router;
