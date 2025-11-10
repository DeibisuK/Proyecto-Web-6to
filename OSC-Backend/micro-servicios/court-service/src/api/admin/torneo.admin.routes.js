import { Router } from 'express';
import {
    listarTorneos,
    obtenerTorneoPorId,
    crearTorneo,
    actualizarTorneo,
    eliminarTorneo,
    cambiarEstadoTorneo,
    obtenerEstadisticasTorneo,
} from '../../controllers/torneo.admin.controller.js';

const router = Router();

/**
 * Rutas administrativas de torneos
 * Todas estas rutas requieren autenticación y rol de administrador (1)
 */

// Listar todos los torneos con filtros opcionales
// Query params: deporte, estado, busqueda, fecha_desde, fecha_hasta, ordenar, page, limit
router.get('/torneos', listarTorneos);

// Obtener un torneo específico por ID
router.get('/torneos/:id', obtenerTorneoPorId);

// Crear un nuevo torneo
router.post('/torneos', crearTorneo);

// Actualizar un torneo existente
router.put('/torneos/:id', actualizarTorneo);

// Eliminar un torneo
router.delete('/torneos/:id', eliminarTorneo);

// Cambiar el estado de un torneo (abierto, en_curso, cerrado, finalizado)
router.patch('/torneos/:id/estado', cambiarEstadoTorneo);

// Obtener estadísticas completas de un torneo
router.get('/torneos/:id/estadisticas', obtenerEstadisticasTorneo);

export default router;
