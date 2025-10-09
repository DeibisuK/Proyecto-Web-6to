import { Router } from 'express';
import {
    getAllImagenes,
    getImagenById,
    getImagenesByProductoId,
    createImagen,
    updateImagen,
    deleteImagen,
} from '../controllers/imagenes_producto.controller.js';

const router = Router();

router.get('/', getAllImagenes);
router.get('/:id', getImagenById);
router.get('/producto/:id_producto', getImagenesByProductoId);
router.post('/', createImagen);
router.put('/:id', updateImagen);
router.delete('/:id', deleteImagen);

export default router;
