import { Router } from 'express';
import {
    getAllPartidos,
    getPartidoById,
} from '../../controllers/partido.controller.js';

const router = Router();

router.get('/partidos', getAllPartidos);
router.get('/partidos/:id', getPartidoById);

export default router;
