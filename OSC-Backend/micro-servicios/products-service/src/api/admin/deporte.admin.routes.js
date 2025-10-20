import { Router } from 'express';
import {
  getAllDeportes,
  getDeporteById,
  createDeporte,
  updateDeporte,
  deleteDeporte,
} from '../../controllers/deporte.controller.js';

const router = Router();

router.get('/', getAllDeportes);
router.get('/:id', getDeporteById);
router.post('/', createDeporte);
router.put('/:id', updateDeporte);
router.delete('/:id', deleteDeporte);

export default router;
