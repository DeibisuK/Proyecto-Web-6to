import { Router } from 'express';
import {
    getMisEquipos,
    getEquipoById,
    createEquipo,
    updateEquipo,
    deleteEquipo,
} from '../../controllers/equipo.controller.js';
import authenticate from '../../../../../middleware/authenticate.js';

const router = Router();

// Ruta para obtener equipos del usuario autenticado (DEBE IR ANTES de /:id)
router.get('/equipos/mis-equipos',authenticate(), getMisEquipos);
//router.get('/equipos/:id', getEquipoById);
router.post('/equipos',authenticate(), createEquipo);
router.put('/equipos/:id',authenticate(), updateEquipo);
router.delete('/equipos/:id',authenticate(), deleteEquipo);

export default router;
