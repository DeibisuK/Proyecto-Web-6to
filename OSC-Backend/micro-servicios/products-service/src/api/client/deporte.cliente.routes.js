import { Router } from 'express';
import { getAllDeportes, getDeporteById } from '../../controllers/deporte.controller.js';

const router = Router();

router.get('/', getAllDeportes);
router.get('/:id', getDeporteById);


export default router;
