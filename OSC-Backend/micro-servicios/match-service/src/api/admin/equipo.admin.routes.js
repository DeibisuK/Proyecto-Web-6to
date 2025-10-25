import { Router } from 'express';
import {
    getAllEquipos,
    getEquipoById,
    createEquipo,
    updateEquipo,
    deleteEquipo,
} from '../../controllers/equipo.controller.js';
import authenticate from '../../../../../middleware/authenticate.js';
import authorizeRole from '../../../../../middleware/authorizeRole.js';

const router = Router();

// Rutas generales
router.get('/equipos',authenticate(),authorizeRole(1), getAllEquipos);
router.get('/equipos/:id',authenticate(),authorizeRole(1), getEquipoById);
router.post('/equipos',authenticate(),authorizeRole(1), createEquipo);
router.put('/equipos/:id',authenticate(),authorizeRole(1), updateEquipo);
router.delete('/equipos/:id',authenticate(),authorizeRole(1), deleteEquipo);

export default router;
