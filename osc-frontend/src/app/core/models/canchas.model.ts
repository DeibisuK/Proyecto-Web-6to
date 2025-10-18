export interface Cancha {
  id_cancha?: number;
  nombre_cancha: string;
  id_sede: number;
  id_deporte: number;
  largo: number;
  ancho: number;
  tarifa: number;
  tipo_superficie: string;
  estado: string;
  imagen_url?: string;
}

export interface Sede {
  id_sede: number;
  nombre_sede: string;
  direccion?: string;
}

export type TipoSuperficie = 
    'Césped Sintético' 
    | 'Arcilla' 
    | 'Piso Flotante' 
    | 'Cemento'
    | 'Césped Natural' // <--- ¡AÑADIDO!
    | 'Parquet';      // <--- ¡AÑADIDO!

/**
 * Define los posibles estados de una cancha.
 * ACTUALIZADOS: a 'Disponible', 'Reservado', 'Mantenimiento' y 'Fuera de Servicio'
 */
export type EstadoCancha = 
    'Disponible'         // <--- ¡ACTUALIZADO! (antes era 'Activa')
    | 'Reservado'        // <--- ¡AÑADIDO!
    | 'Mantenimiento'
    | 'Fuera de Servicio'; // <--- ¡AÑADIDO!