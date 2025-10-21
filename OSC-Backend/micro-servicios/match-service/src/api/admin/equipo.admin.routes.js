import { Router } from 'express';
import {
    getAllEquipos,
    getEquipoById,
    createEquipo,
    updateEquipo,
    deleteEquipo,
} from '../../controllers/equipo.controller.js';

const router = Router();

// Rutas generales
router.get('/equipos', getAllEquipos);
router.get('/equipos/:id', getEquipoById);
router.post('/equipos', createEquipo);
router.put('/equipos/:id', updateEquipo);
router.delete('/equipos/:id', deleteEquipo);

export default router;
