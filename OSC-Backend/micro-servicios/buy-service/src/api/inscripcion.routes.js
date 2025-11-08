import { Router } from 'express';
import {
    getInscripcionesUsuario,
    crearInscripcion,
    cancelarInscripcion,
} from '../controllers/inscripcion.controller.js';
import authenticate from '../../../../middleware/authenticate.js';
import authorizeRole from '../../../../middleware/authorizeRole.js';

const router = Router();

// Obtener todas las inscripciones de un usuario
router.get('/inscripciones/usuario/:uid', authenticate(), getInscripcionesUsuario);

// Crear una nueva inscripción a un torneo
router.post('/inscripciones/crear', authenticate(), authorizeRole(2), crearInscripcion);

// Cancelar una inscripción existente
router.delete('/inscripciones/:id', authenticate(), authorizeRole(2), cancelarInscripcion);

export default router;
