import { Router } from 'express';
import {
    getAllProductos,
    searchProductos,
    getProductoDetalle,
} from '../../controllers/producto.controller.js';
import authenticate from '../../../../../middleware/authenticate.js';

const router = Router();

// router.get('/', getAllProductos);
router.post('/search', searchProductos); 
router.get('/:id', getProductoDetalle);

export default router;
