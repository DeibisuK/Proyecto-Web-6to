import { Router } from 'express';
import {
    getEstadisticasUsuario,
    getTorneosPublicos,
    getPartidosPorTorneo,
    getClasificacionTorneo,
    getEquiposInscritosTorneo,
} from '../../controllers/torneo.controller.js';

const router = Router();

// Endpoint para obtener estadísticas del usuario autenticado
router.get('/torneos/estadisticas-usuario', getEstadisticasUsuario);

// Endpoint para obtener torneos públicos con filtros opcionales
// Query params: deporte, estado, busqueda, fecha, ordenar
router.get('/torneos/publicos', getTorneosPublicos);

// Endpoint para obtener partidos de un torneo específico
router.get('/torneos/:id/partidos', getPartidosPorTorneo);

// Endpoint para obtener la clasificación/tabla de posiciones de un torneo
router.get('/torneos/:id/clasificacion', getClasificacionTorneo);

// Endpoint para obtener equipos inscritos en un torneo
router.get('/torneos/:id/equipos-inscritos', getEquiposInscritosTorneo);

export default router;
