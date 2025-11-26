// ===== INTERFACES PARA SISTEMA DE PARTIDOS =====

export interface Evento {
  id_evento?: number;
  id_partido: number;
  id_equipo: number;
  id_jugador?: number;
  tipo_evento: string;
  minuto: number;
  periodo?: number;
  detalles?: any;
  registrado_por?: string;
  fecha_registro?: string;
  // Datos adicionales del JOIN
  nombre_equipo?: string;
  nombre_jugador?: string;
  nombre_evento?: string;
  valor_puntos?: number;
  icono?: string;
  color?: string;
}

export interface RegistrarEventoRequest {
  id_partido: number;
  id_equipo: number;
  id_jugador?: number;
  tipo_evento: string;
  minuto: number;
  periodo?: number;
  detalles?: any;
}

export interface Alineacion {
  id_alineacion?: number;
  id_partido: number;
  id_equipo: number;
  id_jugador: number;
  es_titular: boolean;
  minuto_entrada?: number;
  minuto_salida?: number;
  fecha_creacion?: string;
  // Datos del JOIN
  numero_dorsal?: number;
  nombre_completo?: string;
  posicion?: string;
  nombre_equipo?: string;
}

export interface CrearAlineacionRequest {
  id_partido: number;
  id_equipo: number;
  jugadores: {
    id_jugador: number;
    es_titular: boolean;
  }[];
}

export interface SustitucionRequest {
  id_partido: number;
  id_equipo: number;
  id_jugador_sale: number;
  id_jugador_entra: number;
  minuto: number;
}

export interface EstadoPartidoTiempoReal {
  id_estado?: number;
  id_partido: number;
  tiempo_actual: number;
  estado: 'no_iniciado' | 'corriendo' | 'pausado' | 'detenido' | 'finalizado';
  periodo_actual: number;
  puntuacion_detallada?: any;
  ultima_actualizacion?: string;
}

export interface IniciarCronometroRequest {
  id_partido: number;
  periodo: number;
}

export interface ActualizarTiempoRequest {
  id_partido: number;
  tiempo_actual: number;
}

export interface Clasificacion {
  id_clasificacion?: number;
  id_torneo: number;
  id_fase?: number;
  id_grupo?: number;
  id_equipo: number;
  partidos_jugados: number;
  partidos_ganados: number;
  partidos_empatados: number;
  partidos_perdidos: number;
  puntos_favor: number;
  puntos_contra: number;
  diferencia_puntos: number;
  puntos_clasificacion: number;
  posicion?: number;
  // Datos del JOIN
  nombre_equipo?: string;
  logo_equipo?: string;
}

export interface RecalcularClasificacionRequest {
  id_torneo: number;
  id_fase?: number;
  id_grupo?: number;
}

export interface Jugador {
  id_jugador?: number;
  id_equipo: number;
  id_usuario?: number;
  uid?: string;
  nombre_completo: string;
  numero_dorsal: number;
  posicion?: string;
  es_capitan: boolean;
  estado: 'activo' | 'inactivo' | 'lesionado' | 'suspendido';
  fecha_registro?: string;
  fecha_actualizacion?: string;
  // Datos del JOIN
  nombre_equipo?: string;
  email_usuario?: string;
}

export interface CrearJugadorRequest {
  id_equipo: number;
  id_usuario?: number;
  nombre_completo: string;
  numero_dorsal: number;
  posicion?: string;
  es_capitan?: boolean;
  estado?: string;
}

export interface ConfiguracionEvento {
  id_config?: number;
  id_deporte: number;
  tipo_evento: string;
  nombre_evento: string;
  valor_puntos: number;
  icono?: string;
  color?: string;
  orden: number;
  activo: boolean;
  // Datos del JOIN
  nombre_deporte?: string;
}

export interface Goleador {
  id_jugador: number;
  nombre_completo: string;
  numero_dorsal: number;
  nombre_equipo: string;
  logo_equipo?: string;
  total_goles: number;
  total_puntos: number;
}

export interface EstadisticasJugador {
  tipo_evento: string;
  nombre_evento: string;
  total_eventos: number;
  total_puntos: number;
}
