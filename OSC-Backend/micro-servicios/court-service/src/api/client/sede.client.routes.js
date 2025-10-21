import { Router } from 'express';
import {
  getAllSedes,
  getSedeById,
} from '../../controllers/sede.controller.js';

const router = Router();

router.get('/sedes', getAllSedes);
router.get('/sedes/:id', getSedeById);

export default router;
