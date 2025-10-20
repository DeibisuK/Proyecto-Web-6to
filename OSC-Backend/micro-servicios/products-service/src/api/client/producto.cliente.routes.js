import { Router } from 'express';
import {
    getAllProductos,
    getProductoById,
} from '../../controllers/producto.controller.js';

const router = Router();

router.get('/', getAllProductos);
router.get('/:id', getProductoById);

export default router;
