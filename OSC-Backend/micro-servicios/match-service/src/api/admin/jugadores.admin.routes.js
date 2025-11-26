import { Router } from 'express';
import * as JugadoresController from '../../controllers/jugadores.controller.js';

const router = Router();

// ===== RUTAS PARA JUGADORES (ADMIN) =====

// Obtener jugadores de un equipo
router.get('/equipos/:idEquipo/jugadores', JugadoresController.getJugadoresByEquipo);

// Obtener jugadores disponibles
router.get('/equipos/:idEquipo/jugadores/disponibles', JugadoresController.getJugadoresDisponibles);

// Obtener jugador por ID
router.get('/jugadores/:idJugador', JugadoresController.getJugadorById);

// Crear jugador
router.post('/equipos/:idEquipo/jugadores', JugadoresController.crearJugador);

// Actualizar jugador
router.put('/jugadores/:idJugador', JugadoresController.actualizarJugador);

// Eliminar jugador
router.delete('/jugadores/:idJugador', JugadoresController.eliminarJugador);

// Buscar jugadores
router.get('/jugadores/search', JugadoresController.buscarJugadores);

// Cambiar estado de jugador
router.patch('/jugadores/:idJugador/estado', JugadoresController.cambiarEstado);

// Asignar capitán
router.patch('/equipos/:idEquipo/jugadores/:idJugador/capitan', JugadoresController.asignarCapitan);

export default router;
