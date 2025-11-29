import express from 'express';
import * as partidoController from '../../controllers/partido.admin.controller.js';

const router = express.Router();

// GET /c/admin/partidos - Obtener todos los partidos (con filtros opcionales)
router.get('/', partidoController.obtenerPartidos);

// GET /c/admin/partidos/:id - Obtener un partido por ID
router.get('/:id', partidoController.obtenerPartidoPorId);

// PUT /c/admin/partidos/:id/asignar-arbitro - Asignar árbitro a partido
router.put('/:id/asignar-arbitro', partidoController.asignarArbitro);

// PUT /c/admin/partidos/:id/asignar-cancha - Asignar cancha a partido
router.put('/:id/asignar-cancha', partidoController.asignarCancha);

// DELETE /c/admin/partidos/:id/remover-arbitro - Remover árbitro del partido
router.delete('/:id/remover-arbitro', partidoController.removerArbitro);

// PUT /c/admin/partidos/:id - Actualizar datos del partido
router.put('/:id', partidoController.actualizarPartido);

export default router;
