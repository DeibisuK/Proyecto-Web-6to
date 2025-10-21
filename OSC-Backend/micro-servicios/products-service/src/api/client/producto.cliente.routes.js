import { Router } from 'express';
import {
    getAllProductos,
    getProductoById,
    getProductosCard,
} from '../../controllers/producto.controller.js';

const router = Router();

router.get('/', getAllProductos);
router.get('/card', getProductosCard);
router.get('/:id', getProductoById);

export default router;
