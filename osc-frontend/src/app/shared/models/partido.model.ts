export interface Partido {
  id_partido: number;
  equipo_local: {
    id_equipo: number;
    nombre: string;
    logo_url?: string;
  };
  equipo_visitante: {
    id_equipo: number;
    nombre: string;
    logo_url?: string;
  };
  anotaciones_local: number;
  anotaciones_visitante: number;
  fecha_finalizacion: string; // ISO date string
  estado: 'finalizado' | 'en_curso' | 'programado';
}
