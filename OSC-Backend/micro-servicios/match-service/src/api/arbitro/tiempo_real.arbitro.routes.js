import { Router } from 'express';
import * as EstadoTiempoRealController from '../../controllers/estado_tiempo_real.controller.js';

const router = Router();

// ===== RUTAS PARA GESTIÓN DE TIEMPO (ÁRBITRO) =====

// Obtener estado en tiempo real
router.get('/partidos/:idPartido/tiempo-real', EstadoTiempoRealController.getEstadoTiempoReal);

// Inicializar estado
router.post('/partidos/:idPartido/tiempo-real', EstadoTiempoRealController.inicializarEstado);

// Actualizar tiempo
router.put('/partidos/:idPartido/tiempo-real', EstadoTiempoRealController.actualizarTiempo);

// Iniciar cronómetro
router.post('/partidos/:idPartido/tiempo-real/iniciar', EstadoTiempoRealController.iniciarCronometro);

// Pausar cronómetro
router.post('/partidos/:idPartido/tiempo-real/pausar', EstadoTiempoRealController.pausarCronometro);

// Detener cronómetro
router.post('/partidos/:idPartido/tiempo-real/detener', EstadoTiempoRealController.detenerCronometro);

// Reiniciar tiempo
router.post('/partidos/:idPartido/tiempo-real/reiniciar', EstadoTiempoRealController.reiniciarTiempo);

// Actualizar puntuación detallada
router.put('/partidos/:idPartido/tiempo-real/puntuacion', EstadoTiempoRealController.actualizarPuntuacion);

export default router;
