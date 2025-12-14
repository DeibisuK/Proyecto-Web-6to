export interface Rating {
  id_rating?: number;
  id_cancha: number;
  firebase_uid: string;
  estrellas: number;
  comentario?: string;
  fecha_registro?: string;
  fecha_actualizacion?: string;
  estado?: 'activo' | 'oculto' | 'reportado';

  // Datos del usuario (si vienen del JOIN)
  nombre_usuario?: string;
  email_usuario?: string;

  // Campos calculados para la UI
  iniciales?: string;
  nombre?: string;
  fecha?: string;
}

export interface RatingEstadisticas {
  id_cancha: number;
  nombre_cancha: string;
  total_ratings: number;
  promedio_estrellas: number;
  ratings_5_estrellas: number;
  ratings_4_estrellas: number;
  ratings_3_estrellas: number;
  ratings_2_estrellas: number;
  ratings_1_estrella: number;
  ultimo_rating?: string;
}

export interface RatingRequest {
  id_cancha: number;
  firebase_uid: string;
  estrellas: number;
  comentario?: string;
}
