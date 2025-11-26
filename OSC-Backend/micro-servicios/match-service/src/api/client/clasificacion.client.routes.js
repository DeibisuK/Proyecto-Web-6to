import { Router } from 'express';
import * as ClasificacionController from '../../controllers/clasificacion.controller.js';
import * as EventosController from '../../controllers/eventos_partido.controller.js';

const router = Router();

// ===== RUTAS PÚBLICAS PARA CLIENTES =====

// Obtener clasificación de un torneo
router.get('/torneos/:idTorneo/clasificacion', ClasificacionController.getClasificacionByTorneo);

// Obtener clasificación por grupo
router.get('/grupos/:idGrupo/clasificacion', ClasificacionController.getClasificacionByGrupo);

// Obtener posición de un equipo
router.get('/torneos/:idTorneo/equipos/:idEquipo/posicion', ClasificacionController.getPosicionEquipo);

// Obtener goleadores de un torneo
router.get('/torneos/:idTorneo/goleadores', EventosController.getGoleadoresByTorneo);

// Obtener eventos de un partido (público)
router.get('/partidos/:idPartido/eventos', EventosController.getEventosByPartido);

export default router;
