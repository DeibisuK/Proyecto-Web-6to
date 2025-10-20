import { Router } from 'express';
import { enviarContacto } from '../controllers/contacto.controller.js';

const router = Router();

router.post('/contacto', enviarContacto);

export default router;
