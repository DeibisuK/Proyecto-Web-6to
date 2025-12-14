import * as RatingService from '../services/rating.service.js';

export class RatingController {
  // Obtener todos los ratings de una cancha
  static async getRatingsByCancha(req, res) {
    try {
      const { id_cancha } = req.params;
      const ratings = await RatingService.getRatingsByCancha(id_cancha);
      res.status(200).json(ratings);
    } catch (error) {
      console.error('Error al obtener ratings:', error);
      res.status(500).json({ error: 'Error al obtener ratings de la cancha' });
    }
  }

  // Obtener estadísticas de ratings de una cancha
  static async getEstadisticasCancha(req, res) {
    try {
      const { id_cancha } = req.params;
      const estadisticas = await RatingService.getEstadisticasCancha(id_cancha);
      
      if (!estadisticas) {
        return res.status(404).json({ error: 'Cancha no encontrada' });
      }
      
      res.status(200).json(estadisticas);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas de la cancha' });
    }
  }

  // Verificar si un usuario ya dejó rating en una cancha
  static async checkUserRating(req, res) {
    try {
      const { id_cancha, firebase_uid } = req.params;
      const rating = await RatingService.checkUserRating(id_cancha, firebase_uid);
      
      if (rating) {
        res.status(200).json({ exists: true, rating });
      } else {
        res.status(200).json({ exists: false });
      }
    } catch (error) {
      console.error('Error al verificar rating del usuario:', error);
      res.status(500).json({ error: 'Error al verificar rating' });
    }
  }

  // Obtener top canchas mejor valoradas
  static async getTopCanchas(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topCanchas = await RatingService.getTopCanchas(limit);
      res.status(200).json(topCanchas);
    } catch (error) {
      console.error('Error al obtener top canchas:', error);
      res.status(500).json({ error: 'Error al obtener top canchas' });
    }
  }

  // Crear un nuevo rating
  static async createRating(req, res) {
    try {
      const { id_cancha, firebase_uid, estrellas, comentario } = req.body;

      // Validaciones
      if (!id_cancha || !firebase_uid || !estrellas) {
        return res.status(400).json({ 
          error: 'Campos requeridos: id_cancha, firebase_uid, estrellas' 
        });
      }

      if (estrellas < 1 || estrellas > 5) {
        return res.status(400).json({ 
          error: 'Las estrellas deben estar entre 1 y 5' 
        });
      }

      // Verificar si ya existe un rating
      const existingRating = await RatingService.checkUserRating(id_cancha, firebase_uid);
      if (existingRating) {
        return res.status(409).json({ 
          error: 'Ya existe un rating para esta cancha por este usuario',
          rating: existingRating
        });
      }

      const newRating = await RatingService.createRating({
        id_cancha,
        firebase_uid,
        estrellas,
        comentario
      });

      res.status(201).json(newRating);
    } catch (error) {
      console.error('Error al crear rating:', error);
      res.status(500).json({ error: 'Error al crear rating' });
    }
  }

  // Actualizar un rating existente
  static async updateRating(req, res) {
    try {
      const { id_rating } = req.params;
      const { estrellas, comentario, estado } = req.body;

      if (estrellas && (estrellas < 1 || estrellas > 5)) {
        return res.status(400).json({ 
          error: 'Las estrellas deben estar entre 1 y 5' 
        });
      }

      const updatedRating = await RatingService.updateRating(id_rating, {
        estrellas,
        comentario,
        estado
      });

      if (!updatedRating) {
        return res.status(404).json({ error: 'Rating no encontrado' });
      }

      res.status(200).json(updatedRating);
    } catch (error) {
      console.error('Error al actualizar rating:', error);
      res.status(500).json({ error: 'Error al actualizar rating' });
    }
  }

  // Eliminar un rating
  static async deleteRating(req, res) {
    try {
      const { id_rating } = req.params;
      const deleted = await RatingService.deleteRating(id_rating);

      if (!deleted) {
        return res.status(404).json({ error: 'Rating no encontrado' });
      }

      res.status(200).json({ message: 'Rating eliminado exitosamente' });
    } catch (error) {
      console.error('Error al eliminar rating:', error);
      res.status(500).json({ error: 'Error al eliminar rating' });
    }
  }
}
