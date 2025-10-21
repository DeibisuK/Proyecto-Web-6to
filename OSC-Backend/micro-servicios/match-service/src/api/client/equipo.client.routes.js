import { Router } from 'express';
import {
    getMisEquipos,
    getEquipoById,
    createEquipo,
    updateEquipo,
    deleteEquipo,
} from '../../controllers/equipo.controller.js';

const router = Router();

// Ruta para obtener equipos del usuario autenticado (DEBE IR ANTES de /:id)
router.get('/equipos/mis-equipos', getMisEquipos);
router.get('/equipos/:id', getEquipoById);
router.post('/equipos', createEquipo);
router.put('/equipos/:id', updateEquipo);
router.delete('/equipos/:id', deleteEquipo);

export default router;
