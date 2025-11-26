import { Router } from 'express';
import { enviarContacto, enviarBienvenida } from '../controllers/contacto.controller.js';

const router = Router();

router.post('/contacto', enviarContacto);
router.post('/bienvenida', enviarBienvenida);

export default router;
