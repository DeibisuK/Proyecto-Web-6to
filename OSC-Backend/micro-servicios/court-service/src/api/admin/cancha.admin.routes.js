import { Router } from 'express';
import {
    getAllCanchas,
    getCanchaById,
    getCanchasBySede,
    getCanchasByDeporte,
    createCancha,
    updateCancha,
    deleteCancha,
} from '../../controllers/cancha.controller.js';

const router = Router();

router.get('/canchas', getAllCanchas);
router.get('/canchas/:id', getCanchaById);
router.get('/sedes/:idSede/canchas', getCanchasBySede);
router.get('/deportes/:idDeporte/canchas', getCanchasByDeporte);
router.post('/canchas', createCancha);
router.put('/canchas/:id', updateCancha);
router.delete('/canchas/:id', deleteCancha);

export default router;
