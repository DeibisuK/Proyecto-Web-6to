import { Router } from 'express';
import {
    getAllCanchas,
    getCanchaById,
    getCanchasBySede,
    getCanchasByDeporte,
    getHorariosDisponibles,
} from '../../controllers/cancha.controller.js';

const router = Router();

router.get('/canchas', getAllCanchas);
router.get('/canchas/:id', getCanchaById);
router.get('/sedes/:idSede/canchas', getCanchasBySede);
router.get('/deportes/:idDeporte/canchas', getCanchasByDeporte);

// Obtener horarios disponibles de una cancha
router.get('/canchas/:id/horarios-disponibles', getHorariosDisponibles);

export default router;
