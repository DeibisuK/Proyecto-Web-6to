import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Partido {
  id_partido: number;
  id_torneo: number;
  torneo_nombre: string;
  nombre_deporte: string;
  fecha_partido: string;
  hora_inicio: string;
  estado_partido: string;
  resultado_local: number;
  resultado_visitante: number;
  equipo_local_id: number;
  equipo_local_nombre: string;
  equipo_local_logo: string;
  equipo_visitante_id: number;
  equipo_visitante_nombre: string;
  equipo_visitante_logo: string;
  nombre_cancha?: string;
  sede_nombre?: string;
  sede_direccion?: string;
  fase_nombre?: string;
  fecha_hora_inicio?: string;
  fecha_hora_fin?: string;
  duracion_minutos?: number;
}

export interface EventoPartido {
  id_evento?: number;
  id_partido: number;
  id_equipo: number;
  id_jugador?: number;
  tipo_evento: string;
  minuto?: number;
  periodo?: string;
  descripcion?: string;
  valor_puntos?: number;
  creado_en?: string;
  nombre_equipo?: string;
  equipo_logo?: string;
  jugador_nombre?: string;
  numero_dorsal?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  total?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PanelArbitroService {
  private apiUrl = `${environment.apiUrl}/m/arbitro`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener mis partidos asignados como árbitro
   */
  obtenerMisPartidos(filtros?: { estado?: string; fecha_desde?: string; fecha_hasta?: string }): Observable<ApiResponse<Partido[]>> {
    let params = new HttpParams();

    if (filtros?.estado) params = params.set('estado', filtros.estado);
    if (filtros?.fecha_desde) params = params.set('fecha_desde', filtros.fecha_desde);
    if (filtros?.fecha_hasta) params = params.set('fecha_hasta', filtros.fecha_hasta);

    return this.http.get<ApiResponse<Partido[]>>(`${this.apiUrl}/partidos`, { params });
  }

  /**
   * Iniciar un partido
   */
  iniciarPartido(idPartido: number): Observable<ApiResponse<Partido>> {
    return this.http.post<ApiResponse<Partido>>(`${this.apiUrl}/partidos/${idPartido}/iniciar`, {});
  }

  /**
   * Pausar un partido en curso
   */
  pausarPartido(idPartido: number): Observable<ApiResponse<Partido>> {
    return this.http.post<ApiResponse<Partido>>(`${this.apiUrl}/partidos/${idPartido}/pausar`, {});
  }

  /**
   * Reanudar un partido pausado
   */
  reanudarPartido(idPartido: number): Observable<ApiResponse<Partido>> {
    return this.http.post<ApiResponse<Partido>>(`${this.apiUrl}/partidos/${idPartido}/reanudar`, {});
  }

  /**
   * Registrar un evento (gol, tarjeta, etc.)
   */
  registrarEvento(idPartido: number, evento: Partial<EventoPartido>): Observable<ApiResponse<EventoPartido>> {
    return this.http.post<ApiResponse<EventoPartido>>(`${this.apiUrl}/partidos/${idPartido}/eventos`, evento);
  }

  /**
   * Obtener eventos de un partido
   */
  obtenerEventos(idPartido: number): Observable<ApiResponse<EventoPartido[]>> {
    return this.http.get<ApiResponse<EventoPartido[]>>(`${this.apiUrl}/partidos/${idPartido}/eventos`);
  }

  /**
   * Finalizar un partido
   */
  finalizarPartido(idPartido: number, datos: { notas_arbitro?: string }): Observable<ApiResponse<Partido>> {
    return this.http.post<ApiResponse<Partido>>(`${this.apiUrl}/partidos/${idPartido}/finalizar`, datos);
  }
}
