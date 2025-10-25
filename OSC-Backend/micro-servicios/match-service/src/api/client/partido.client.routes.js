import { Router } from 'express';
import {
    getAllPartidos,
    getPartidoById,
} from '../../controllers/partido.controller.js';
import authenticate from '../../../../../middleware/authenticate.js';

const router = Router();

router.get('/partidos',authenticate(), getAllPartidos);
router.get('/partidos/:id',authenticate(), getPartidoById);

export default router;
