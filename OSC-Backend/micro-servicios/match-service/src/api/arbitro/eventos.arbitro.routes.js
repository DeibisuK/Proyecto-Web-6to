import { Router } from 'express';
import * as EventosController from '../../controllers/eventos_partido.controller.js';

const router = Router();

// ===== RUTAS PARA EVENTOS DE PARTIDO (ÁRBITRO) =====

// Obtener eventos de un partido
router.get('/partidos/:idPartido/eventos', EventosController.getEventosByPartido);

// Registrar evento (gol, canasta, tarjeta, etc.)
router.post('/partidos/:idPartido/eventos', EventosController.registrarEvento);

// Eliminar evento
router.delete('/eventos/:idEvento', EventosController.eliminarEvento);

// Obtener goleadores de un torneo
router.get('/torneos/:idTorneo/goleadores', EventosController.getGoleadoresByTorneo);

// Obtener estadísticas de jugador en un partido
router.get('/partidos/:idPartido/jugadores/:idJugador/estadisticas', EventosController.getEstadisticasJugador);

export default router;
