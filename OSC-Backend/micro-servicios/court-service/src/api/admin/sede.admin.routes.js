import { Router } from 'express';
import {
  getAllSedes,
  getSedeById,
  createSede,
  updateSede,
  deleteSede,
} from '../../controllers/sede.controller.js';

const router = Router();

router.get('/sedes', getAllSedes);
router.get('/sedes/:id', getSedeById);
router.post('/sedes', createSede);
router.put('/sedes/:id', updateSede);
router.delete('/sedes/:id', deleteSede);

export default router;
