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
import authenticate from '../../../../../middleware/authenticate.js';
import authorizeRole from '../../../../../middleware/authorizeRole.js';

const router = Router();

/**
 * Rutas del panel de árbitro
 * Todas estas rutas requieren autenticación y rol de árbitro
 */

// Obtener mis partidos asignados
// Query params: ?estado=programado&fecha_desde=2025-11-25
router.get('/partidos', authenticate(), authorizeRole(3), obtenerMisPartidos);

// Iniciar un partido
router.post('/partidos/:id/iniciar', authenticate(), authorizeRole(3), iniciarPartido);

// Pausar un partido en curso
router.post('/partidos/:id/pausar', authenticate(), authorizeRole(3), pausarPartido);

// Reanudar un partido pausado
router.post('/partidos/:id/reanudar', authenticate(), authorizeRole(3), reanudarPartido);

// Registrar un evento (gol, tarjeta, etc.)
router.post('/partidos/:id/eventos', authenticate(), authorizeRole(3), registrarEvento);

// Obtener eventos de un partido
router.get('/partidos/:id/eventos', authenticate(), authorizeRole(3), obtenerEventos);

// Finalizar un partido
router.post('/partidos/:id/finalizar', authenticate(), authorizeRole(3), finalizarPartido);

export default router;
