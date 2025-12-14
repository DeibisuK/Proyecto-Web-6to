import * as RatingModel from '../models/rating.model.js';

// Obtener todos los ratings de una cancha con info del usuario
export const getRatingsByCancha = async (id_cancha) => {
  return await RatingModel.findByCancha(id_cancha);
};

// Obtener estadísticas de una cancha
export const getEstadisticasCancha = async (id_cancha) => {
  return await RatingModel.getEstadisticas(id_cancha);
};

// Verificar si un usuario ya dejó rating
export const checkUserRating = async (id_cancha, firebase_uid) => {
  return await RatingModel.findByUserAndCancha(id_cancha, firebase_uid);
};

// Obtener top canchas mejor valoradas
export const getTopCanchas = async (limit) => {
  return await RatingModel.getTopRated(limit);
};

// Crear un nuevo rating
export const createRating = async (ratingData) => {
  return await RatingModel.create(ratingData);
};

// Actualizar un rating
export const updateRating = async (id_rating, ratingData) => {
  return await RatingModel.update(id_rating, ratingData);
};

// Eliminar un rating
export const deleteRating = async (id_rating) => {
  return await RatingModel.remove(id_rating);
};
