import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller.js';

const router = Router();

// Obtener todos los ratings de una cancha
router.get('/cancha/:id_cancha', RatingController.getRatingsByCancha);

// Obtener estadísticas de una cancha
router.get('/cancha/:id_cancha/estadisticas', RatingController.getEstadisticasCancha);

// Verificar si un usuario ya dejó rating en una cancha
router.get('/cancha/:id_cancha/usuario/:firebase_uid', RatingController.checkUserRating);

// Obtener top canchas mejor valoradas
router.get('/top', RatingController.getTopCanchas);

// Crear un nuevo rating
router.post('/', RatingController.createRating);

// Actualizar un rating existente
router.put('/:id_rating', RatingController.updateRating);

// Eliminar un rating
router.delete('/:id_rating', RatingController.deleteRating);

export default router;
