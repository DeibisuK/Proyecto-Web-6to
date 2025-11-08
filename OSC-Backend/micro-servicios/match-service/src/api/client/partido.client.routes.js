import { Router } from 'express';
import {
    getAllPartidos,
    getPartidoById,
    getDetallePartido,
} from '../../controllers/partido.controller.js';
import authenticate from '../../../../../middleware/authenticate.js';

const router = Router();

router.get('/partidos',authenticate(), getAllPartidos);
router.get('/partidos/:id',authenticate(), getPartidoById);
router.get('/partidos/:id/detalle',authenticate(), getDetallePartido);

export default router;
