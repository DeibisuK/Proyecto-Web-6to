/**
 * Interfaces y tipos para el módulo de Torneos
 */

// Deportes
export interface Deporte {
  id_deporte: number;
  nombre_deporte: string;
  url_imagen: string;
}

// Estados de torneos
export type EstadoTorneo = 'inscripcion_abierta' | 'en_curso' | 'finalizado' | 'cancelado';
export type EstadoPartido = 'programado' | 'por_jugar' | 'en_curso' | 'finalizado' | 'suspendido' | 'cancelado';
export type FaseTorneo = 'grupos' | 'octavos' | 'cuartos' | 'semifinal' | 'tercer_lugar' | 'final';

// Torneo
export interface Torneo {
  id_torneo: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  max_equipos: number;
  premio: string;
  estado: EstadoTorneo;
  url_imagen: string;
  costo_inscripcion: string;
  nombre_deporte: string;
  deporte_imagen: string;
  id_deporte: number;
  equipos_inscritos: number;
  estado_calculado?: 'próximo' | 'en_curso' | 'finalizado';
}

// Equipo
export interface Equipo {
  id_equipo: number;
  nombre_equipo: string;
  logo_url: string;
}

// Partido
export interface Partido {
  id_partido: number;
  id_torneo: number;
  fecha_hora: string;
  estado_partido: EstadoPartido;
  goles_local: number | null;
  goles_visitante: number | null;
  penales_local?: number | null;
  penales_visitante?: number | null;
  fase: FaseTorneo;
  numero_jornada: number;

  // Equipos
  equipo_local_id: number;
  equipo_local_nombre: string;
  equipo_local_logo: string;
  equipo_visitante_id: number;
  equipo_visitante_nombre: string;
  equipo_visitante_logo: string;

  // Cancha y sede
  nombre_cancha: string;
  nombre_sede: string;
  sede_direccion: string;

  // Árbitro
  arbitro_nombre?: string;
}

// Clasificación/Tabla de posiciones
export interface Clasificacion {
  id_equipo: number;
  nombre_equipo: string;
  logo_url: string;
  nombre_grupo?: string;
  partidos_jugados: number;
  victorias: number;
  empates: number;
  derrotas: number;
  goles_favor: number;
  goles_contra: number;
  diferencia_goles: number;
  puntos: number;
}

// Estadísticas del usuario
export interface EstadisticasUsuario {
  inscripcionesActivas: number;
  proximosPartidos: number;
  torneosGanados: number;
  victorias: number;
}

// Próximo partido (en inscripciones)
export interface ProximoPartido {
  id_partido: number;
  fecha_hora: string;
  rival: string;
  rival_logo: string;
  es_local: boolean;
}

// Inscripción
export interface Inscripcion {
  id_inscripcion: number;
  id_torneo: number;
  id_equipo: number;
  fecha_inscripcion: string;
  estado_inscripcion: 'pendiente' | 'confirmada' | 'cancelada';
  monto_pagado: string;

  // Información del torneo
  torneo_nombre: string;
  torneo_descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  torneo_estado: EstadoTorneo;
  torneo_imagen: string;
  premio: string;
  max_equipos: number;
  costo_inscripcion: string;

  // Deporte
  nombre_deporte: string;
  deporte_imagen: string;

  // Equipo
  nombre_equipo: string;
  equipo_logo: string;

  // Grupo
  nombre_grupo?: string;

  // Estadísticas
  partidos_jugados: number;
  partidos_pendientes: number;
  proximo_partido?: ProximoPartido;
  equipos_inscritos: number;
}

// Jugador
export interface Jugador {
  id_jugador?: number;
  nombre: string;
  apellido: string;
  numero_camiseta: number;
  posicion: string;
}

// Alineación
export interface Alineacion {
  id_alineacion: number;
  id_equipo: number;
  nombre_equipo: string;
  id_jugador: number;
  jugador_nombre: string;
  numero_camiseta: number;
  posicion: string;
  es_titular: boolean;
  minutos_jugados: number;
}

// Evento del partido
export interface EventoPartido {
  id_evento: number;
  tipo_evento: 'gol' | 'tarjeta_amarilla' | 'tarjeta_roja' | 'cambio' | 'otro';
  minuto: number;
  descripcion: string;
  id_equipo: number;
  nombre_equipo: string;
  id_jugador?: number;
  jugador_nombre?: string;
  numero_camiseta?: number;
}

// Goleador
export interface Goleador {
  jugador: string;
  numero: number;
  minuto: number;
}

// Estadísticas del partido
export interface EstadisticasPartido {
  local: {
    goles: number;
    tarjetas_amarillas: number;
    tarjetas_rojas: number;
    goleadores: Goleador[];
  };
  visitante: {
    goles: number;
    tarjetas_amarillas: number;
    tarjetas_rojas: number;
    goleadores: Goleador[];
  };
}

// Detalle completo del partido
export interface DetallePartido {
  partido: Partido & {
    torneo_nombre: string;
    nombre_deporte: string;
    id_arbitro?: number;
  };
  eventos: EventoPartido[];
  alineaciones: {
    local: Alineacion[];
    visitante: Alineacion[];
  };
  estadisticas: EstadisticasPartido;
}

// Filtros para búsqueda de torneos
export interface FiltrosTorneos {
  deporte?: number;
  estado?: EstadoTorneo;
  busqueda?: string;
  fecha?: string;
  ordenar?: 'fecha_asc' | 'fecha_desc' | 'nombre' | 'popularidad';
}

// DTO para crear inscripción
export interface CrearInscripcionDTO {
  id_torneo: number;
  id_equipo: number;
  jugadores?: Jugador[];
}

// Respuestas de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}
