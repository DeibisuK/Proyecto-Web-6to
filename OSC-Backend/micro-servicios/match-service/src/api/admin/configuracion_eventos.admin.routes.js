import { Router } from 'express';
import * as ConfiguracionEventosController from '../../controllers/configuracion_eventos.controller.js';

const router = Router();

// ===== RUTAS PARA CONFIGURACIÓN DE EVENTOS =====

// Obtener todos los eventos
router.get('/eventos', ConfiguracionEventosController.getAllEventos);

// Obtener eventos por deporte
router.get('/deportes/:idDeporte/eventos', ConfiguracionEventosController.getEventosByDeporte);

// Obtener evento por ID
router.get('/eventos/:idConfig', ConfiguracionEventosController.getEventoById);

// Crear evento
router.post('/eventos', ConfiguracionEventosController.crearEvento);

// Actualizar evento
router.put('/eventos/:idConfig', ConfiguracionEventosController.actualizarEvento);

// Desactivar evento
router.delete('/eventos/:idConfig', ConfiguracionEventosController.desactivarEvento);

// Activar evento
router.patch('/eventos/:idConfig/activar', ConfiguracionEventosController.activarEvento);

export default router;
