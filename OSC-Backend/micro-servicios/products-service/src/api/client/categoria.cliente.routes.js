import { Router } from 'express';
import {
  getAllCategorias,
  getCategoriaById,
} from '../../controllers/categoria.controller.js';

const router = Router();

router.get('/', getAllCategorias);
router.get('/:id', getCategoriaById);

export default router;
