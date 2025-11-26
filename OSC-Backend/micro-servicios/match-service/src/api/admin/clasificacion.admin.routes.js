import { Router } from 'express';
import * as ClasificacionController from '../../controllers/clasificacion.controller.js';

const router = Router();

// ===== RUTAS PARA CLASIFICACIÓN (ADMIN & CLIENT) =====

// Obtener clasificación de un torneo
router.get('/torneos/:idTorneo/clasificacion', ClasificacionController.getClasificacionByTorneo);

// Obtener clasificación por grupo
router.get('/grupos/:idGrupo/clasificacion', ClasificacionController.getClasificacionByGrupo);

// Obtener posición de un equipo
router.get('/torneos/:idTorneo/equipos/:idEquipo/posicion', ClasificacionController.getPosicionEquipo);

// Recalcular clasificación (solo admin)
router.post('/torneos/:idTorneo/clasificacion/recalcular', ClasificacionController.recalcularClasificacion);

// Actualizar clasificación manualmente (solo admin)
router.put('/clasificacion', ClasificacionController.upsertClasificacion);

export default router;
