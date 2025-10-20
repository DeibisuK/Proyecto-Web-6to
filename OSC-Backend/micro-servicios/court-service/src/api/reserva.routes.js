import { Router } from 'express';
import {
    getAllReservas,
    getReservaById,
    getReservasByUserId,
    getReservasByCanchaId,
    createReserva,
    updateReserva,
    deleteReserva,
} from '../controllers/reserva.controller.js';

const router = Router();

router.get('/reservas', getAllReservas);
router.get('/reservas/:id', getReservaById);
router.get('/reservas/user/:id_usuario', getReservasByUserId);
router.get('/reservas/cancha/:id_cancha', getReservasByCanchaId);
router.post('/reservas', createReserva);
router.put('/reservas/:id', updateReserva);
router.delete('/reservas/:id', deleteReserva);

export default router;
