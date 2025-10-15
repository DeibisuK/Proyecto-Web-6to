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

export type TipoSuperficie = 'Cemento' | 'Césped Natural' | 'Césped Sintético' | 'Parquet' | 'Arcilla';
export type EstadoCancha = 'Disponible' | 'Mantenimiento' | 'Reservado' | 'Fuera de Servicio';
