import { Router } from 'express';
import {
    getAllReservas,
    getReservaById,
    getReservasByUserId,
    getReservasByCanchaId,
    createReserva,
    updateReserva,
    deleteReserva,
} from '../../controllers/reserva.controller.js';
import authenticate from '../../../../../middleware/authenticate.js';

const router = Router();

// Rutas públicas (acceso vía QR)
router.get('/reservas/:id', getReservaById);

// Rutas protegidas (requieren autenticación)
router.get('/reservas', authenticate(), getAllReservas);
router.get('/reservas/user/:id_usuario', authenticate(), getReservasByUserId);
router.get('/reservas/cancha/:id_cancha', authenticate(), getReservasByCanchaId);
router.post('/reservas', authenticate(), createReserva);
router.put('/reservas/:id', authenticate(), updateReserva);
router.delete('/reservas/:id', authenticate(), deleteReserva);

export default router;
