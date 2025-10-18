import { Router } from 'express';
import {
    getAllEquipos,
    getMisEquipos,
    getEquipoById,
    createEquipo,
    updateEquipo,
    deleteEquipo,
} from '../controllers/equipo.controller.js';
import extractUser from '../middleware/extractUser.js';

const router = Router();

// Apply authentication middleware to all equipo routes
router.use(extractUser);

// Ruta para obtener equipos del usuario autenticado (DEBE IR ANTES de /:id)
router.get('/equipos/mis-equipos', getMisEquipos);

// Rutas generales
router.get('/equipos', getAllEquipos);
router.get('/equipos/:id', getEquipoById);
router.post('/equipos', createEquipo);
router.put('/equipos/:id', updateEquipo);
router.delete('/equipos/:id', deleteEquipo);

export default router;
