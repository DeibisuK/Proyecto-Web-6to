import { Router } from 'express';
import {
    getAllProductos,
    createProducto,
    getProductoDetalle
} from '../../controllers/producto.controller.js';
import authenticate from '../../../../../middleware/authenticate.js';
import authorizeRole from '../../../../../middleware/authorizeRole.js';

const router = Router();

router.get('/', getAllProductos);
router.get('/:id', authenticate(), getProductoDetalle);
// router.get('/:id', getProductoById);
router.post('/', createProducto);
// router.put('/:id', updateProducto);
// router.delete('/:id', deleteProducto);

export default router;
