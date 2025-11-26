import { Router } from 'express';
import {
    obtenerMisPartidos,
    iniciarPartido,
    pausarPartido,
    reanudarPartido,
    registrarEvento,
    finalizarPartido,
    obtenerEventos
} from '../../controllers/panel-arbitro.controller.js';

const router = Router();

/**
 * Rutas del panel de árbitro
 * Todas estas rutas requieren autenticación y rol de árbitro
 */

// Obtener mis partidos asignados
// Query params: ?estado=programado&fecha_desde=2025-11-25
router.get('/partidos', obtenerMisPartidos);

// Iniciar un partido
router.post('/partidos/:id/iniciar', iniciarPartido);

// Pausar un partido en curso
router.post('/partidos/:id/pausar', pausarPartido);

// Reanudar un partido pausado
router.post('/partidos/:id/reanudar', reanudarPartido);

// Registrar un evento (gol, tarjeta, etc.)
router.post('/partidos/:id/eventos', registrarEvento);

// Obtener eventos de un partido
router.get('/partidos/:id/eventos', obtenerEventos);

// Finalizar un partido
router.post('/partidos/:id/finalizar', finalizarPartido);

export default router;
