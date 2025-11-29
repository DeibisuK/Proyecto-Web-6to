import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Partido {
  id_partido: number;
  id_torneo: number;
  torneo_nombre?: string;
  id_sede?: number;
  id_deporte?: number;
  nombre_deporte?: string;
  id_equipo_local: number;
  nombre_equipo_local?: string;
  logo_equipo_local?: string;
  id_equipo_visitante: number;
  nombre_equipo_visitante?: string;
  logo_equipo_visitante?: string;
  fecha_partido: string;
  hora_inicio?: string;
  estado_partido: string;
  resultado_local?: number;
  resultado_visitante?: number;
  id_cancha?: number;
  nombre_cancha?: string;
  sede_nombre?: string;
  id_arbitro?: number;
  nombre_arbitro?: string;
  email_arbitro?: string;
  notas?: string;
}

export interface Usuario {
  id_user: number;
  uid: string;
  name_user: string;
  email_user: string;
  id_rol: number;
  customClaims?: {
    role?: string;
    id_rol?: number;
  };
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
export class PartidosAdminService {
  private apiUrl = `${environment.apiUrl}/c/admin`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los partidos con filtros opcionales
   */
  obtenerPartidos(filtros?: {
    id_torneo?: number;
    estado?: string;
    fecha?: string;
    id_arbitro?: number;
  }): Observable<ApiResponse<Partido[]>> {
    let params = new HttpParams();

    if (filtros?.id_torneo) {
      params = params.set('id_torneo', filtros.id_torneo.toString());
    }
    if (filtros?.estado) {
      params = params.set('estado', filtros.estado);
    }
    if (filtros?.fecha) {
      params = params.set('fecha', filtros.fecha);
    }
    if (filtros?.id_arbitro) {
      params = params.set('id_arbitro', filtros.id_arbitro.toString());
    }

    return this.http.get<ApiResponse<Partido[]>>(`${this.apiUrl}/partidos`, { params });
  }

  /**
   * Obtiene un partido por ID
   */
  obtenerPartidoPorId(id: number): Observable<ApiResponse<Partido>> {
    return this.http.get<ApiResponse<Partido>>(`${this.apiUrl}/partidos/${id}`);
  }

  /**
   * Asigna un árbitro a un partido
   */
  asignarArbitro(idPartido: number, idArbitro: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/partidos/${idPartido}/asignar-arbitro`,
      { id_arbitro: idArbitro }
    );
  }

  /**
   * Remueve el árbitro asignado de un partido
   */
  removerArbitro(idPartido: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/partidos/${idPartido}/remover-arbitro`
    );
  }

  /**
   * Obtiene lista de usuarios con rol árbitro
   */
  obtenerArbitros(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${environment.apiUrl}/u/admin/users/arbitros`);
  }

  /**
   * Actualiza datos de un partido
   */
  actualizarPartido(id: number, datos: Partial<Partido>): Observable<ApiResponse<Partido>> {
    return this.http.put<ApiResponse<Partido>>(`${this.apiUrl}/partidos/${id}`, datos);
  }
}
