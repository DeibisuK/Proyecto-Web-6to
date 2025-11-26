import { Router } from 'express';
import * as AlineacionesController from '../../controllers/alineaciones.controller.js';

const router = Router();

// ===== RUTAS PARA ALINEACIONES (ÁRBITRO) =====

// Obtener alineación de un partido
router.get('/partidos/:idPartido/alineaciones', AlineacionesController.getAlineacionByPartido);

// Agregar jugador a alineación
router.post('/partidos/:idPartido/alineaciones', AlineacionesController.agregarJugadorAlineacion);

// Crear alineación completa de un equipo
router.post('/partidos/:idPartido/equipos/:idEquipo/alineaciones', AlineacionesController.crearAlineacionCompleta);

// Registrar sustitución
router.post('/partidos/:idPartido/sustituciones', AlineacionesController.registrarSustitucion);

// Actualizar alineación
router.put('/alineaciones/:idAlineacion', AlineacionesController.actualizarAlineacion);

// Eliminar jugador de alineación
router.delete('/alineaciones/:idAlineacion', AlineacionesController.eliminarDeAlineacion);

export default router;
