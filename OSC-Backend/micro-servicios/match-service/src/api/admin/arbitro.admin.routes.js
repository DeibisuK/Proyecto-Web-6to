import { Router } from 'express';
import {
    getAllArbitros,
    getArbitroById,
    createArbitro,
    updateArbitro,
    deleteArbitro,
} from '../../controllers/arbitro.controller.js';

const router = Router();

router.get('/arbitros', getAllArbitros);
router.get('/arbitros/:id', getArbitroById);
router.post('/arbitros', createArbitro);
router.put('/arbitros/:id', updateArbitro);
router.delete('/arbitros/:id', deleteArbitro);

export default router;
