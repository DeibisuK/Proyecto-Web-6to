import { Router } from 'express';
import {
    getAllProductos,
    searchProductos,
    getProductoDetalle,
    getOpciones,
    getOpcionesPorCategorias,
} from '../../controllers/producto.controller.js';
import authenticate from '../../../../../middleware/authenticate.js';

const router = Router();

// router.get('/', getAllProductos);
router.post('/search', searchProductos);
router.get('/opciones', getOpciones); // Endpoint para obtener opciones (colores, tallas, etc.)
router.post('/opciones/categorias', getOpcionesPorCategorias); // Endpoint para obtener opciones por categorías
router.get('/:id', getProductoDetalle);

export default router;
